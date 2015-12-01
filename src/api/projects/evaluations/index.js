import express from 'express';
import authorization from '../../auth/authorization';
import createEvaluation from './createEvaluation';
import getEvaluations from './getEvaluations';
import getEvaluation from './getEvaluation';
import deleteEvaluation from './deleteEvaluation';
import editEvaluation from './editEvaluation';

const router = express.Router();

router.post('/projects/:id/evaluations', authorization.getUser, createEvaluation);
router.get('/projects/:id/evaluations', authorization.getUser, getEvaluations);
router.get('/projects/:projectId/evaluations/:evaluationId', authorization.getUser, getEvaluation);
router.delete('/projects/:projectId/evaluations/:evaluationId', authorization.getUser, deleteEvaluation);
router.put('/projects/:projectId/evaluations/:evaluationId', authorization.getUser, editEvaluation);

export default router;