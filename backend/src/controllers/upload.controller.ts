import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import bcrypt from 'bcrypt';
import { createEmployeeSchema } from '../utils/validators.js';
import { prisma } from '../utils/prisma.js';

// const prisma = new PrismaClient();

export const uploadBulkEmployees = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results: any[] = [];
  const errors: any[] = [];
  let rowIndex = 1;

  // Convert multer buffer to readable stream
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csvParser())
    .on('data', (data) => {
      rowIndex++;
      // Format data from CSV strings to standard formats
      const formattedData = {
        ...data,
        salary: parseFloat(data.salary),
      };

      const validation = createEmployeeSchema.safeParse(formattedData);
      
      if (!validation.success) {
        errors.push({ row: rowIndex, issues: validation.error.flatten().fieldErrors });
      } else {
        results.push(validation.data);
      }
    })
    .on('end', async () => {
      if (errors.length > 0) {
        // Structural atomicity: Fail the whole batch if any row fails validation
        return res.status(400).json({ error: 'Validation failed for one or more rows', details: errors });
      }

      try {
        // Execute inside an automated SQL transaction block 
        await prisma.$transaction(async (tx) => {
          for (const emp of results) {
            const passwordHash = await bcrypt.hash(emp.password, 10);
            const { password, ...safeData } = emp;
            
            await tx.employee.create({
              data: { ...safeData, passwordHash }
            });
          }
        });

        return res.status(201).json({ message: `Successfully imported ${results.length} employees.` });
      } catch (txError) {
        return res.status(500).json({ error: 'Database transaction failed during import. No records were saved.' });
      }
    });
};