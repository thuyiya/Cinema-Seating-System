import { Router } from 'express';
import { Request, Response } from 'express';
import { User, UserRole, IUser } from '../models/User';
import { generateToken, authenticateJWT, authorizeRole } from '../middleware/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = Router();

// Register new user
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, adminKey } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine user role based on admin key
    const role = adminKey === process.env.ADMIN_SECRET_KEY 
      ? UserRole.ADMIN 
      : UserRole.USER;

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
      role
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token (excluding password)
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token (excluding password)
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user data (requires authentication)
router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      user: userData
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Get all users (admin only)
router.get('/users', 
  authenticateJWT, 
  authorizeRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const users = await User.find({}).select('-password');
      res.json({
        users: users.map(user => ({
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  }
);

export default router; 