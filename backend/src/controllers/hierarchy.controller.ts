import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { checkCircularReporting, buildOrganizationTree } from '../services/hierarchy.service.js';
import { prisma } from '../utils/prisma.js';

// const prisma = new PrismaClient();

export const updateManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    if (!managerId) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }

    const hasLoop = await checkCircularReporting(id, managerId);
    if (hasLoop) {
      return res.status(400).json({ error: 'Circular reporting loop detected. Assignment failed.' });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { managerId }
    });

    return res.status(200).json(updatedEmployee);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update manager structure' });
  }
};

export const getOrganizationTree = async (_req: Request, res: Response) => {
  try {
    const tree = await buildOrganizationTree();
    return res.status(200).json(tree);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate organization tree' });
  }
};

export const getDirectReports = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const reportees = await prisma.employee.findMany({
      where: { managerId: id, isDeleted: false },
      select: { id: true, name: true, designation: true, department: true, email: true }
    });

    return res.status(200).json(reportees);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch direct reports' });
  }
};