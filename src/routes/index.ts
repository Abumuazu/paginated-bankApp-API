import { Router } from 'express';

const router = Router();

/* GET home page. */
router.get('/', function (_req, res) {
  res.render('index', { title: 'HealthCheck' });
});

export default router;
