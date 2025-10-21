import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/db';
import { env } from '../../config/env';
import { registerSchema, loginSchema } from './auth.validator';

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid body', errors: parsed.error.flatten() });
  }
  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid body', errors: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    env.jwtSecret,
    { expiresIn: '1d' }
  );

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const me = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!me) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: me });
}
