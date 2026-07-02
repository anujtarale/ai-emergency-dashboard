import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import swaggerSpecs from './config/swagger';
import errorHandler from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { securityMonitor } from './middleware/securityMonitor';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import contactRoutes from './routes/contactRoutes';
import sosRoutes from './routes/sosRoutes';
import reportRoutes from './routes/reportRoutes';
import alertRoutes from './routes/alertRoutes';
import serviceRoutes from './routes/serviceRoutes';
import adminRoutes from './routes/adminRoutes';
import featureRoutes from './routes/featureRoutes';
import { getMaintenanceStatus, updateSettings } from './controllers/adminController';
import { checkFeature, maintenanceGuard } from './middleware/featureGuard';
import { activityLogger } from './middleware/activityLogger';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});

// Public health/maintenance endpoints (before rate limiter)
app.get(`/api/${config.apiVersion}/settings/maintenance`, getMaintenanceStatus);
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

app.use(generalLimiter);
app.use(securityMonitor);
app.use(activityLogger);
app.use(maintenanceGuard);

app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/users`, userRoutes);
app.use(`/api/${config.apiVersion}/contacts`, contactRoutes);
app.use(`/api/${config.apiVersion}/sos`, checkFeature('sos'), sosRoutes);
app.use(`/api/${config.apiVersion}/reports`, checkFeature('community-reports'), reportRoutes);
app.use(`/api/${config.apiVersion}/alerts`, checkFeature('safety-alerts'), alertRoutes);
app.use(`/api/${config.apiVersion}/services`, checkFeature('nearby-services'), serviceRoutes);
app.use(`/api/${config.apiVersion}/admin`, adminRoutes);
app.use(`/api/${config.apiVersion}/features`, featureRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(errorHandler);

export default app;
