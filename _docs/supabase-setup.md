# Supabase Setup Guide - Quick Start

## Step 1: Sign Up / Sign In

1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign in"**
3. Sign up with GitHub (recommended) or email

## Step 2: Create New Project

1. Click **"New Project"** button
2. Fill in the form:
   - **Name**: `skyshift` (or any name you prefer)
   - **Database Password**: 
     - ⚠️ **IMPORTANT**: Create a STRONG password and SAVE IT
     - You'll need this for the connection string
   - **Region**: Choose closest to you (e.g., `US East (N. Virginia)`)
   - **Pricing Plan**: Free (default)
3. Click **"Create new project"**
4. ⏳ Wait 1-2 minutes for project to be created

## Step 3: Get Connection String

Once your project is ready:

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"**
4. Find **"URI"** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with the password you set in Step 2
7. **Add `?sslmode=require`** at the end (Supabase requires SSL)

**Final connection string should look like**:
```
postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

## Step 4: Update Environment Variables

We'll update your `.env.local` file with the Supabase connection string.

## Step 5: Run Migrations

We'll run Prisma migrations to create all tables in Supabase.

## Step 6: Seed Database

We'll seed the database with test users.

---

## Quick Reference

- **Dashboard**: https://supabase.com/dashboard
- **Connection String Location**: Project Settings → Database → Connection string → URI
- **SQL Editor**: Available in left sidebar
- **Table Editor**: Available in left sidebar (great for viewing data)

---

## Troubleshooting

### Can't find connection string?
- Make sure you're in **Project Settings** → **Database**
- Look for **"Connection string"** section
- Click **"URI"** tab (not "JDBC" or "Golang")

### Connection fails?
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Make sure `?sslmode=require` is at the end
- Check that your project is fully created (not still provisioning)

### Password issues?
- If you forgot your password, you can reset it in Project Settings → Database → Database password

---

**Ready?** Let's start with Step 1!

