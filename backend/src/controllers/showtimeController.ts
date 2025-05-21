import { Request, Response } from 'express';
import { Showtime, IShowtime } from '../models/Showtime';
import { Screen } from '../models/Screen';
import mongoose from 'mongoose';

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
      standard: screen.sections.reduce((total, section) => 
        total + section.seats.filter(seat => 
          seat.type === 'standard' && seat.status === 'available'
        ).length, 0),
      vip: screen.sections.reduce((total, section) => 
        total + section.seats.filter(seat => 
          seat.type === 'vip' && seat.status === 'available'
        ).length, 0),
      accessible: screen.sections.reduce((total, section) => 
        total + section.seats.filter(seat => 
          seat.type === 'accessible' && seat.status === 'available'
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
    const { date, movieId, screenId } = req.query;
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
      query.movieId = new mongoose.Types.ObjectId(movieId as string);
    }

    if (screenId) {
      query.screenId = new mongoose.Types.ObjectId(screenId as string);
    }

    const showtimes = await Showtime.find(query)
      .populate('movieId', 'title duration')
      .populate('screenId', 'name number')
      .sort({ date: 1, startTime: 1 });

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

export const getAvailableTimeSlots = async (req: Request, res: Response) => {
  try {
    const { screenId, date } = req.query;
    
    if (!screenId || !date) {
      return res.status(400).json({ message: 'Screen ID and date are required' });
    }

    const searchDate = new Date(date as string);
    searchDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all showtimes for the screen on the given date
    const showtimes = await Showtime.find({
      screenId: new mongoose.Types.ObjectId(screenId as string),
      date: {
        $gte: searchDate,
        $lt: nextDay
      }
    }).sort({ startTime: 1 });

    // Define business hours (e.g., 10:00 to 23:00)
    const businessHours = {
      start: '10:00',
      end: '23:00'
    };

    // Generate all possible time slots (e.g., every 15 minutes)
    const timeSlots = [];
    let currentTime = businessHours.start;
    while (currentTime <= businessHours.end) {
      const isAvailable = !showtimes.some(showtime => {
        return currentTime >= showtime.startTime && currentTime < showtime.endTime;
      });

      if (isAvailable) {
        timeSlots.push(currentTime);
      }

      // Add 15 minutes
      const [hours, minutes] = currentTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes + 15);
      currentTime = date.toTimeString().slice(0, 5);
    }

    res.json(timeSlots);
  } catch (error) {
    console.error('Error getting available time slots:', error);
    res.status(500).json({ message: 'Error getting available time slots' });
  }
}; 