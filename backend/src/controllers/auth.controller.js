const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);

    if (result.error === 'Email already in use') {
      return res.status(409).json({ detail: result.error });
    }

    if (result.error) {
      return res.status(500).json({ detail: result.error });
    }

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    if (result.error) {
      return res.status(401).json({ message: result.error });
    }

    return res.status(200).json({ access_token: result.access_token, token_type: 'bearer' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
