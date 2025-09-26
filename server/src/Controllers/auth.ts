import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../Models/user';
import { OAuth2Client } from 'google-auth-library';
import { Wallet } from '../Models/Wallet';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES = '1d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: Generate JWT
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

// ================= Register =================
export const registerUser = async (req: Request, res: Response) => {
  console.log('Registering user with data:', req.body);
  try {
    if (req.body === undefined) {
      return res.status(400).json({ message: 'Body Undefined' });
    }

    const { UserName, email, password, role } = req.body;

    if (!UserName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email  already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      UserName,
      email,
      password: hashedPassword,
      role,
      // isActive will be true by default
    });

    await Wallet.create({
      userId: user._id,
      availableBalance: 0,
      pendingBalance: 0,
      ledger: [],
    });

    const token = generateToken((user._id as any).toString(), user.role);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        UserName: user.UserName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// ================= Login =================
export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log('LOGIN MA ');
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token with user role from DB
    const token = generateToken((user._id as any).toString(), user.role);

    // Send token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Response
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        UserName: user.UserName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// ================= Logout =================
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// ================= Verify =================
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;

    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //Check if user account is still active
    if (!user.isActive) {
      // Clear the cookie since account is deactivated
      res.clearCookie('token');
      return res.status(403).json({
        message: 'Account is deactivated. Please contact support.',
      });
    }

    return res.status(200).json({ message: 'Authenticated', user });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ================= Get Id and Role =================
export const getIdAndRole = async (req: Request, res: Response) => {
  try {
    // Token from cookie
    const token =
      req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    // Check user is still active
    const user = await User.findById(decoded.id).select('isActive');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated. Please contact support.',
      });
    }

    return res.status(200).json({
      id: decoded.id,
      role: decoded.role,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ================= Admin function to toggle user active status =================
export const toggleUserActiveStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'isActive must be a boolean value' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        UserName: user.UserName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// ================= Google Auth =================
export const googleAuthUser = async (req: Request, res: Response) => {
  try {
    console.log('start');
    const { token, role } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    console.log('before userinfo fetch');

    // user info from Google using access_token
    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const payload = await userInfoRes.json();
    console.log('userinfo payload:', payload);

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const email = payload.email;
    const UserName = payload.name || email?.split('@')[0];

    //  if user exists
    let user = await User.findOne({ email });

    if (!user) {
      //  generate random password for DB (not used by Google users)
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        UserName,
        email,
        password: hashedPassword,
        role: role || 'client',
        isActive: true,
        profilePic: payload.picture,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // JWT generate
    const jwtToken = generateToken((user._id as any).toString(), user.role);

    // cookie set
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Google login successful',
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        UserName: user.UserName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ message: 'Google Auth failed', error });
  }
};
