import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma.js';

// const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';
const TOKEN_EXPIRY = '8h';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const employee = await prisma.employee.findUnique({
      where: { email, isDeleted: false },
    });

    if (!employee || employee.status === 'INACTIVE') {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isPasswordMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Secure cookie setup for HTTP-only flows
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
};