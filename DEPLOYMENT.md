# SkyShift Deployment Guide

## Overview

This guide covers deploying SkyShift to AWS Amplify and setting up the AWS Lambda function for automated weather checks.

## Prerequisites

- AWS Account with appropriate permissions
- GitHub repository with SkyShift code
- Supabase PostgreSQL database (or AWS RDS)
- API keys for:
  - OpenWeatherMap
  - OpenAI
  - Resend (email)

## Part 1: AWS Amplify Deployment

### Step 1: Connect Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Select your Git provider (GitHub, GitLab, Bitbucket)
4. Authorize AWS Amplify to access your repository
5. Select the SkyShift repository and branch (usually `main` or `master`)

### Step 2: Configure Build Settings

Amplify should auto-detect Next.js. Verify these settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
        - pnpm db:generate
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

If auto-detection fails, create `amplify.yml` in the project root with the above content.

### Step 3: Configure Environment Variables (First Deployment)

**Important:** You won't know your Amplify app URL until after the first deployment. Follow this two-step process:

**For First Deployment** - In Amplify Console → App Settings → Environment variables, add:

**Required:**
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - **Leave empty or use placeholder** `https://placeholder.amplifyapp.com` (we'll update this after deployment)
- `OPENAI_API_KEY` - OpenAI API key
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Email address (optional - defaults to `onboarding@resend.dev` if not set)

**Optional:**
- `TOMORROW_IO_API_KEY` - Tomorrow.io API key
- `AIRPORTDB_API_KEY` - AirportDB API key

### Step 4: Deploy (First Time)

1. Click "Save and deploy"
2. Wait for build to complete (5-10 minutes)
3. **Note your app URL** from the Amplify Console: `https://[branch].[app-id].amplifyapp.com`

### Step 5: Update NEXTAUTH_URL (After First Deployment)

1. Go to Amplify Console → App Settings → Environment variables
2. Find `NEXTAUTH_URL` and update it to your **full Amplify app URL** from Step 4
   - Example: `https://main.d2q7ne5hrd77na.amplifyapp.com`
   - **Important:** Include the `https://` protocol and the full domain
3. Click "Save"
4. Amplify will automatically trigger a new deployment with the updated URL
5. Wait for the redeployment to complete

**Note:** 
- `NEXTAUTH_URL` must be the exact URL where your app is deployed (the Amplify app URL)
- The app will work without `NEXTAUTH_URL` set initially, but authentication and email links won't work correctly until you update it
- After updating, all authentication flows and email links will use this URL

### Step 6: Verify Deployment

1. Visit your Amplify app URL
2. Test login functionality
3. Verify database connection works
4. Check browser console for errors
5. Test creating a flight booking

## Part 2: AWS Lambda Function Deployment

### Step 1: Prepare Lambda Package

From project root:

```powershell
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm db:generate

# Build Lambda function
cd lambda\weather-check
npm install
npm run build
cd dist
Compress-Archive -Path * -DestinationPath ..\..\function.zip -Force
cd ..\..
```

### Step 2: Create Lambda Function

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Click "Create function"
3. Choose "Author from scratch"
4. Configuration:
   - Function name: `skyshift-weather-check`
   - Runtime: Node.js 20.x
   - Architecture: x86_64
   - Click "Create function"

### Step 3: Upload Function Code

1. In Lambda function page, go to "Code" tab
2. Click "Upload from" → ".zip file"
3. Upload `function.zip` created in Step 1
4. Set Handler to: `index.handler`

### Step 4: Configure Function Settings

1. Go to "Configuration" → "General configuration"
2. Click "Edit"
3. Set:
   - Memory: 512 MB
   - Timeout: 5 minutes (300 seconds)
4. Click "Save"

### Step 5: Set Environment Variables

1. Go to "Configuration" → "Environment variables"
2. Add all variables (same as Amplify, plus):
   - `DATABASE_URL` - Supabase connection string
   - `OPENWEATHER_API_KEY`
   - `TOMORROW_IO_API_KEY` (optional)
   - `AIRPORTDB_API_KEY` (optional)
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (optional - defaults to `onboarding@resend.dev`)
   - `NEXTAUTH_URL` - Your Amplify app URL (same as your production URL)
   - `NODE_ENV=production`

### Step 6: Configure EventBridge Schedule

1. Go to "Configuration" → "Triggers"
2. Click "Add trigger"
3. Select "EventBridge (CloudWatch Events)"
4. Create new rule:
   - Rule name: `skyshift-hourly-weather-check`
   - Rule type: Schedule expression
   - Schedule expression: `cron(0 * * * ? *)` (runs every hour at :00)
   - Enable trigger: Yes
5. Click "Add"

### Step 7: Test Lambda Function

1. Go to "Test" tab
2. Create new test event:
   - Event name: `test-weather-check`
   - Event JSON: `{}`
3. Click "Test"
4. Check execution results:
   - Status should be "Succeeded"
   - Check logs for execution details
   - Verify flights were checked

## Part 3: CloudWatch Monitoring Setup

### Step 1: Create CloudWatch Dashboard

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch)
2. Click "Dashboards" → "Create dashboard"
3. Name: `SkyShift-Lambda-Monitoring`
4. Add widgets:
   - **Lambda Invocations** (Line chart)
     - Metric: AWS/Lambda → Invocations
     - Function: skyshift-weather-check
   - **Lambda Errors** (Line chart)
     - Metric: AWS/Lambda → Errors
     - Function: skyshift-weather-check
   - **Lambda Duration** (Line chart)
     - Metric: AWS/Lambda → Duration
     - Function: skyshift-weather-check
   - **Recent Log Entries** (Logs Insights)
     - Log group: `/aws/lambda/skyshift-weather-check`

