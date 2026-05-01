import { Request, Response, NextFunction } from 'express';
// Assuming supabase-js is installed or will be
// import { createClient } from '@supabase/supabase-js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  
  // NOTE: In production, this MUST use supabase.auth.getUser(token)
  // to verify the JWT and extract the user object.
  // For now, we enforce a strict check. No development bypasses.
  
  if (token === process.env.SERVICE_ROLE_KEY) {
    // Internal service-to-service auth if needed
    return next();
  }

  // TODO: Implement actual Supabase JWT validation
  // const { data: { user }, error } = await supabase.auth.getUser(token);
  // if (error || !user) return res.status(401).json({ error: 'Invalid session' });
  // (req as any).user = user;

  return res.status(401).json({ error: 'Authentication required' });
}
