# Employee Management System (EMS)

A full-stack Employee Management System built as a hiring assignment for a Full Stack Developer role. The application provides secure authentication, role-based access control, employee directory management, organizational hierarchy visualization, dashboard analytics, and file-based employee import/export.

## Overview

This project demonstrates a production-style full-stack implementation with:

- Secure JWT-based authentication and password hashing
- Role-based access control for Super Admin, HR Manager, and Employee roles
- Employee CRUD operations with validation
- Organizational hierarchy and reporting manager assignment
- Dashboard metrics and visual charts
- CSV import/export for employee data
- Soft delete support and PostgreSQL persistence with Prisma

## Features Implemented

### Authentication & Security
- Login and logout flows
- JWT authentication with cookie-based session handling
- Password hashing using bcrypt
- Protected routes and role-based authorization

### Role-Based Access Control
- Super Admin: full access including employee creation, editing, deletion, and manager assignment
- HR Manager: create/edit/view employees, but cannot delete employees or assign Super Admin roles
- Employee: view and edit only their own profile within limited allowed fields

### Employee Management
- Create, read, update, and delete employees
- Fields include employee ID, name, email, phone, department, designation, salary, joining date, status, role, reporting manager, and profile image
- Search by name/email
- Filter by department, role, and status
- Sort by name and joining date
- Pagination support

### Organizational Hierarchy
- Assign reporting managers
- Display reporting tree structure
- Prevent circular reporting relationships
- Show direct reports for each manager

### Dashboard
- Total employees
- Active employees
- Inactive employees
- Department count
- Department distribution charts
- Status breakdown charts
- Dark mode support
- Advanced search, filter and sort

### Data Management
- CSV export of employee data
- CSV import for bulk employee upload
- Soft delete behavior instead of hard deleti

## Deployment & other Links
- Github Repository - https://github.com/hrishihrishi/ems-project
- Deployed on - https://ems-projecr-9mwlqdbue-hrishihs-projects.vercel.app/dashboard
- Demo video - https://drive.google.com/file/d/1K3dZdvR3bjxW88TWsk05SL3ZCtz0AAc3/view?usp=sharing


## Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide Icons

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Multer for CSV upload handling


## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ installed
- npm or pnpm installed
- Docker Desktop (optional, but recommended for PostgreSQL)

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ems-project
```

### 2. Start PostgreSQL

Using Docker Compose:

```bash
docker compose up -d postgres
```

### 3. Configure environment variables

Create a `.env` file inside the backend folder:

```env
DATABASE_URL=postgresql://ems_user:ems_secure_password@localhost:5432/ems_db?schema=public
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
```

### 4. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run Prisma migrations and seed data

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Start the application

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The frontend should now be available at:

- http://localhost:5173

The backend API should run at:

- http://localhost:5000

## Default Login Credentials

Seed data creates the following accounts:

- Super Admin: hrishi@ems.com / password123
- HR Manager: hr@ems.com / password123
- Employee: employee@ems.com / password123

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/logout

### Employees
- GET /api/employees
- POST /api/employees
- GET /api/employees/:id
- PUT /api/employees/:id
- DELETE /api/employees/:id
- POST /api/employees/upload
- GET /api/employees/:id/reportees
- PATCH /api/employees/:id/manager

### Organization
- GET /api/organization/tree

## Assignment Summary

This application fulfills the core requirements of the assignment by implementing:

- Authentication and authorization
- Employee lifecycle management
- Dashboard reporting
- Organizational hierarchy
- Validation and data integrity
- Clean frontend and backend architecture
- Advanced pagination and filtering UI
- Docker-based full-stack deployment setup


## Future Enhancements

Possible improvements for the next iteration:

- Unit and integration tests
- Audit logs and activity tracking
- Improved file upload validation