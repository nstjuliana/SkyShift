/**
 * @fileoverview Prisma seed script for initial database data
 * @module prisma/seed
 * 
 * Creates test users: student, instructor, and admin
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed the database with initial test data
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create test student
  const student = await prisma.user.upsert({
    where: { email: 'student@skyshift.com' },
    update: {},
    create: {
      email: 'student@skyshift.com',
      name: 'Test Student',
      password: hashedPassword,
      role: 'STUDENT',
      trainingLevel: 'STUDENT',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created student:', student.email);

  // Create test instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@skyshift.com' },
    update: {},
    create: {
      email: 'instructor@skyshift.com',
      name: 'Test Instructor',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      trainingLevel: 'INSTRUMENT',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created instructor:', instructor.email);

  // Create test admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skyshift.com' },
    update: {},
    create: {
      email: 'admin@skyshift.com',
      name: 'Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
      trainingLevel: 'COMMERCIAL',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin:', admin.email);

  console.log('🎉 Database seed completed!');
  console.log('\nTest credentials:');
  console.log('Student: student@skyshift.com / password123');
  console.log('Instructor: instructor@skyshift.com / password123');
  console.log('Admin: admin@skyshift.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

