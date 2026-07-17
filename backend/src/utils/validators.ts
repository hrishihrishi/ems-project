import { z } from 'zod';
import { Role, Status } from '@prisma/client';

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(2, 'Employee ID must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  salary: z.number().positive('Salary must be a positive number'),
  joiningDate: z.string().datetime({ message: "Invalid ISO 8601 datetime string" }).transform((val) => new Date(val)),
  role: z.nativeEnum(Role).optional().default(Role.EMPLOYEE),
  status: z.nativeEnum(Status).optional().default(Status.ACTIVE),
  managerId: z.string().uuid().nullable().optional(),
  profileImage: z.string().url().nullable().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ password: true });

// Middleware function generator for Express
import { Request, Response, NextFunction } from 'express';
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: `Validation failed ${result}`,
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    return next();
  };
};
