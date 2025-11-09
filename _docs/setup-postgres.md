# PostgreSQL Setup Guide

This guide covers setting up PostgreSQL for both local development and AWS RDS production.

## Option 1: Local PostgreSQL (Recommended for Development)

### Windows Installation

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer from EnterpriseDB
   - Or use: https://www.postgresql.org/download/windows/installer/

2. **Install PostgreSQL**
   - Run the installer
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set a password for the `postgres` superuser (remember this!)
   - Port: 5432 (default)
   - Locale: Default

3. **Verify Installation**
   ```powershell
   psql --version
   ```

4. **Create Database**
   ```powershell
   # Connect to PostgreSQL
   psql -U postgres
   
   # Enter your password when prompted
   
   # Create database
   CREATE DATABASE skyshift;
   
   # Create a user (optional, or use postgres user)
   CREATE USER skyshift_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE skyshift TO skyshift_user;
   
   # Exit
   \q
   ```

5. **Update .env.local**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/skyshift"
   ```
   
   Or if you created a user:
   ```env
   DATABASE_URL="postgresql://skyshift_user:your_password@localhost:5432/skyshift"
   ```

### Alternative: Docker (Easier Setup)

If you have Docker installed:

```powershell
# Run PostgreSQL in Docker
docker run --name skyshift-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=skyshift -p 5432:5432 -d postgres:15

# Update .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skyshift"
```

---

## Option 2: AWS RDS PostgreSQL (For Production)

### Step 1: Create RDS Instance

1. **Go to AWS Console**
   - Navigate to RDS service
   - Click "Create database"

2. **Database Configuration**
   - **Engine**: PostgreSQL
   - **Version**: 15.x or 14.x (recommended)
   - **Template**: Free tier (for development) or Production
   - **DB Instance Identifier**: `skyshift-db`
   - **Master Username**: `skyshift_admin` (or your choice)
   - **Master Password**: Create a strong password (save it!)

3. **Instance Configuration**
   - **DB Instance Class**: `db.t3.micro` (free tier) or larger for production
   - **Storage**: 20 GB (minimum)

4. **Connectivity**
   - **VPC**: Default VPC or your custom VPC
   - **Public Access**: Yes (for development) or No (for production with VPN)
   - **Security Group**: Create new or use existing
   - **Database Port**: 5432

5. **Database Authentication**
   - **Password authentication** (default)

6. **Additional Configuration**
   - **Initial Database Name**: `skyshift`
   - **Backup**: Enable automated backups
   - **Monitoring**: Enable Enhanced monitoring (optional)

7. **Create Database**
   - Click "Create database"
   - Wait 5-10 minutes for provisioning

### Step 2: Configure Security Group

1. **Find Your RDS Instance**
   - Go to RDS → Databases
   - Click on your database instance

2. **Update Security Group**
   - Click on the VPC security group link
   - Click "Edit inbound rules"
   - Add rule:
     - **Type**: PostgreSQL
     - **Port**: 5432
     - **Source**: Your IP address (for development) or VPC CIDR (for production)
   - Save rules

### Step 3: Get Connection Details

1. **Find Endpoint**
   - In RDS console, click your database
   - Copy the **Endpoint** (e.g., `skyshift-db.xxxxx.us-east-1.rds.amazonaws.com`)
   - Note the **Port** (usually 5432)

2. **Update .env.local**
   ```env
   DATABASE_URL="postgresql://skyshift_admin:your_password@skyshift-db.xxxxx.us-east-1.rds.amazonaws.com:5432/skyshift?sslmode=require"
   ```

   **Note**: For AWS RDS, add `?sslmode=require` to enable SSL connection.

---

## Next Steps: Run Migrations

Once your database is set up and `DATABASE_URL` is configured:

```powershell
# 1. Generate Prisma Client
pnpm db:generate

# 2. Run migrations (creates tables)
pnpm db:migrate

# 3. Seed database (creates test users)
pnpm db:seed

# 4. (Optional) Open Prisma Studio to view data
pnpm db:studio
```

---

## Troubleshooting

### Connection Refused
- Check if PostgreSQL is running: `Get-Service postgresql*` (Windows)
- Verify port 5432 is not blocked by firewall
- Check `DATABASE_URL` format is correct

### Authentication Failed
- Verify username and password are correct
- Check if user has permissions on the database

### AWS RDS Connection Issues
- Verify security group allows your IP
- Check if RDS instance is publicly accessible
- Ensure SSL mode is set: `?sslmode=require`
- Check VPC and subnet configurations

### Prisma Migration Errors
- Ensure database exists
- Check `DATABASE_URL` is correct
- Verify user has CREATE TABLE permissions

---

## Test Credentials (After Seeding)

After running `pnpm db:seed`, you can log in with:

- **Student**: `student@skyshift.com` / `password123`
- **Instructor**: `instructor@skyshift.com` / `password123`
- **Admin**: `admin@skyshift.com` / `password123`

