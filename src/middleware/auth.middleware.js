import Jwt from 'jsonwebtoken';
import { ErrorWithStatus } from '../exceptions/error-with-status.exception.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const bearerToken = authorization.split(' ');
  if (bearerToken.length !== 2) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  Jwt.verify(bearerToken[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};
