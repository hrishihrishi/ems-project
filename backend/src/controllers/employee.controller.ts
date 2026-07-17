import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.js';

// const prisma = new PrismaClient();

// 1. CREATE EMPLOYEE
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    const existing = await prisma.employee.findFirst({
      where: { OR: [{ email: data.email }, { employeeId: data.employeeId }] }
    });
    if (existing) {
      return res.status(400).json({ error: 'Employee with this email or Employee ID already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...employeeData } = data;

    const newEmployee = await prisma.employee.create({
      data: { ...employeeData, passwordHash },
      select: { id: true, employeeId: true, name: true, email: true, department: true, role: true, status: true }
    });

    return res.status(201).json(newEmployee);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error while creating employee' });
  }
};

// 2. GET ALL EMPLOYEES (Search, Filter, Paginate)
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { search, department, role, status, sortBy = 'name', order = 'asc', page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Strict Query Constraints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { isDeleted: false };

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (department) whereClause.department = department as string;
    if (role) whereClause.role = role as any;
    if (status) whereClause.status = status as any;

    // RBAC Field Protection: Regular employees only see active users and basic info
    const currentUser = req.user!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldSelection: any = {
      id: true, employeeId: true, name: true, email: true, phone: true,
      department: true, designation: true, joiningDate: true, status: true,
      role: true, managerId: true, profileImage: true
    };
    
    if (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.HR_MANAGER) {
      fieldSelection.salary = true; // Expose salary strictly to admins and HR
    }

    const [employees, totalCount] = await prisma.$transaction([
      prisma.employee.findMany({
        where: whereClause,
        select: fieldSelection,
        orderBy: { [sortBy as string]: order as 'asc' | 'desc' },
        skip,
        take: limitNum
      }),
      prisma.employee.count({ where: whereClause })
    ]);

    return res.status(200).json({
      meta: { totalCount, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalCount / limitNum) },
      data: employees
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching records' });
  }
};

// 3. GET SINGLE EMPLOYEE
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Regular employees can only inspect their own full record
    if (currentUser.role === Role.EMPLOYEE && currentUser.id !== id) {
      return res.status(403).json({ error: 'Access denied: Cannot view another profile' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id, isDeleted: false },
      include: { manager: { select: { id: true, name: true, email: true } } }
    });

    if (!employee) return res.status(404).json({ error: 'Employee profile not found' });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...cleanData } = employee;
    if (currentUser.role === Role.EMPLOYEE) {
      // Remove salary display dynamically if self-inspecting employee is restricted
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (cleanData as any).salary;
    }

    return res.status(200).json(cleanData);
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving employee' });
  }
};

// 4. UPDATE EMPLOYEE (Soft RBAC boundaries apply)
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    const updates = req.body;

    // Validation Guard: Employee can only edit limited details on their own profile
    if (currentUser.role === Role.EMPLOYEE) {
      if (currentUser.id !== id) {
        return res.status(403).json({ error: 'Unauthorized profile access modification' });
      }
      // Strip out admin/HR fields if submitted maliciously by an employee
      delete updates.salary;
      delete updates.role;
      delete updates.status;
      delete updates.managerId;
      delete updates.employeeId;
    }

    const target = await prisma.employee.findUnique({ where: { id, isDeleted: false } });
    if (!target) return res.status(404).json({ error: 'Target employee not found' });

    // HR cannot elevate someone to SuperAdmin or edit a SuperAdmin profile
    if (currentUser.role === Role.HR_MANAGER && (target.role === Role.SUPER_ADMIN || updates.role === Role.SUPER_ADMIN)) {
      return res.status(403).json({ error: 'HR Managers cannot modify Super Admin scopes' });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updates
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...payload } = updatedEmployee;
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ error: 'Error modifying record data' });
  }
};

// 5. SOFT DELETE EMPLOYEE (Strictly Super Admin allowed via Router access rules)
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const target = await prisma.employee.findUnique({ where: { id, isDeleted: false } });
    if (!target) return res.status(404).json({ error: 'Employee record does not exist' });

    // Implement explicit Soft Delete behavior
    await prisma.employee.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'INACTIVE',
        deletedAt: new Date(),
        managerId: null // Sever relationship tree links gracefully on deletion
      }
    });

    return res.status(200).json({ message: 'Employee record safely soft-deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error during soft deletion routing runtime' });
  }
};