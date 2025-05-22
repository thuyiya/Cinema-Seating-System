import { Request, Response } from 'express';
import { Showtime, IShowtime } from '../models/Showtime';
import { Screen, ISeat } from '../models/Screen';
import mongoose from 'mongoose';

interface ISeatWithId extends ISeat {
  _id: mongoose.Types.ObjectId;
}

export const createShowtime = async (req: Request, res: Response) => {
  try {
    const { movieId, screenId, date, startTime, endTime, price } = req.body;

    // Validate screen exists and get seat counts
    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    // Calculate available seats based on screen configuration
    const availableSeats = {
      REGULAR: screen.sections.reduce((total, section) => 
        total + section.seats.filter(seat => 
          seat.type === 'REGULAR' && seat.status === 'available'
        ).length, 0),
      VIP: screen.sections.reduce((total, section) => 
        total + section.seats.filter(seat => 
          seat.type === 'VIP' && seat.status === 'available'
        ).length, 0),
      ACCESSIBLE: screen.sections.reduce((total, section) => 
        total + section.seats.filter(seat => 
          seat.type === 'ACCESSIBLE' && seat.status === 'available'
        ).length, 0)
    };

    const showtime = new Showtime({
      movieId,
      screenId,
      date,
      startTime,
      endTime,
      price,
      availableSeats
    });

    await showtime.save();
    res.status(201).json(showtime);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'A showtime already exists in this time slot' });
    } else {
      console.error('Error creating showtime:', error);
      res.status(400).json({ message: error.message });
    }
  }
};

export const getShowtimes = async (req: Request, res: Response) => {
  try {
    const { date, screenId } = req.query;
    const movieId = req.params.movieId || req.query.movieId;
    const query: any = {};

    if (date) {
      const searchDate = new Date(date as string);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    if (movieId) {
      try {
        query.movieId = new mongoose.Types.ObjectId(movieId as string);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid movieId format' });
      }
    }

    if (screenId) {
      try {
        query.screenId = new mongoose.Types.ObjectId(screenId as string);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid screenId format' });
      }
    }

    const showtimes = await Showtime.find(query)
      .populate('movieId', 'title duration poster rating')
      .populate('screenId', 'name number')
      .sort({ date: 1, startTime: 1 });

    if (movieId && showtimes.length === 0) {
      return res.status(404).json({ message: 'No showtimes found for this movie' });
    }

    res.json(showtimes);
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    res.status(500).json({ message: 'Error fetching showtimes' });
  }
};

export const getShowtimeById = async (req: Request, res: Response) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId', 'title duration')
      .populate('screenId', 'name number');

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json(showtime);
  } catch (error) {
    console.error('Error fetching showtime:', error);
    res.status(500).json({ message: 'Error fetching showtime' });
  }
};

export const updateShowtime = async (req: Request, res: Response) => {
  try {
    const { price, isActive } = req.body;
    
    // Only allow updating price and active status
    const updateData: Partial<IShowtime> = {};
    if (price !== undefined) updateData.price = price;
    if (isActive !== undefined) updateData.isActive = isActive;

    const showtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json(showtime);
  } catch (error) {
    console.error('Error updating showtime:', error);
    res.status(400).json({ message: 'Error updating showtime' });
  }
};

export const deleteShowtime = async (req: Request, res: Response) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check if the showtime is in the future
    const showtimeDate = new Date(showtime.date);
    const [hours, minutes] = showtime.startTime.split(':').map(Number);
    showtimeDate.setHours(hours, minutes);

    if (showtimeDate < new Date()) {
      return res.status(400).json({ message: 'Cannot delete past showtimes' });
    }

    await showtime.deleteOne();
    res.json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    console.error('Error deleting showtime:', error);
    res.status(500).json({ message: 'Error deleting showtime' });
  }
};

export const getShowtimeSeats = async (req: Request, res: Response) => {
  try {
    const { showtimeId, screenId } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(showtimeId) || !mongoose.Types.ObjectId.isValid(screenId)) {
      return res.status(400).json({ message: 'Invalid showtime or screen ID' });
    }

    // Get the screen details
    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    // Get the showtime details with booked seats
    const showtime = await Showtime.findById(showtimeId)
      .populate('bookedSeats', 'seatId');

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Transform the screen sections into a seating map
    const seatingMap = screen.sections.map(section => {
      const seats = section.seats.map(seat => ({
        id: (seat as ISeatWithId)._id.toString(),
        row: section.rowLabels[seat.row - section.startRow] || seat.row.toString(),
        number: seat.number,
        type: seat.type.toUpperCase(),
        status: seat.status,
        isBooked: seat.status !== 'available' || 
                 (showtime.bookedSeats && showtime.bookedSeats.some(bs => bs.seatId.toString() === (seat as ISeatWithId)._id.toString())),
        position: seat.position,
        preferredView: seat.preferredView
      }));

      return {
        name: section.name,
        seats: seats
      };
    });

    res.json(seatingMap);
  } catch (error) {
    console.error('Error fetching showtime seats:', error);
    res.status(500).json({ message: 'Error fetching seats' });
  }
};