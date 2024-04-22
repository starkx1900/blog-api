import express from 'express';
import authRoute from './routes/auth.route.js';
import blogRoute from './routes/blogs.route.js';

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoute);
app.use('/blogs', blogRoute);

// catch all route
app.all('*', (req, res) => {
  res.status(404);
  res.json({
    message: 'Not found',
  });
});

export default app;
