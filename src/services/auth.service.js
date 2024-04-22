import bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';
import User from '../database/schema/user.schema.js';
import { ErrorWithStatus } from '../exceptions/error-with-status.exception.js';

export const login = async (email, password) => {
  // Check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorWithStatus('Username or Password is incorrect', 401);
  }

  // Check if password is not correct
  if (!bcrypt.compareSync(password, user.password)) {
    throw new ErrorWithStatus('Username or Password is incorrect', 401);
  }
  // Generate access token
  // const token = Buffer.from(`${user.email}:${user.password}`).toString('base64');

  const token = Jwt.sign(
    {
      _id: user._id,
      email: user.email,
      sub: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );

  return token;
};

export const register = async (first_name, last_name, email, password) => {
  // Check if email exists
  const user = await User.findOne({ email });
  if (user) {
    throw new ErrorWithStatus('User already exists', 400);
  }
  // Create new user
  password = await bcrypt.hash(password, 10);
  const newUser = new User({
    first_name,
    last_name,
    email,
    password,
  });
  await newUser.save();

  delete newUser.password;
  return newUser;
};
