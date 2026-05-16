import { Router } from 'express';
import { validationResult } from 'express-validator';
import { register, login } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      detail: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

router.post('/register', registerValidator, handleValidation, register);
router.post('/login', loginValidator, handleValidation, login);

export default router;
