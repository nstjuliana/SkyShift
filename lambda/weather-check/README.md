# Lambda Weather Check Function - Deployment Guide

## Overview

This Lambda function runs hourly to check weather conditions for all upcoming flights scheduled within the next 48 hours. It updates flight statuses and sends notifications when weather conflicts are detected.

## Prerequisites

- AWS Account with Lambda access
- Node.js 20.x installed locally
- AWS CLI configured (optional, for CLI deployment)
- All environment variables ready (see `.env.example`)

## Local Setup

1. **Install dependencies** (from project root):
   ```bash
   pnpm install
   ```

2. **Generate Prisma Client**:
   ```bash
   pnpm db:generate
   ```

3. **Build Lambda function**:
   ```powershell
   cd lambda\weather-check
   npm install
   npm run build
   ```

## Deployment Options

### Option 1: AWS Console (Recommended for First Deployment)

1. **Create Lambda Function**:
   - Go to AWS Lambda Console
   - Click "Create function"
   - Choose "Author from scratch"
   - Function name: `skyshift-weather-check`
   - Runtime: Node.js 20.x
   - Architecture: x86_64
   - Click "Create function"

2. **Upload Code**:
   - In the Lambda function page, go to "Code" tab
   - Click "Upload from" → ".zip file"
   - Create a zip file:
     ```powershell
     cd lambda\weather-check
     npm run build
     cd dist
     Compress-Archive -Path * -DestinationPath ..\..\function.zip -Force
     cd ..\..
     ```
   - Upload `function.zip`
   - Set Handler to: `index.handler`

3. **Configure Environment Variables**:
   - Go to "Configuration" → "Environment variables"
   - Add all variables from `.env.example`:
     - `DATABASE_URL`
     - `OPENWEATHER_API_KEY`
     - `TOMORROW_IO_API_KEY` (optional)
     - `AIRPORTDB_API_KEY` (optional)
     - `RESEND_API_KEY`
     - `RESEND_FROM_EMAIL` (optional - defaults to `onboarding@resend.dev`)
     - `NEXTAUTH_URL` (or `NEXT_PUBLIC_APP_URL` as fallback)

4. **Configure Function Settings**:
   - Go to "Configuration" → "General configuration"
   - Memory: 512 MB
   - Timeout: 5 minutes (300 seconds)
   - Click "Edit" and save

5. **Set Up EventBridge Schedule**:
   - Go to "Configuration" → "Triggers"
   - Click "Add trigger"
   - Select "EventBridge (CloudWatch Events)"
   - Rule: Create new rule
   - Rule name: `skyshift-hourly-weather-check`
   - Rule type: Schedule expression
   - Schedule expression: `cron(0 * * * ? *)` (runs every hour at :00)
   - Enable trigger: Yes
   - Click "Add"

6. **Set Up IAM Permissions**:
   - Lambda needs permissions to:
     - Write to CloudWatch Logs (automatic - already configured)
     - Access Supabase database (no additional permissions needed - uses DATABASE_URL connection string)
   - Go to "Configuration" → "Permissions"
   - Review execution role - default `AWSLambdaBasicExecutionRole` is sufficient for Supabase
   - **Note:** If using AWS RDS in a VPC, you would need VPC configuration, but Supabase doesn't require this

### Option 2: AWS CLI Deployment

```powershell
# Build and package
cd lambda\weather-check
npm install
npm run build
cd dist
Compress-Archive -Path * -DestinationPath ..\..\function.zip -Force
cd ..\..

# Create function (first time only)
aws lambda create-function `
  --function-name skyshift-weather-check `
  --runtime nodejs20.x `
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role `
  --handler index.handler `
  --zip-file fileb://function.zip `
  --timeout 300 `
  --memory-size 512

# Update function code
aws lambda update-function-code `
  --function-name skyshift-weather-check `
  --zip-file fileb://function.zip

# Update environment variables
aws lambda update-function-configuration `
  --function-name skyshift-weather-check `
  --environment Variables='{\"DATABASE_URL\":\"your_db_url\",\"OPENWEATHER_API_KEY\":\"your_key\",\"RESEND_API_KEY\":\"your_key\",\"RESEND_FROM_EMAIL\":\"onboarding@resend.dev\",\"NEXTAUTH_URL\":\"https://your-app.amplifyapp.com\"}'
```

## Testing

1. **Test Locally** (using AWS SAM or Lambda runtime):
   ```powershell
   # Create test event
   '{}' | Out-File -FilePath test-event.json -Encoding utf8
   
   # Test with AWS SAM CLI (if installed)
   sam local invoke WeatherCheckFunction -e test-event.json
   ```

2. **Test in AWS Console**:
   - Go to Lambda function
   - Click "Test" tab
   - Create new test event
   - Event JSON: `{}`
   - Click "Test"
   - Check execution results and logs

3. **Verify CloudWatch Logs**:
   - Go to CloudWatch → Log groups
   - Find `/aws/lambda/skyshift-weather-check`
   - Check recent log streams for execution details

## Monitoring

### CloudWatch Metrics

The function automatically logs to CloudWatch. Key metrics:
- Invocations
- Duration
- Errors
- Throttles

### CloudWatch Alarms (Recommended)

Create alarms for:
1. **Errors**: `Errors > 5` in 5 minutes
2. **Duration**: `Duration > 240000` ms (4 minutes, near timeout)
3. **Throttles**: `Throttles > 0`

### CloudWatch Dashboard

Create a dashboard with:
- Invocation count (line chart)
- Error count (line chart)
- Average duration (line chart)
- Recent log entries (log insights)

## Troubleshooting

### Common Issues

1. **Timeout Errors**:
   - Increase timeout to 5 minutes
   - Check database connection speed
   - Verify API response times

2. **Database Connection Errors**:
   - Verify `DATABASE_URL` is correct
   - Check if Lambda needs VPC configuration for RDS
   - For Supabase: Ensure connection string includes `?sslmode=require`

3. **Import Errors**:
   - Ensure all dependencies are bundled
   - Check that Prisma Client is generated
   - Verify path aliases are resolved during build

4. **Missing Environment Variables**:
   - Check all required variables are set
   - Verify variable names match exactly
   - Test with `console.log(process.env.VARIABLE_NAME)`

### Debugging

1. **Check CloudWatch Logs**:
   - All console.log statements appear in CloudWatch
   - Look for structured JSON logs with level, message, timestamp

2. **Test Individual Components**:
   - Test database connection separately
   - Test weather API calls separately
   - Test email sending separately

3. **Local Testing**:
   - Use AWS SAM CLI for local testing
   - Or create a test script that imports the handler

## Cost Estimation

- **Free Tier**: 1M requests/month free
- **After Free Tier**: $0.20 per 1M requests
- **Compute**: $0.0000166667 per GB-second
- **Example**: 730 invocations/month (hourly) × 5 seconds × 512MB = ~$0.03/month

## Maintenance

- **Update Function**: Rebuild and upload new zip file
- **Update Dependencies**: Update `package.json`, rebuild, redeploy
- **Monitor Logs**: Check CloudWatch logs weekly for errors
- **Review Metrics**: Check CloudWatch metrics monthly for performance issues

## Next Steps

After deployment:
1. Verify function runs successfully on first scheduled execution
2. Set up CloudWatch alarms
3. Create CloudWatch dashboard
4. Monitor for first 24 hours
5. Document any issues or improvements needed

