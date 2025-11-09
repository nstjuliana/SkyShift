# AWS Deployment Guide for SkyShift

This guide covers deploying SkyShift to AWS, including database setup, application deployment, and environment configuration.

## Overview

**Key Principle**: Use **AWS RDS** for the database (not Docker containers). Docker containers are fine for the application, but databases should use managed services in production.

---

## Architecture Overview

```
┌─────────────────┐
│   AWS RDS       │  ← Managed PostgreSQL (Production Database)
│   PostgreSQL    │
└─────────────────┘
         ↑
         │
┌─────────────────┐
│  Next.js App    │  ← Your Application (EC2/ECS/Lambda/Vercel)
│  (Container)    │
└─────────────────┘
```

---

## Part 1: Database Setup (AWS RDS)

### Step 1: Create RDS PostgreSQL Instance

1. **Go to AWS Console → RDS**
   - Click "Create database"
   - Choose "Standard create"

2. **Engine Options**
   - **Engine**: PostgreSQL
   - **Version**: 15.x (or 14.x) - match your local version
   - **Templates**: 
     - **Production**: For production workloads
     - **Dev/Test**: For staging (cheaper)

3. **Settings**
   - **DB Instance Identifier**: `skyshift-prod-db` (or your choice)
   - **Master Username**: `skyshift_admin` (or your choice)
   - **Master Password**: Generate a strong password (save it securely!)

4. **Instance Configuration**
   - **DB Instance Class**: 
     - **Production**: `db.t3.medium` or larger
     - **Staging**: `db.t3.micro` (free tier eligible)
   - **Storage**: 
     - **Type**: General Purpose SSD (gp3)
     - **Size**: 20 GB minimum (scale as needed)
     - **Storage Autoscaling**: Enable (recommended)

5. **Connectivity**
   - **VPC**: Default VPC or your custom VPC
   - **Subnet Group**: Default or create custom
   - **Public Access**: 
     - **No** (recommended for production - use VPN/Bastion)
     - **Yes** (only if you need direct access, less secure)
   - **VPC Security Group**: Create new or use existing
   - **Availability Zone**: No preference (or choose specific)
   - **Database Port**: 5432

6. **Database Authentication**
   - **Password authentication** (default)

7. **Additional Configuration**
   - **Initial Database Name**: `skyshift`
   - **DB Parameter Group**: Default
   - **Backup**: 
     - **Automated Backups**: Enable
     - **Backup Retention**: 7 days (minimum)
     - **Backup Window**: Choose off-peak hours
   - **Monitoring**: 
     - **Enhanced Monitoring**: Enable (optional but recommended)
   - **Maintenance**: 
     - **Auto Minor Version Upgrade**: Enable
     - **Maintenance Window**: Choose off-peak hours

8. **Create Database**
   - Click "Create database"
   - Wait 5-15 minutes for provisioning

### Step 2: Configure Security Group

1. **Find Your RDS Instance**
   - Go to RDS → Databases
   - Click your database instance
   - Note the **VPC Security Group** name

2. **Edit Inbound Rules**
   - Go to EC2 → Security Groups
   - Find your RDS security group
   - Click "Edit inbound rules"
   - Add rule:
     - **Type**: PostgreSQL
     - **Port**: 5432
     - **Source**: 
       - **For Production**: Your application's security group (recommended)
       - **For Development**: Your IP address (temporary)
   - Save rules

### Step 3: Get Connection Details

1. **Find Endpoint**
   - In RDS console → Your database
   - Copy the **Endpoint** (e.g., `skyshift-prod-db.xxxxx.us-east-1.rds.amazonaws.com`)
   - Note the **Port** (usually 5432)

2. **Connection String Format**
   ```
   postgresql://username:password@endpoint:port/database?sslmode=require
   ```

3. **Example**
   ```env
   DATABASE_URL="postgresql://skyshift_admin:your_password@skyshift-prod-db.xxxxx.us-east-1.rds.amazonaws.com:5432/skyshift?sslmode=require"
   ```

### Step 4: Run Migrations on RDS

**Option A: From Your Local Machine (Temporary Access)**

