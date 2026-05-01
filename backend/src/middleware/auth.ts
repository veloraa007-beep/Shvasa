import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  
  // 1. Check for Service Role bypass (for internal scripts/Inngest)
  if (process.env.SERVICE_ROLE_KEY && token === process.env.SERVICE_ROLE_KEY) {
    return next();
  }

  // 2. Verify Supabase JWT
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // 3. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}
