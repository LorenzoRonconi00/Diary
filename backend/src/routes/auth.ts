import express, { Request, Response } from 'express';
import User, { IUserDocument } from '../models/User';
import { LoginRequest, LoginResponse } from '../types';

const router = express.Router();

// Login
router.post('/login', async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>) => {
  try {
    const { name } = req.body;
    
    if (!['Ilaria', 'Lorenzo'].includes(name)) {
      return res.status(400).json({ 
        success: false,
        user: { id: '', name: '', avatar: '' }
      });
    }

    let user: IUserDocument | null = await User.findOne({ name });
    if (!user) {
      user = new User({ name });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        name: user.name,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      user: { id: '', name: '', avatar: '' }
    });
  }
});

export default router;