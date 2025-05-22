import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/User';

// Extend Express types
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

export const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
};

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: IUser, info: any) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

export const authenticateJWTOptional = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: IUser, info: any) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  };
};

export const validateAdminSecretKey = (req: Request, res: Response, next: NextFunction) => {
  const secretKey = req.headers['admin-secret-key'];
  
  if (!ADMIN_SECRET_KEY || secretKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Invalid admin secret key' });
  }
  
  next();
}; 