### Step 2: Create CloudWatch Alarms

1. Go to CloudWatch → Alarms → Create alarm

**Alarm 1: Lambda Errors**
- Metric: AWS/Lambda → Errors
- Function: skyshift-weather-check
- Condition: Errors > 5
- Period: 5 minutes
- Actions: Send notification (optional)

**Alarm 2: Lambda Duration**
- Metric: AWS/Lambda → Duration
- Function: skyshift-weather-check
- Condition: Duration > 240000 ms (4 minutes)
- Period: 5 minutes
- Actions: Send notification (optional)

**Alarm 3: Lambda Throttles**
- Metric: AWS/Lambda → Throttles
- Function: skyshift-weather-check
- Condition: Throttles > 0
- Period: 5 minutes
- Actions: Send notification (optional)

## Part 4: Post-Deployment Verification

### Application Verification

- [ ] Application accessible at Amplify URL
- [ ] Login/authentication works
- [ ] Database queries successful
- [ ] API routes respond correctly
- [ ] Weather API integration works
- [ ] Email sending works
- [ ] AI rescheduling works
- [ ] No console errors in browser
- [ ] Mobile responsive design verified

### Lambda Verification

- [ ] Lambda function deployed successfully
- [ ] Environment variables configured
- [ ] EventBridge schedule active
- [ ] CloudWatch logs accessible
- [ ] Function executes without errors
- [ ] Weather checks run correctly
- [ ] Notifications sent when conflicts detected

### Monitoring Verification

- [ ] CloudWatch dashboard created
- [ ] Lambda metrics tracked
- [ ] CloudWatch alarms configured
- [ ] Logs show structured JSON output
- [ ] Error tracking working

## Troubleshooting

### Common Issues

**Build Fails in Amplify:**
- Check build logs for specific errors
- Verify `pnpm` is installed in preBuild
- Ensure Prisma Client is generated
- Check environment variables are set

**Lambda Timeout:**
- Increase timeout to 5 minutes
- Check database connection speed
- Verify API response times
- Review CloudWatch logs for bottlenecks

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Check Supabase connection string includes `?sslmode=require`
- Verify security group allows connections (if using RDS)
- Test connection from local machine

**Environment Variables Not Working:**
- Verify variable names match exactly (case-sensitive)
- Check for typos
- Ensure variables are set in correct environment
- Restart function/app after adding variables

### Getting Help

1. Check CloudWatch Logs for detailed error messages
2. Review Amplify build logs
3. Test Lambda function manually with test event
4. Verify all API keys are valid
5. Check database connectivity

## Maintenance

### Updating Application

1. Push changes to GitHub
2. Amplify automatically rebuilds and deploys
3. Monitor build status in Amplify Console

### Updating Lambda Function

1. Rebuild function: `cd lambda\weather-check; npm run build`
2. Create zip: `cd dist; Compress-Archive -Path * -DestinationPath ..\..\function.zip -Force`
3. Upload zip in Lambda Console → Code → Upload from .zip file

### Monitoring

- Check CloudWatch dashboard weekly
- Review Lambda logs for errors
- Monitor CloudWatch alarms
- Review Amplify build logs for issues

## Cost Estimation

**AWS Amplify:**
- Free tier: 1,000 build minutes/month
- After free tier: ~$0.01 per build minute
- Hosting: Free for static sites

**AWS Lambda:**
- Free tier: 1M requests/month
- After free tier: $0.20 per 1M requests
- Compute: ~$0.03/month for hourly execution

**Total Estimated Cost:** < $5/month for low traffic

## Next Steps

After successful deployment:

1. Monitor Lambda execution for first 24 hours
2. Set up CloudWatch alarms for critical errors
3. Test all features in production
4. Update documentation with production URL
5. Set up custom domain (optional)

