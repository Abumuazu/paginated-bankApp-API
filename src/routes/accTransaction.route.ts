import { Router } from 'express';
import {
  createTransaction,
  retrieveAllUsersTransaction,
  retrieveOneTransaction,
} from '../controllers/accTransaction.controller';
import { auth } from '../middlewares/Oauth';
import { paginate } from '../middlewares/paginate';
import Transaction from '../models/accTransaction.model';

const router = Router();

router.post('/transfer', auth, createTransaction);
router.get('/', auth, paginate(Transaction), retrieveAllUsersTransaction);
router.get('/:_id', auth, retrieveOneTransaction);

export default router;
