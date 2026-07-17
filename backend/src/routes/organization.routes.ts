import { Router } from 'express';
import { getOrganizationTree } from '../controllers/hierarchy.controller.js';
import { isAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(isAuth);

router.get('/tree', getOrganizationTree);

export default router;
