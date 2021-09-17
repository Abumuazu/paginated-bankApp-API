import { Router } from 'express';
import {
  Register,
  getAllUsers,
  signin,
  signout,
} from '../controllers/user.controller';
import { auth } from '../middlewares/Oauth';
import { paginate } from '../middlewares/paginate';
import User from '../models/user.model';

const router = Router();

/* Routes for SIGNUP/SIGN-IN IMPLEMENTATION */
router.post('/register', Register);
router.get('/', auth, paginate(User), getAllUsers);
router.post('/signin', signin);
router.get('/signout', auth, signout);

export default router;
