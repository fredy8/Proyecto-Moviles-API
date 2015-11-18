import express from 'express';
import authorization from '../auth/authorization';
import getProfile from './getProfile.js';
import editProfile from './editProfile.js';

const router = express.Router();

router.get('/profiles/:id', authorization.getUser, getProfile);
router.put('/profiles/:id', authorization.getUser, editProfile);

export default router;