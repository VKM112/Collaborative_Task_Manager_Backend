import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(json());

registerRoutes(app);

app.use(errorHandler);

export default app;
