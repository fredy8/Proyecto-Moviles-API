import express from 'express';
import authorization from '../../auth/authorization';
import viewReport from './viewReport';

const router = express.Router();

router.get('/projects/:projectId/report', authorization.getUser, viewReport);

export default router;
