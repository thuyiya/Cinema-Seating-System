import { Request, Response } from 'express';
import { Screen, IScreen } from '../models/Screen';

export const createScreen = async (req: Request, res: Response) => {
  try {
    const screenData = req.body;
    
    // Ensure sections have default values if not provided
    if (!screenData.sections) {
      screenData.sections = [{
        name: 'Main',
        rows: screenData.rows || 10,
        seatsPerRow: screenData.seatsPerRow || 15,
        startRow: 1,
        rowLabels: Array.from({ length: screenData.rows || 10 }, (_, i) => String.fromCharCode(65 + i)),
        seatLabels: Array.from({ length: screenData.seatsPerRow || 15 }, (_, i) => (i + 1).toString()),
        seats: []
      }];
    }

    // Set default layout if not provided
    if (!screenData.layout) {
      screenData.layout = {
        type: 'straight',
        hasBalcony: false,
        aislePositions: [5, 10] // Default aisle positions
      };
    }

    // Set default seating rules if not provided
    if (!screenData.seatingRules) {
      screenData.seatingRules = {
        allowSplitGroups: false,
        maxGroupSize: 7,
        allowSinglesBetweenGroups: false,
        preferredStartingRows: [3, 4, 5], // Middle rows as preferred
        vipRowsRange: {
          start: 1,
          end: 2
        },
        accessibleSeatsLocations: [{
          row: 1,
          seatStart: 1,
          seatEnd: 4
        }]
      };
    }

    // Calculate total capacity if not provided
    if (!screenData.totalCapacity) {
      screenData.totalCapacity = screenData.sections.reduce((total: number, section: any) => {
        return total + (section.rows * section.seatsPerRow);
      }, 0);
    }

    const screen = new Screen(screenData);
    await screen.save();
    res.status(201).json(screen);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating screen:', error);
      res.status(400).json({ message: 'Error creating screen', error: error.message });
    } else {
      console.error('Unknown error creating screen:', error);
      res.status(400).json({ message: 'Error creating screen' });
    }
  }
};

export const getScreens = async (_req: Request, res: Response) => {
  try {
    const screens = await Screen.find();
    res.json(screens);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching screens:', error);
      res.status(500).json({ message: 'Error fetching screens', error: error.message });
    } else {
      console.error('Unknown error fetching screens:', error);
      res.status(500).json({ message: 'Error fetching screens' });
    }
  }
};

export const getScreenById = async (req: Request, res: Response) => {
  try {
    const screen = await Screen.findById(req.params.id);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }
    res.json(screen);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching screen:', error);
      res.status(500).json({ message: 'Error fetching screen', error: error.message });
    } else {
      console.error('Unknown error fetching screen:', error);
      res.status(500).json({ message: 'Error fetching screen' });
    }
  }
};

export const updateScreen = async (req: Request, res: Response) => {
  try {
    const screenData = req.body;

    // Calculate total capacity if not provided
    if (!screenData.totalCapacity) {
      screenData.totalCapacity = screenData.sections.reduce((total: number, section: any) => {
        return total + (section.rows * section.seatsPerRow);
      }, 0);
    }

    const screen = await Screen.findByIdAndUpdate(
      req.params.id,
      screenData,
      { new: true, runValidators: true }
    );
    
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }
    
    res.json(screen);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating screen:', error);
      res.status(400).json({ message: 'Error updating screen', error: error.message });
    } else {
      console.error('Unknown error updating screen:', error);
      res.status(400).json({ message: 'Error updating screen' });
    }
  }
};

export const deleteScreen = async (req: Request, res: Response) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }
    res.json({ message: 'Screen deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting screen:', error);
      res.status(500).json({ message: 'Error deleting screen', error: error.message });
    } else {
      console.error('Unknown error deleting screen:', error);
      res.status(500).json({ message: 'Error deleting screen' });
    }
  }
};