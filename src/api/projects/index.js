import express from 'express';
import authorization from '../auth/authorization';
import createProject from './createProject';
import viewProjects from './viewProjects';
import viewProject from './viewProject';
import addCollaborator from './addCollaborator';
import deleteProject from './deleteProject';

const router = express.Router();

router.post('/projects', authorization.getUser, createProject);
router.get('/projects', authorization.getUser, viewProjects);
router.get('/projects/:id', authorization.getUser, viewProject);
router.post('/projects/:id/collaborators', authorization.getUser, addCollaborator);
router.delete('/projects/:id', authorization.getUser, deleteProject);

export default router;