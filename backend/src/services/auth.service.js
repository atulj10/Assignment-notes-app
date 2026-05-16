import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ error: string | null }>}
 */
export async function register(email, password) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return { error: 'Email already in use' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({ data: { email, hashedPassword } });

  return { error: null };
}

/**
 * Login a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string | null, error: string | null }>}
 */
export async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { access_token: null, error: 'Invalid email or password' };
  }

  const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!passwordMatch) {
    return { access_token: null, error: 'Invalid email or password' };
  }

  const payload = {
    sub: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
  };

  const access_token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

  return { access_token, error: null };
}
