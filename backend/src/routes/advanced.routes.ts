import { Router } from 'express';
import multer from 'multer';
import { updateManager, getOrganizationTree, getDirectReports } from '../controllers/hierarchy.controller.js';
import { uploadBulkEmployees } from '../controllers/upload.controller.js';
import { isAuth, authorize } from '../middleware/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

// Setup Multer memory storage stream 
const upload = multer({ storage: multer.memoryStorage() });

router.use(isAuth);

// Hierarchy Routes
router.patch('/:id/manager', authorize([Role.SUPER_ADMIN, Role.HR_MANAGER]), updateManager);
router.get('/tree', getOrganizationTree);
router.get('/:id/reportees', getDirectReports);

// Bulk Upload Route
router.post('/upload', authorize([Role.SUPER_ADMIN, Role.HR_MANAGER]), upload.single('file'), uploadBulkEmployees);

export default router;