```powershell
# Set production DATABASE_URL temporarily
$env:DATABASE_URL="postgresql://skyshift_admin:password@endpoint:5432/skyshift?sslmode=require"

# Run migrations
pnpm prisma migrate deploy

# Seed initial data (if needed)
pnpm db:seed
```

**Option B: From EC2 Instance (Recommended)**

1. SSH into your EC2 instance
2. Clone your repository
3. Set environment variables
4. Run migrations

**Option C: Using AWS Systems Manager Session Manager**

- Use AWS Systems Manager to run commands on EC2 without SSH

---

## Part 2: Application Deployment Options

### Option 1: AWS Elastic Beanstalk (Easiest)

**Best for**: Quick deployment, managed infrastructure

1. **Install EB CLI**
   ```powershell
   pip install awsebcli
   ```

2. **Initialize EB**
   ```powershell
   eb init -p "Node.js" -r us-east-1 skyshift-app
   ```

3. **Create Environment**
   ```powershell
   eb create skyshift-prod
   ```

4. **Set Environment Variables**
   ```powershell
   eb setenv DATABASE_URL="your-rds-connection-string" AUTH_SECRET="your-secret" NEXTAUTH_URL="https://your-domain.com"
   ```

5. **Deploy**
   ```powershell
   eb deploy
   ```

### Option 2: AWS ECS with Fargate (Containerized)

**Best for**: Container-based deployments, auto-scaling

