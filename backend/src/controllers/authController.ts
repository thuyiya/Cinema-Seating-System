import { Request, Response } from 'express';
import { Admin } from '../models/Admin';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    // Remove password from response
    const { password: _, ...adminData } = admin.toJSON();

    res.status(201).json(adminData);
  } catch (err) {
    console.error('Error in admin registration:', err);
    res.status(500).json({ error: 'Failed to register admin' });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await admin.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...adminData } = admin.toJSON();

    res.json({
      token,
      user: adminData
    });
  } catch (err) {
    console.error('Error in admin login:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
}; 