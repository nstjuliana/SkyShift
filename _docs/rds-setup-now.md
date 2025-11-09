# AWS RDS Setup - Step by Step

Follow these steps to create your RDS PostgreSQL instance right now.

## Prerequisites

- AWS Account (if you don't have one, sign up at https://aws.amazon.com)
- Access to AWS Console

---

## Step 1: Navigate to RDS

1. Go to **AWS Console**: https://console.aws.amazon.com
2. Sign in to your AWS account
3. In the search bar at the top, type **"RDS"**
4. Click on **"RDS"** service

---

## Step 2: Create Database

1. Click the **"Create database"** button (orange button, top right)

2. **Choose a database creation method**
   - Select **"Standard create"** (not Easy create - we need more control)

---

## Step 3: Engine Options

1. **Engine type**: Select **"PostgreSQL"**
2. **Version**: Choose **PostgreSQL 15.x** (or 14.x if 15 isn't available)
   - This should match your local Docker version

---

## Step 4: Templates

Choose based on your needs:

- **Free tier** (if eligible): For development/testing
- **Production**: For production workloads (more expensive)
- **Dev/Test**: Good middle ground

**For now, choose "Free tier" or "Dev/Test"**

---

## Step 5: Settings

1. **DB Instance Identifier**: 
   - Enter: `skyshift-db`
   - (This is just a name for your database instance)

2. **Master Username**: 
   - Enter: `skyshift_admin`
   - (Or any username you prefer)

3. **Master Password**: 
   - Click **"Auto generate a password"** OR
   - Enter a strong password manually
   - **IMPORTANT**: If auto-generated, you'll see the password after creation - SAVE IT!
   - If manual: Use a strong password (save it securely)

4. **Confirm Password**: Re-enter the password

---

## Step 6: Instance Configuration

1. **DB Instance Class**: 
   - **Free tier**: `db.t3.micro` (if eligible)
   - **Otherwise**: `db.t3.micro` or `db.t3.small`
   - (You can scale up later)

2. **Storage**: 
   - **Storage type**: General Purpose SSD (gp3)
   - **Allocated storage**: 20 GB (minimum)
   - **Storage autoscaling**: ✅ Enable (recommended)
   - **Maximum storage threshold**: 100 GB (or your preference)

---

## Step 7: Connectivity

**IMPORTANT**: Configure this carefully!

1. **Virtual Private Cloud (VPC)**: 
   - Select **"Default VPC"** (or your custom VPC if you have one)

2. **Subnet Group**: 
   - Select **"default"** (or create new if needed)

3. **Public Access**: 
   - ⚠️ **For Development**: Select **"Yes"** (allows connection from your computer)
   - ⚠️ **For Production**: Select **"No"** (more secure, requires VPN)

4. **VPC Security Group**: 
   - Select **"Create new"**
   - **New VPC security group name**: `skyshift-db-sg`

5. **Availability Zone**: 
   - Select **"No preference"** (or choose specific zone)

6. **Database Port**: 
   - Keep default: **5432**

---

## Step 8: Database Authentication

1. **Database authentication options**: 
   - Select **"Password authentication"** (default)

---

## Step 9: Additional Configuration

1. **Initial database name**: 
   - Enter: `skyshift`
   - (This creates the database automatically)

2. **DB Parameter Group**: 
   - Keep default

3. **Option Group**: 
   - Keep default

4. **Backup**: 
   - **Enable automated backups**: ✅ Yes
   - **Backup retention period**: 7 days (minimum)
   - **Backup window**: Choose off-peak hours (or default)

5. **Encryption**: 
   - **Enable encryption**: ✅ Yes (recommended for production)
   - **Encryption key**: Default (AWS managed key)

6. **Monitoring**: 
   - **Enable Enhanced monitoring**: ⬜ No (optional, costs extra)
   - **Enable Performance Insights**: ⬜ No (optional, costs extra)

7. **Log exports**: 
   - Leave unchecked (optional)

8. **Maintenance**: 
   - **Enable auto minor version upgrade**: ✅ Yes
   - **Maintenance window**: Choose off-peak hours (or default)

---

## Step 10: Create Database

1. **Estimated monthly costs**: Review the cost estimate
2. Click **"Create database"** button (bottom right)
3. ⏳ **Wait 5-15 minutes** for the database to be created

---

## Step 11: Save Your Credentials

**CRITICAL**: While waiting, save these details:

1. **Endpoint**: You'll see this after creation (e.g., `skyshift-db.xxxxx.us-east-1.rds.amazonaws.com`)
2. **Port**: `5432`
3. **Username**: `skyshift_admin` (or what you chose)
4. **Password**: The password you set (or auto-generated one)
5. **Database name**: `skyshift`

---

## Step 12: Configure Security Group (After Creation)

Once the database status shows **"Available"**:

1. Click on your database instance name
2. Scroll down to **"Connectivity & security"**
3. Click on the **VPC security group** link (e.g., `skyshift-db-sg`)
4. Click **"Edit inbound rules"**
5. Click **"Add rule"**:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: 
     - **For Development**: Select **"My IP"** (adds your current IP)
     - **OR** Select **"Anywhere-IPv4"** (0.0.0.0/0) - ⚠️ Less secure but easier
   - Click **"Save rules"**

---

## Step 13: Get Connection Details

1. Go back to RDS → Your database
2. In **"Connectivity & security"** section:
   - Copy the **Endpoint** (e.g., `skyshift-db.xxxxx.us-east-1.rds.amazonaws.com`)
   - Note the **Port** (5432)

---

## Step 14: Test Connection

Once you have the endpoint, we'll test the connection and run migrations.

**Connection String Format**:
```
postgresql://username:password@endpoint:port/database?sslmode=require
```

**Example**:
```
postgresql://skyshift_admin:your_password@skyshift-db.xxxxx.us-east-1.rds.amazonaws.com:5432/skyshift?sslmode=require
```

---

## Next Steps (After RDS is Created)

Once your RDS instance is ready, come back and we'll:
1. Update your `.env.local` with the RDS connection string
2. Test the connection
3. Run migrations on RDS
4. Seed the database

---

## Troubleshooting

### Can't see "Create database" button?
- Make sure you're in the correct AWS region
- Check you have proper IAM permissions

### Database creation failed?
- Check your VPC settings
- Verify subnet group configuration
- Check service quotas (you might have hit limits)

### Can't connect after creation?
- Verify security group allows your IP
- Check if "Public access" is enabled
- Verify endpoint and credentials are correct

---

## Cost Estimate

- **db.t3.micro** (Free tier eligible): $0/month (first year) or ~$15/month
- **db.t3.small**: ~$25/month
- **Storage (20GB)**: ~$2.30/month
- **Backups**: Included in storage
- **Total**: ~$15-30/month for development

---

**Ready?** Start with Step 1 and let me know when your RDS instance is created!

