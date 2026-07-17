import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

// Routing Endpoints Mounted Cleanly
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', organizationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`[SERVER RUNNING]: Mode=${process.env.NODE_ENV} | Listening on port ${PORT}`);
});

export default app;
