// import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma.js';

// const prisma = new PrismaClient();

/**
 * Traverses up the management chain to ensure the proposed manager 
 * is not already a subordinate of the target employee.
 */
export const checkCircularReporting = async (employeeId: string, proposedManagerId: string): Promise<boolean> => {
  if (employeeId === proposedManagerId) return true; // Cannot manage self

  let currentManagerId: string | null = proposedManagerId;

  while (currentManagerId) {
    const manager = await prisma.employee.findUnique({
      where: { id: currentManagerId },
      select: { managerId: true }
    });

    if (!manager) break;
    if (manager.managerId === employeeId) return true; // Loop detected
    
    currentManagerId = manager.managerId;
  }

  return false;
};

/**
 * Builds a nested JSON hierarchy tree from a flat list of active employees.
 */
export const buildOrganizationTree = async () => {
  // Retrieve all active employees via an optimized query [cite: 103]
  const allEmployees = await prisma.employee.findMany({
    where: { status: 'ACTIVE', isDeleted: false },
    select: { id: true, name: true, designation: true, managerId: true, profileImage: true }
  });

  const employeeMap = new Map();
  const roots: any[] = [];

  // Initialize map
  allEmployees.forEach(emp => {
    employeeMap.set(emp.id, { ...emp, reportees: [] });
  });

  // Build Tree
  allEmployees.forEach(emp => {
    if (emp.managerId && employeeMap.has(emp.managerId)) {
      employeeMap.get(emp.managerId).reportees.push(employeeMap.get(emp.id));
    } else {
      // Top-level entries (managerId: null) 
      roots.push(employeeMap.get(emp.id)); 
    }
  });

  return roots;
};