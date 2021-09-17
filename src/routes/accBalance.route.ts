import { Router } from 'express';
import {
  createAccount,
  retrieveAllUsersBalance,
  retrieveIndividualBalance,
} from '../controllers/accBalance.controller';
import { auth } from '../middlewares/Oauth';
import { paginate } from '../middlewares/paginate';

import Account from '../models/accBalance.model';

const router = Router();

router.post('/create', auth, createAccount);
router.get('/balance', auth, paginate(Account), retrieveAllUsersBalance);
router.get('/balance/:accountNumber', auth, retrieveIndividualBalance);
export default router;
