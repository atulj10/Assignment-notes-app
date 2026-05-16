const { Router } = require('express');
const { register, login } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

module.exports = router;
