---
name: Lambda Function - Create Character
about: Implement Lambda function to create new characters
title: "[LAMBDA] Implement Create Character Function"
labels: backend, lambda, aws
assignees: ''
---

## Overview
Create a Lambda function that allows authenticated users to create new characters and store them in DynamoDB.

## Prerequisites
- Issue #1 (AWS Infrastructure Setup) must be completed
- Cognito User Pool configured
- DynamoDB `rpg-characters` table created
- API Gateway set up

## Function Specifications

### Function Name
`rpg-create-character`

### Runtime
Node.js 20.x

### Handler
`index.handler`

### Trigger
API Gateway - `POST /characters`

### Authentication
Requires Cognito JWT token in `Authorization` header

## Implementation Requirements

### Input (Request Body)
```json
{
  "characterData": {
    "name": "Aragorn",
    "tradition": "Verbena",
    "essence": "Questing",
    "nature": "Survivor",
    "demeanor": "Caregiver",
    "attributes": {
      "physical": { "strength": 3, "dexterity": 2, "stamina": 3 },
      "social": { "charisma": 3, "manipulation": 2, "appearance": 2 },
      "mental": { "perception": 3, "intelligence": 2, "wits": 3 }
    },
    "abilities": {
      "talents": { "alertness": 2, "athletics": 1 },
      "skills": { "melee": 3, "stealth": 2 },
      "knowledges": { "occult": 2, "investigation": 1 }
    },
    "spheres": {
      "correspondence": 0,
      "entropy": 1,
      "forces": 0,
      "life": 2,
      "matter": 0,
      "mind": 1,
      "prime": 0,
      "spirit": 0,
      "time": 0
    },
    "backgrounds": [
      { "name": "Avatar", "level": 3 },
      { "name": "Resources", "level": 2 }
    ],
    "arete": 2,
    "willpower": 5,
    "quintessence": 4,
    "paradox": 0,
    "experience": 0
  }
}
```

### Expected Output (Success)
```json
{
  "statusCode": 201,
  "body": {
    "message": "Character created successfully",
    "character": {
      "characterId": "uuid-here",
      "userId": "cognito-user-id",
      "characterData": { /* full character data */ },
      "createdAt": "2025-11-10T12:00:00.000Z",
      "updatedAt": "2025-11-10T12:00:00.000Z"
    }
  }
}
```

### Error Responses
```json
// 400 - Bad Request
{
  "statusCode": 400,
  "body": {
    "error": "Invalid character data",
    "details": "Character name is required"
  }
}

// 401 - Unauthorized
{
  "statusCode": 401,
  "body": {
    "error": "Unauthorized",
    "details": "Valid authentication token required"
  }
}

// 500 - Internal Server Error
{
  "statusCode": 500,
  "body": {
    "error": "Internal server error",
    "details": "Failed to create character"
  }
}
```

## Tasks

### 1. Lambda Function Development
- [ ] Create `lambda/create-character/index.js`
- [ ] Implement character validation
  - Validate required fields (name, tradition, essence, etc.)
  - Validate attribute/ability ranges (0-5)
  - Validate sphere ranges (0-5)
  - Validate data types
- [ ] Extract userId from Cognito JWT token
- [ ] Generate unique characterId (UUID)
- [ ] Add timestamps (createdAt, updatedAt)
- [ ] Write to DynamoDB `rpg-characters` table
- [ ] Implement error handling and logging
- [ ] Add CORS headers to response

### 2. Dependencies
- [ ] Create `package.json` with dependencies:
  ```json
  {
    "dependencies": {
      "uuid": "^9.0.0",
      "@aws-sdk/client-dynamodb": "^3.0.0",
      "@aws-sdk/lib-dynamodb": "^3.0.0"
    }
  }
  ```
- [ ] Create deployment package with dependencies

### 3. Environment Variables
- [ ] Configure Lambda environment variables:
  - `CHARACTERS_TABLE_NAME`: DynamoDB table name
  - `AWS_REGION`: AWS region

### 4. Lambda Configuration
- [ ] Set memory to 256 MB
- [ ] Set timeout to 10 seconds
- [ ] Attach IAM execution role from Issue #1
- [ ] Enable CloudWatch Logs

### 5. API Gateway Integration
- [ ] Create `POST /characters` endpoint
- [ ] Configure Lambda proxy integration
- [ ] Attach Cognito Authorizer
- [ ] Enable CORS
- [ ] Deploy API to stage (e.g., `dev`)

### 6. Testing
- [ ] Unit tests for validation logic
- [ ] Test with valid character data
- [ ] Test with invalid data (missing fields, wrong types)
- [ ] Test with unauthorized request (no token)
- [ ] Test with invalid token
- [ ] Verify data is correctly stored in DynamoDB
- [ ] Document test cases and results

## Code Structure
```
lambda/
└── create-character/
    ├── index.js          # Main handler
    ├── validator.js      # Character data validation
    ├── package.json      # Dependencies
    └── tests/
        └── index.test.js # Unit tests
```

## Deliverables
- [ ] Lambda function deployed and functional
- [ ] API Gateway endpoint configured
- [ ] Unit tests written and passing
- [ ] Integration tests completed
- [ ] Documentation updated with API endpoint details
- [ ] Postman collection or curl examples for testing

## Acceptance Criteria
- Authenticated users can create characters via API
- Character data is validated before storage
- Characters are stored in DynamoDB with correct schema
- Proper error messages for invalid requests
- Function logs to CloudWatch for debugging
- API returns appropriate HTTP status codes

## Testing Checklist
- [ ] Valid character creation succeeds (201)
- [ ] Missing required fields returns 400
- [ ] Invalid data types return 400
- [ ] No auth token returns 401
- [ ] Invalid auth token returns 401
- [ ] Character appears in DynamoDB table
- [ ] Timestamps are correct ISO format
- [ ] CharacterId is unique UUID

## Estimated Time
3-4 hours

## Dependencies
- Issue #1 (AWS Infrastructure Setup)
