import express from 'express';
import authorization from '../../auth/authorization';
import createEvaluation from './createEvaluation';

const router = express.Router();

router.post('/projects/:id/evaluations', authorization.getUser, createEvaluation);

export default router;