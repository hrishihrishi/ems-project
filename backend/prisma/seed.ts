import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding script...");

  // 1. Generate a generic secure hashed password for test accounts
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("password123", saltRounds);

  // 2. Clear out any previous conflicting data (Clean state strategy)
  await prisma.employee.deleteMany({});

  // 3. Seed the System Super Admin
  const superAdmin = await prisma.employee.create({
    data: {
      employeeId: "EMP001", 
      name: "Hrishi SuperAdmin",
      email: "admin@ems.com",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN", 
      phone: "1234567890",
      department: "Executive",
      designation: "CEO",
      salary: 150000,
      joiningDate: new Date(),
      status: "ACTIVE",
    },
  });
  console.log(`✅ Created Super Admin: ${superAdmin.email}`);

  // 4. Seed the HR Manager (Reports to Super Admin)
  const hrManager = await prisma.employee.create({
    data: {
      employeeId: "EMP002", 
      name: "Sarah HR",
      email: "hr@ems.com",
      passwordHash: hashedPassword,
      role: "HR_MANAGER",
      phone: "9876543210",
      department: "Human Resources",
      designation: "HR Director",
      salary: 85000,
      joiningDate: new Date(),
      status: "ACTIVE",
      managerId: superAdmin.id, // Linking reporting tree
    },
  });
  console.log(`✅ Created HR Manager: ${hrManager.email}`);

  // 5. Seed a Standard Employee (Reports to HR Manager)
  const employee = await prisma.employee.create({
    data: {
      employeeId: "EMP003", 
      name: "John Doe",
      email: "employee@ems.com",
      passwordHash: hashedPassword,
      role: "EMPLOYEE",
      phone: "5551234567",
      department: "Engineering",
      designation: "Software Engineer",
      salary: 65000,
      joiningDate: new Date(),
      status: "ACTIVE",
      managerId: hrManager.id, // Linking reporting tree
    },
  });
  console.log(`✅ Created Standard Employee: ${employee.email}`);

  console.log("✨ Database seeding operation finished cleanly!");
}

main()
  .catch((e) => {
    console.error("❌ Error encountered during seeding runtime:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