1. **Create Dockerfile** (if not exists)
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json pnpm-lock.yaml* ./
   RUN corepack enable && corepack prepare pnpm@latest --activate
   RUN pnpm install --frozen-lockfile
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN corepack enable && corepack prepare pnpm@latest --activate
   RUN pnpm prisma generate
   RUN pnpm build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Update next.config.js** for standalone output
   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone', // For Docker deployment
   }
   ```

3. **Build and Push to ECR**
   ```powershell
   # Create ECR repository
   aws ecr create-repository --repository-name skyshift

   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   # Build and tag
   docker build -t skyshift .
   docker tag skyshift:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/skyshift:latest

   # Push
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/skyshift:latest
   ```

4. **Create ECS Task Definition**
   - Use AWS Console or CloudFormation
   - Set environment variables in task definition
   - Use AWS Secrets Manager for sensitive values

5. **Create ECS Service**
   - Configure load balancer
   - Set desired task count
   - Enable auto-scaling

### Option 3: AWS EC2 (Traditional)

**Best for**: Full control, custom configurations

1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 or Ubuntu
   - Instance type: t3.medium or larger
   - Configure security group (allow port 3000)

2. **Install Dependencies**
   ```bash
   # SSH into instance
   sudo yum update -y
   sudo yum install -y nodejs npm git
   
   # Install pnpm
   npm install -g pnpm
   ```

3. **Clone and Build**
   ```bash
   git clone your-repo-url
   cd SkyShift
   pnpm install
   pnpm build
   ```

4. **Set Environment Variables**
   ```bash
   # Create .env file
   sudo nano .env
   # Add your environment variables
   ```

5. **Run with PM2**
   ```bash
   npm install -g pm2
   pm2 start "pnpm start" --name skyshift
   pm2 save
   pm2 startup
   ```

### Option 4: Vercel (Easiest for Next.js)

**Best for**: Next.js apps, serverless, automatic deployments

1. **Connect Repository**
   - Go to vercel.com
   - Import your GitHub repository

2. **Set Environment Variables**
   - Add all required env vars in Vercel dashboard
   - Use Vercel's environment variable management

3. **Deploy**
   - Automatic on every push to main branch
   - Or manual deploy from dashboard

**Note**: Vercel is not AWS, but it's the easiest option for Next.js. If you must use AWS, consider the other options.

---

## Part 3: Environment Variables Management

### Using AWS Systems Manager Parameter Store

**Recommended for**: Secure, centralized configuration

1. **Store Secrets**
   ```powershell
   aws ssm put-parameter --name "/skyshift/prod/DATABASE_URL" --value "postgresql://..." --type "SecureString"
   aws ssm put-parameter --name "/skyshift/prod/AUTH_SECRET" --value "your-secret" --type "SecureString"
   ```

2. **Retrieve in Application**
   ```typescript
   import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
   
   const ssm = new SSMClient({ region: "us-east-1" });
   const param = await ssm.send(new GetParameterCommand({
     Name: "/skyshift/prod/DATABASE_URL",
     WithDecryption: true
   }));
   ```

### Using AWS Secrets Manager

**Recommended for**: Rotating secrets, automatic rotation

1. **Create Secret**
   ```powershell
   aws secretsmanager create-secret --name skyshift/prod/database --secret-string "postgresql://..."
   ```

2. **Retrieve in Application**
   ```typescript
   import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
   ```

---

## Part 4: Migration Strategy

### Moving from Local Docker to AWS RDS

1. **Export Local Data** (if needed)
   ```powershell
   # Export schema and data
   docker exec skyshift-postgres pg_dump -U postgres skyshift > backup.sql
   ```

2. **Import to RDS**
   ```powershell
   # Connect to RDS and import
   psql -h your-rds-endpoint -U skyshift_admin -d skyshift -f backup.sql
   ```

3. **Update Application**
   - Change `DATABASE_URL` to RDS endpoint
   - Add `?sslmode=require` to connection string
   - Test connection

4. **Run Migrations**
   ```powershell
   pnpm prisma migrate deploy
   ```

---

## Part 5: Production Checklist

### Database (RDS)
- [ ] RDS instance created and running
- [ ] Security group configured (only allow app access)
- [ ] Automated backups enabled
- [ ] Multi-AZ enabled (for production)
- [ ] Connection string tested
- [ ] Migrations run successfully
- [ ] Monitoring and alerts configured

### Application
- [ ] Environment variables set (use Secrets Manager/Parameter Store)
- [ ] SSL/TLS configured (HTTPS)
- [ ] Domain name configured
- [ ] Health checks configured
- [ ] Logging configured (CloudWatch)
- [ ] Auto-scaling configured
- [ ] CDN configured (CloudFront) - optional

### Security
- [ ] Database not publicly accessible (use security groups)
- [ ] Secrets stored in AWS Secrets Manager
- [ ] IAM roles configured (least privilege)
- [ ] WAF configured (optional)
- [ ] Regular security updates

### Monitoring
- [ ] CloudWatch alarms configured
- [ ] Application logs in CloudWatch
- [ ] Database performance monitoring
- [ ] Error tracking (Sentry, etc.)

---

## Part 6: Cost Optimization

### RDS Costs
- **Instance**: $15-100+/month depending on size
- **Storage**: $0.115/GB/month
- **Backups**: Included in storage
- **Data Transfer**: First 100GB free, then $0.09/GB

### Application Costs
- **EC2**: $10-50+/month
- **ECS Fargate**: Pay per use (~$0.04/vCPU-hour)
- **Lambda**: Pay per request (very cheap for low traffic)
- **Vercel**: Free tier available, then $20+/month

### Tips
- Use Reserved Instances for RDS (save 30-60%)
- Use Spot Instances for non-critical workloads
- Enable RDS auto-scaling
- Use CloudFront for static assets
- Monitor and optimize regularly

---

## Part 7: Troubleshooting

### Database Connection Issues
- Check security group rules
- Verify endpoint and credentials
- Test connection from EC2 instance
- Check VPC and subnet configuration

### Application Deployment Issues
- Check CloudWatch logs
- Verify environment variables
- Check IAM permissions
- Verify network connectivity

### Performance Issues
- Enable RDS Performance Insights
- Check CloudWatch metrics
- Optimize database queries
- Scale resources as needed

---

## Quick Reference

### Connection String Format
```
postgresql://username:password@host:port/database?sslmode=require
```

### Important AWS Services
- **RDS**: Database
- **EC2/ECS**: Application hosting
- **Secrets Manager**: Secure configuration
- **CloudWatch**: Monitoring and logging
- **IAM**: Access control
- **VPC**: Network isolation

---

## Next Steps

1. **Set up RDS** (Part 1)
2. **Choose deployment method** (Part 2)
3. **Configure environment variables** (Part 3)
4. **Run migrations** (Part 4)
5. **Test thoroughly** before going live
6. **Set up monitoring** (Part 5)

For Phase 3 (Production), we'll implement automated CI/CD pipelines and advanced monitoring.

