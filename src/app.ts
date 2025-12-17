import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import userRoutes from './routes/user.routes';
import { handleCorsOrigin } from './config/cors';
import { tryFixLooseJson } from './utils/json.util';

type RawBodyRequest = Request & { rawBody?: string };

const app = express();

// Express must trust Render's SSL termination so secure cookies work.
app.set('trust proxy', 1);

app.use(helmet());

app.use(
  cors({
    origin: handleCorsOrigin,
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req: RawBodyRequest, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use((err: unknown, req: RawBodyRequest, _res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && req.rawBody) {
    const repaired = tryFixLooseJson(req.rawBody);
    if (repaired) {
      try {
        req.body = JSON.parse(repaired);
        return next();
      } catch {
        // fall through to the default error handler
      }
    }
  }
  next(err);
});

app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

app.use(errorHandler);

export default app;
