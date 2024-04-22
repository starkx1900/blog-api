import * as authService from '../services/auth.service.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.json({
      message: 'Login successful',
      data: {
        accessToken: token,
      },
    });
  } catch (err) {
    res.status(err.status || 500);
    res.json({ message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const newUser = await authService.register(
      first_name,
      last_name,
      email,
      password
    );
    res.json({
      message: 'User created successfully',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(err.status || 500);
    res.json({ message: err.message });
  }
};
