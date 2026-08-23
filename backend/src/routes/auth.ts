import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { Role } from '@prisma/client';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure valid role
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as Role,
      },
    });

    // Generate token
    const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({ user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, token });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
