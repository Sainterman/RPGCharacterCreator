---
name: Setup AWS Infrastructure
about: Configure base AWS services for the application
title: "[SETUP] Configure AWS Infrastructure - Cognito, DynamoDB, API Gateway"
labels: infrastructure, aws, setup
assignees: ''
---

## Overview
Set up the foundational AWS infrastructure needed to support user authentication and character storage.

## Objectives
- Configure AWS Cognito User Pool for authentication
- Create DynamoDB tables for data storage
- Set up API Gateway for backend APIs
- Configure IAM roles and permissions

## Tasks

### 1. AWS Cognito Setup
- [ ] Create Cognito User Pool
  - Enable email/username login
  - Configure password requirements (min 8 chars, uppercase, lowercase, numbers)
  - Enable email verification
  - Configure MFA (optional, can be added later)
- [ ] Create Cognito User Pool Client
  - Configure for web application
  - Note the Client ID for frontend integration
- [ ] Configure Cognito Domain for hosted UI (optional)
- [ ] Test user registration and login flow

### 2. DynamoDB Tables

#### Users Table
- [ ] Create `rpg-users` table
  - Partition Key: `userId` (String)
  - Attributes:
    - `email` (String)
    - `username` (String)
    - `createdAt` (String - ISO timestamp)
    - `updatedAt` (String - ISO timestamp)
  - Enable Point-in-Time Recovery (optional for production)
  - Use on-demand billing mode

#### Characters Table
- [ ] Create `rpg-characters` table
  - Partition Key: `characterId` (String - UUID)
  - Sort Key: `userId` (String)
  - Global Secondary Index: `userId-createdAt-index`
    - Partition Key: `userId`
    - Sort Key: `createdAt`
  - Attributes:
    - `characterData` (Map - full character JSON)
    - `characterName` (String)
    - `createdAt` (String - ISO timestamp)
    - `updatedAt` (String - ISO timestamp)
  - Use on-demand billing mode

### 3. API Gateway Setup
- [ ] Create REST API: `rpg-character-creator-api`
- [ ] Configure CORS settings
  - Allow Origins: Your frontend domain (initially `*` for testing)
  - Allow Headers: `Content-Type, Authorization`
  - Allow Methods: `GET, POST, PUT, DELETE, OPTIONS`
- [ ] Create Cognito Authorizer
  - Link to User Pool created above
  - Configure token source: `Authorization` header

### 4. IAM Roles
- [ ] Create Lambda Execution Role: `rpg-lambda-execution-role`
  - Attach policies:
    - `AWSLambdaBasicExecutionRole` (CloudWatch logs)
    - Custom policy for DynamoDB access (read/write to both tables)
  - Trust relationship: Lambda service

### 5. Environment Configuration
- [ ] Document all resource ARNs and IDs:
  - Cognito User Pool ID
  - Cognito Client ID
  - DynamoDB table names and ARNs
  - API Gateway ID
  - IAM Role ARN
- [ ] Create `.env.example` file with required environment variables
- [ ] Update documentation with setup instructions

## Deliverables
- [ ] All AWS resources created and configured
- [ ] Documentation of all ARNs and configuration values
- [ ] Screenshot of AWS Console showing created resources
- [ ] Test that Cognito allows user signup/login
- [ ] Verify DynamoDB tables are accessible

## Acceptance Criteria
- Cognito User Pool allows user registration and authentication
- DynamoDB tables are created with correct schemas
- API Gateway is ready to accept Lambda integrations
- IAM roles have appropriate permissions
- All resource IDs/ARNs documented for next steps

## Additional Notes
- Keep resources in the same AWS region (recommend `us-east-1` for lowest costs)
- Use free tier eligible configurations where possible
- Tag all resources with: `Project: RPGCharacterCreator`

## Estimated Time
2-3 hours

## Dependencies
- AWS Account with appropriate permissions
- AWS CLI configured locally (optional but recommended)
