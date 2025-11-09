/**
 * @fileoverview Test Prisma database connection with better error handling
 * @module scripts/test-db-connection
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('📍 Database URL format:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
    
    // Test connection by querying the database
    await prisma.$connect();
    console.log('✅ Successfully connected to database');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible. Found ${userCount} user(s) in database.`);
    
    // Test if we can query bookings (might fail if migration not run)
    try {
      const bookingCount = await prisma.booking.count();
      console.log(`✅ Bookings table accessible. Found ${bookingCount} booking(s).`);
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('⚠️  Bookings table does not exist yet. Run migration: pnpm prisma migrate dev');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Database connection test passed!');
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    
    if (error.code === 'P1001') {
      console.error('   Cannot reach database server.');
      console.error('   Possible issues:');
      console.error('   - Database server is down or unreachable');
      console.error('   - Incorrect DATABASE_URL in .env.local');
      console.error('   - Network/firewall blocking connection');
      console.error('   - Supabase project might be paused');
    } else if (error.code === 'P1000') {
      console.error('   Authentication failed.');
      console.error('   Check your DATABASE_URL credentials.');
    } else if (error.code === 'P1017') {
      console.error('   Server closed the connection.');
      console.error('   Database might be overloaded or connection pool exhausted.');
    } else {
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
    }
    
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
