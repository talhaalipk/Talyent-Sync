import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
    }
  }
}

// Define AuthRequest type (extends Express Request with `user`)
export interface AuthRequest extends Express.Request {
  user?: Express.User;
}
