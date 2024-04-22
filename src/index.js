import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connect } from './database/connection.js';

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

connect(MONGO_URL).then(() => {
  console.log('Connected to DB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
