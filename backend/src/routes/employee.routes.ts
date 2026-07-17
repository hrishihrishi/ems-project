import { Router } from 'express';
import { 
  createEmployee, 
  getEmployees, 
  getEmployeeById, 
  updateEmployee, 
  deleteEmployee 
} from '../controllers/employee.controller.js';
import { isAuth, authorize } from '../middleware/auth.middleware.js';
import { validateBody, createEmployeeSchema, updateEmployeeSchema } from '../utils/validators.js';
import { Role } from '@prisma/client';

const router = Router();

// Apply auth middleware to all employee endpoints globally
router.use(isAuth);

router.post(
  '/', 
  authorize([Role.SUPER_ADMIN, Role.HR_MANAGER]), 
  validateBody(createEmployeeSchema), 
  createEmployee
);

router.get(
  '/', 
  getEmployees
);

router.get(
  '/:id', 
  getEmployeeById
);

router.put(
  '/:id', 
  validateBody(updateEmployeeSchema), 
  updateEmployee
);

router.delete(
  '/:id', 
  authorize([Role.SUPER_ADMIN]), 
  deleteEmployee
);

export default router;