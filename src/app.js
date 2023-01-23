import express from 'express';
import cors from 'cors';
import AuthRouter from './routes/AuthRouter.js';
import TransfersRouter from './routes/TransfersRouter.js';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.use([AuthRouter,TransfersRouter]);

app.listen(PORT, () => console.log(`The app starts on PORT: ${PORT}`));