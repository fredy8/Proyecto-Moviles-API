import express from 'express';
import authorization from '../../auth/authorization';
import createEvaluation from './createEvaluation';
import getEvaluations from './getEvaluations';
import getEvaluation from './getEvaluation';

const router = express.Router();

router.post('/projects/:id/evaluations', authorization.getUser, createEvaluation);
router.get('/projects/:id/evaluations', authorization.getUser, getEvaluations);
router.get('/projects/:projectId/evaluations/:evaluationId', authorization.getUser, getEvaluation);

export default router;