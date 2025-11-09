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

  // Create sample bookings with various dates
  const now = new Date();
  
  // Flights > 4 days away (will use OpenWeather)
  const futureDate1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days
  const futureDate2 = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days
  const futureDate3 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  // Flights < 4 days away (will use Tomorrow.io)
  const nearDate1 = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
  const nearDate2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
  const nearDate3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  
  // Flight in next 24 hours
  const tomorrowDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours

  const departureLocation = {
    name: 'KJFK - John F. Kennedy International',
    latitude: 40.6413,
    longitude: -73.7781,
    icaoCode: 'KJFK',
  };

  const destinationLocation = {
    name: 'KLGA - LaGuardia Airport',
    latitude: 40.7769,
    longitude: -73.8740,
    icaoCode: 'KLGA',
  };

  // Create bookings > 4 days away
  await prisma.booking.createMany({
    data: [
      {
        studentId: student.id,
        instructorId: instructor.id,
        scheduledDate: futureDate1,
        trainingLevel: 'STUDENT',
        duration: 1.5,
        departureLocation,
        status: 'SCHEDULED',
      },
      {
        studentId: student.id,
        instructorId: instructor.id,
        scheduledDate: futureDate2,
        trainingLevel: 'PRIVATE',
        duration: 2.0,
        departureLocation,
        destinationLocation,
        status: 'SCHEDULED',
      },
      {
        studentId: student.id,
        instructorId: instructor.id,
        scheduledDate: futureDate3,
        trainingLevel: 'INSTRUMENT',
        duration: 2.5,
        departureLocation,
        status: 'SCHEDULED',
      },
    ],
  });

  console.log('✅ Created 3 bookings > 4 days away (OpenWeather)');

  // Create bookings < 4 days away
  await prisma.booking.createMany({
    data: [
      {
        studentId: student.id,
        instructorId: instructor.id,
        scheduledDate: nearDate1,
        trainingLevel: 'STUDENT',
        duration: 1.5,
        departureLocation,
        status: 'SCHEDULED',
      },
      {
        studentId: student.id,
        instructorId: instructor.id,
        scheduledDate: nearDate2,
        trainingLevel: 'PRIVATE',
        duration: 2.0,
        departureLocation,
        status: 'AT_RISK',
        cancellationProbability: 45,
        riskLevel: 'MODERATE',
      },
      {
        studentId: student.id,
        instructorId: instructor.id,
        scheduledDate: nearDate3,
        trainingLevel: 'INSTRUMENT',
        duration: 2.5,
        departureLocation,
        destinationLocation,
        status: 'SCHEDULED',
      },
      {
        studentId: student.id,
        instructorId: instructor.id,
        scheduledDate: tomorrowDate,
        trainingLevel: 'STUDENT',
        duration: 1.0,
        departureLocation,
        status: 'AT_RISK',
        cancellationProbability: 75,
        riskLevel: 'HIGH',
      },
    ],
  });

  console.log('✅ Created 4 bookings < 4 days away (Tomorrow.io)');

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

