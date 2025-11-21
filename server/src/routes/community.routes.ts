import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createHelpRequestSchema,
  updateHelpRequestSchema,
  createDonationSchema,
  createReportSchema
} from '../validators/community.validator';
import {
  getHelpRequests,
  getHelpRequest,
  createHelpRequest,
  updateHelpRequest,
  deleteHelpRequest,
  createDonation,
  createReport
} from '../controllers/community.controller';

const router = Router();

// Public routes (anyone can view help requests)
router.get('/', getHelpRequests);
router.get('/:id', getHelpRequest);

// Protected routes (require authentication)
router.post('/', authenticate, validateRequest(createHelpRequestSchema), createHelpRequest);
router.put('/:id', authenticate, validateRequest(updateHelpRequestSchema), updateHelpRequest);
router.delete('/:id', authenticate, deleteHelpRequest);
router.post('/donate', authenticate, validateRequest(createDonationSchema), createDonation);
router.post('/report', authenticate, validateRequest(createReportSchema), createReport);

export default router;
