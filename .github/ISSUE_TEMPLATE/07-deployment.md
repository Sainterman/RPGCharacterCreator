---
name: Production Deployment
about: Deploy application to production using AWS services
title: "[DEPLOY] Deploy to Production (S3 + CloudFront)"
labels: deployment, devops, aws
assignees: ''
---

## Overview
Deploy the React application to production using AWS S3 for hosting and CloudFront for CDN delivery.

## Prerequisites
- Issue #6 (Frontend Integration) completed
- All Lambda functions tested and working
- Application tested locally with AWS services
- Production-ready environment variables configured

## Deployment Strategy

### Architecture
```
User
  ↓
CloudFront (CDN)
  ↓
S3 Bucket (Static Website)
  ↓
API Gateway → Lambda → DynamoDB
  ↑
Cognito (Auth)
```

## Tasks

### 1. Production Environment Setup

#### S3 Bucket for Hosting
- [ ] Create S3 bucket: `rpg-character-creator-prod`
- [ ] Configure bucket for static website hosting
  - Index document: `index.html`
  - Error document: `index.html` (for SPA routing)
- [ ] Disable "Block all public access"
- [ ] Create bucket policy for public read access:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::rpg-character-creator-prod/*"
      }
    ]
  }
  ```

#### CloudFront Distribution
- [ ] Create CloudFront distribution
- [ ] Set origin to S3 bucket website endpoint
- [ ] Configure default root object: `index.html`
- [ ] Configure error responses:
  - 404 → `/index.html` (200) - for SPA routing
  - 403 → `/index.html` (200) - for SPA routing
- [ ] Enable compression (Gzip, Brotli)
- [ ] Configure cache behavior
- [ ] Set price class (use "Use Only North America and Europe" for cost savings)
- [ ] Optional: Configure custom domain (requires Route 53 + SSL certificate)

### 2. Production API Setup

#### API Gateway Production Stage
- [ ] Create production stage in API Gateway
- [ ] Deploy all Lambda functions to production stage
- [ ] Configure custom domain (optional)
- [ ] Enable API caching (optional, for performance)
- [ ] Configure throttling limits
  - Rate: 1000 requests per second
  - Burst: 2000 requests
- [ ] Enable CloudWatch logging
- [ ] Document production API endpoint

#### Lambda Functions - Production Configuration
- [ ] Review all Lambda functions
- [ ] Set appropriate memory and timeout for production
- [ ] Enable X-Ray tracing (optional, for debugging)
- [ ] Configure reserved concurrency if needed
- [ ] Set up CloudWatch alarms for errors

#### DynamoDB - Production Configuration
- [ ] Review table capacity (on-demand vs provisioned)
- [ ] Enable Point-in-Time Recovery (PITR)
- [ ] Enable encryption at rest (should be default)
- [ ] Set up CloudWatch alarms for throttling
- [ ] Configure backup strategy

#### Cognito - Production Configuration
- [ ] Review password policies
- [ ] Configure email templates (verification, password reset)
- [ ] Set up custom domain for Cognito (optional)
- [ ] Enable MFA (optional, recommended)
- [ ] Configure user pool client for production domain

### 3. Build and Deploy Process

#### Production Build
- [ ] Create production environment file `.env.production`:
  ```
  VITE_AWS_REGION=us-east-1
  VITE_USER_POOL_ID=production-pool-id
  VITE_USER_POOL_CLIENT_ID=production-client-id
  VITE_API_ENDPOINT=https://api.yourdomain.com/prod
  ```
- [ ] Build production bundle:
  ```bash
  npm run build
  ```
- [ ] Verify build output in `dist/` directory
- [ ] Test production build locally:
  ```bash
  npm run preview
  ```

#### Initial Deployment
- [ ] Deploy to S3:
  ```bash
  aws s3 sync dist/ s3://rpg-character-creator-prod --delete
  ```
- [ ] Invalidate CloudFront cache:
  ```bash
  aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"
  ```
- [ ] Test production URL
- [ ] Verify all functionality works

### 4. CI/CD Pipeline (Optional but Recommended)

#### GitHub Actions Workflow
- [ ] Create `.github/workflows/deploy.yml`:
  ```yaml
  name: Deploy to Production
  
  on:
    push:
      branches: [main]
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      
      steps:
        - uses: actions/checkout@v3
        
        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '20'
            
        - name: Install dependencies
          run: |
            cd client
            npm ci
            
        - name: Build
          run: |
            cd client
            npm run build
          env:
            VITE_AWS_REGION: ${{ secrets.AWS_REGION }}
            VITE_USER_POOL_ID: ${{ secrets.USER_POOL_ID }}
            VITE_USER_POOL_CLIENT_ID: ${{ secrets.USER_POOL_CLIENT_ID }}
            VITE_API_ENDPOINT: ${{ secrets.API_ENDPOINT }}
            
        - name: Configure AWS credentials
          uses: aws-actions/configure-aws-credentials@v2
          with:
            aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
            aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            aws-region: us-east-1
            
        - name: Deploy to S3
          run: |
            aws s3 sync client/dist/ s3://rpg-character-creator-prod --delete
            
        - name: Invalidate CloudFront
          run: |
            aws cloudfront create-invalidation \
              --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
              --paths "/*"
  ```

#### GitHub Secrets Setup
- [ ] Add secrets to GitHub repository:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `USER_POOL_ID`
  - `USER_POOL_CLIENT_ID`
  - `API_ENDPOINT`
  - `CLOUDFRONT_DISTRIBUTION_ID`

### 5. Monitoring and Logging

#### CloudWatch Setup
- [ ] Create CloudWatch dashboard
- [ ] Add metrics:
  - Lambda invocations and errors
  - API Gateway requests and latency
  - DynamoDB read/write capacity
  - Cognito sign-ins
- [ ] Set up alarms:
  - Lambda errors > 10 in 5 minutes
  - API Gateway 5xx errors > 5 in 5 minutes
  - DynamoDB throttling events

#### Cost Monitoring
- [ ] Set up AWS Budgets
- [ ] Create budget alert for $10/month threshold
- [ ] Review AWS Cost Explorer regularly

### 6. Security Hardening

#### Security Checklist
- [ ] Enable AWS WAF on CloudFront (optional, costs extra)
- [ ] Configure security headers in CloudFront:
  - Content-Security-Policy
  - X-Content-Type-Options
  - X-Frame-Options
  - Strict-Transport-Security
- [ ] Review IAM roles and policies (principle of least privilege)
- [ ] Enable CloudTrail for audit logging
- [ ] Configure S3 bucket versioning
- [ ] Review Cognito security settings

### 7. Performance Optimization

#### Optimization Tasks
- [ ] Enable CloudFront compression
- [ ] Configure appropriate cache TTLs
- [ ] Optimize images (if any)
- [ ] Analyze bundle size:
  ```bash
  npm run build -- --analyze
  ```
- [ ] Implement code splitting if needed
- [ ] Enable DynamoDB auto-scaling (if using provisioned capacity)

### 8. Documentation

#### Production Documentation
- [ ] Document production URLs and endpoints
- [ ] Create deployment runbook
- [ ] Document rollback procedure
- [ ] Create troubleshooting guide
- [ ] Update README with production information
- [ ] Document environment variables
- [ ] Create architecture diagram

### 9. Testing in Production

#### Production Testing Checklist
- [ ] Test user sign up flow
- [ ] Test user sign in flow
- [ ] Test password reset flow
- [ ] Test character creation
- [ ] Test character retrieval
- [ ] Test character updates
- [ ] Test character deletion
- [ ] Test cross-browser compatibility
- [ ] Test mobile responsiveness
- [ ] Test error scenarios
- [ ] Load test API endpoints (use Apache Bench or similar)

### 10. Post-Deployment

#### Final Steps
- [ ] Announce to users (if existing user base)
- [ ] Monitor CloudWatch for first 24 hours
- [ ] Review costs after first week
- [ ] Collect user feedback
- [ ] Create backup/disaster recovery plan

## Deliverables
- [ ] Application deployed to S3 + CloudFront
- [ ] Production API Gateway endpoint live
- [ ] CI/CD pipeline configured (optional)
- [ ] Monitoring and alarms set up
- [ ] Documentation complete
- [ ] Testing completed successfully

## Acceptance Criteria
- Application accessible via CloudFront URL
- All features work in production
- HTTPS enabled (CloudFront provides this)
- Authentication works correctly
- Characters saved to production DynamoDB
- Monitoring dashboards show healthy metrics
- Deployment process documented
- Costs within budget

## Production URLs Checklist
- [ ] CloudFront Distribution URL: `https://d123456789.cloudfront.net`
- [ ] Production API: `https://api-id.execute-api.region.amazonaws.com/prod`
- [ ] Custom Domain (optional): `https://rpg.yourdomain.com`

## Cost Estimate (Monthly)
- CloudFront: ~$1-2 (first 1TB free for 12 months)
- S3: ~$0.50 (storage + requests)
- Lambda: ~$0-1 (under free tier)
- API Gateway: ~$1 (after first 12 months)
- DynamoDB: ~$1-2 (on-demand pricing)
- **Total: $3-7/month** (after free tier expires)

## Rollback Plan
If issues occur:
1. Identify the issue in CloudWatch logs
2. If frontend issue: Redeploy previous S3 version
3. If backend issue: Rollback Lambda functions in AWS Console
4. Invalidate CloudFront cache
5. Notify users if necessary

## Estimated Time
4-6 hours (initial setup)
1-2 hours (CI/CD setup)

## Dependencies
- All previous issues (#1-6) completed
- AWS account with billing enabled
- Domain name (optional, for custom domain)

## Additional Resources
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions for AWS](https://github.com/aws-actions)
