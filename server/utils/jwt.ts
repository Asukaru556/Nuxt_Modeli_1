import jwt from 'jsonwebtoken';

export const generateToken = (userId: number) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET!, 
    { expiresIn: '1h' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return null;
  }
};