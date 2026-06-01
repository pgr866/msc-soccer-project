import createError, { type HttpError } from 'http-errors';
import express from 'express';
import { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocs } from './src/config/openapi.js';
import apiRouter from './src/routes/index.js';
import { connectDB } from './src/config/db.js';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 environment variable is missing.");
  }
  const decodedJsonString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(decodedJsonString);
  initializeApp({ credential: cert(serviceAccount) });
} else {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8088';
  initializeApp({ projectId: 'msc-soccer-project' });
}
console.log(`Firebase Admin initialized in ${process.env.NODE_ENV || 'development'} mode.`);

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
app.use(helmet());
app.use(logger('dev'));

const allowedOrigin = process.env.IONIC_APP_URL || '';

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (isProd) {
      if (origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
  maxAge: 3600
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api', apiRouter);

app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later."
});
app.use('/api/', limiter);

if (process.env.NODE_ENV === 'development') {
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      validatorUrl: null
    }
  };
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));
}

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

export default app;
