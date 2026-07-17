import { Router } from 'express';
import multer from 'multer';
import { 
  createEmployee, 
  getEmployees, 
  getEmployeeById, 
  updateEmployee, 
  deleteEmployee 
} from '../controllers/employee.controller.js';
import { updateManager, getDirectReports } from '../controllers/hierarchy.controller.js';
import { uploadBulkEmployees } from '../controllers/upload.controller.js';
import { isAuth, authorize } from '../middleware/auth.middleware.js';
import { validateBody, createEmployeeSchema, updateEmployeeSchema } from '../utils/validators.js';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply auth middleware to all employee endpoints globally
router.use(isAuth);

// Bulk Upload (Must be before /:id so it doesn't match as an ID)
router.post(
  '/upload', 
  authorize([Role.SUPER_ADMIN, Role.HR_MANAGER]), 
  upload.single('file'), 
  uploadBulkEmployees
);

router.post(
  '/', 
  authorize([Role.SUPER_ADMIN, Role.HR_MANAGER]), 
  validateBody(createEmployeeSchema), 
  createEmployee
);

router.get('/', getEmployees);

router.get('/:id', getEmployeeById);

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

// Hierarchy specific endpoints mapped to /api/employees/:id/*
router.get('/:id/reportees', getDirectReports);

router.patch(
  '/:id/manager',
  authorize([Role.SUPER_ADMIN]), // Super Admin only as per RBAC requirements
  updateManager
);

export default router;
