---
name: Lambda Function - Update Character
about: Implement Lambda function to update existing characters
title: "[LAMBDA] Implement Update Character Function"
labels: backend, lambda, aws
assignees: ''
---

## Overview
Create a Lambda function that allows authenticated users to update their existing characters in DynamoDB.

## Prerequisites
- Issue #1 (AWS Infrastructure Setup) completed
- Issue #2 (Create Character Lambda) completed
- DynamoDB `rpg-characters` table configured

## Function Specifications

### Function Name
`rpg-update-character`

### Runtime
Node.js 20.x

### Handler
`index.handler`

### Trigger
API Gateway - `PUT /characters/{characterId}`

### Authentication
Requires Cognito JWT token in `Authorization` header

## Implementation Requirements

### Input
**Path Parameter:** `characterId` (UUID)

**Request Body:** Full or partial character data
```json
{
  "characterData": {
    "name": "Updated Name",
    "experience": 150,
    "attributes": {
      "physical": { "strength": 4, "dexterity": 2, "stamina": 3 }
    }
  }
}
```

### Expected Output (Success)
```json
{
  "statusCode": 200,
  "body": {
    "message": "Character updated successfully",
    "character": {
      "characterId": "uuid-here",
      "userId": "cognito-user-id",
      "characterData": { /* updated character data */ },
      "createdAt": "2025-11-10T12:00:00.000Z",
      "updatedAt": "2025-11-10T13:30:00.000Z"
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
    "details": "Attribute values must be between 0 and 5"
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

// 403 - Forbidden
{
  "statusCode": 403,
  "body": {
    "error": "Forbidden",
    "details": "You can only update your own characters"
  }
}

// 404 - Not Found
{
  "statusCode": 404,
  "body": {
    "error": "Character not found",
    "details": "No character found with the provided ID"
  }
}

// 500 - Internal Server Error
{
  "statusCode": 500,
  "body": {
    "error": "Internal server error",
    "details": "Failed to update character"
  }
}
```

## Tasks

### 1. Lambda Function Development
- [ ] Create `lambda/update-character/index.js`
- [ ] Extract userId from Cognito JWT token
- [ ] Extract characterId from path parameters
- [ ] Retrieve existing character from DynamoDB
- [ ] Verify character belongs to authenticated user (authorization check)
- [ ] Validate update data (reuse validation from create-character)
- [ ] Merge update data with existing character data
- [ ] Update `updatedAt` timestamp
- [ ] Write updated character to DynamoDB
- [ ] Implement error handling and logging
- [ ] Add CORS headers to response

### 2. Authorization Logic
```javascript
// Pseudocode
const existingCharacter = await getCharacterFromDB(characterId);

if (!existingCharacter) {
  return 404; // Not found
}

if (existingCharacter.userId !== tokenUserId) {
  return 403; // Forbidden - not your character
}

// Proceed with update
```

### 3. Dependencies
- [ ] Create `package.json`:
  ```json
  {
    "dependencies": {
      "@aws-sdk/client-dynamodb": "^3.0.0",
      "@aws-sdk/lib-dynamodb": "^3.0.0"
    }
  }
  ```

### 4. Environment Variables
- [ ] Configure Lambda environment variables:
  - `CHARACTERS_TABLE_NAME`: DynamoDB table name
  - `AWS_REGION`: AWS region

### 5. Lambda Configuration
- [ ] Set memory to 256 MB
- [ ] Set timeout to 10 seconds
- [ ] Attach IAM execution role
- [ ] Enable CloudWatch Logs

### 6. API Gateway Integration
- [ ] Create `PUT /characters/{characterId}` endpoint
- [ ] Configure path parameter: `characterId`
- [ ] Configure Lambda proxy integration
- [ ] Attach Cognito Authorizer
- [ ] Enable CORS
- [ ] Deploy API

### 7. Testing
- [ ] Test valid update (full character data)
- [ ] Test partial update (only some fields)
- [ ] Test with non-existent characterId (404)
- [ ] Test updating another user's character (403)
- [ ] Test with invalid data
- [ ] Test with unauthorized request (401)
- [ ] Verify updatedAt timestamp changes
- [ ] Verify createdAt timestamp doesn't change
- [ ] Document test cases

## Code Structure
```
lambda/
└── update-character/
    ├── index.js          # Main handler
    ├── validator.js      # Shared validation logic
    ├── package.json      # Dependencies
    └── tests/
        └── index.test.js # Unit tests
```

## Deliverables
- [ ] Lambda function deployed and functional
- [ ] API Gateway endpoint configured
- [ ] Unit tests written and passing
- [ ] Integration tests completed
- [ ] Authorization logic properly implemented
- [ ] Documentation with API examples
- [ ] Postman collection or curl examples

## Acceptance Criteria
- Authenticated users can update their own characters
- Users cannot update other users' characters (403)
- Non-existent characters return 404
- Invalid data is rejected with appropriate errors
- updatedAt timestamp is updated on each change
- createdAt timestamp remains unchanged
- Partial updates work correctly
- Function logs to CloudWatch
- API returns appropriate HTTP status codes

## Testing Checklist
- [ ] Valid update succeeds (200)
- [ ] Partial update succeeds (200)
- [ ] Non-existent character returns 404
- [ ] Updating other user's character returns 403
- [ ] Invalid data returns 400
- [ ] No auth token returns 401
- [ ] Invalid auth token returns 401
- [ ] updatedAt timestamp is current
- [ ] createdAt timestamp unchanged
- [ ] Character data correctly merged

## API Examples

### cURL Example - Full Update
```bash
curl -X PUT \
  https://api-id.execute-api.region.amazonaws.com/dev/characters/uuid-here \
  -H 'Authorization: Bearer <cognito-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "characterData": {
      "name": "Updated Name",
      "experience": 200
    }
  }'
```

### cURL Example - Partial Update
```bash
curl -X PUT \
  https://api-id.execute-api.region.amazonaws.com/dev/characters/uuid-here \
  -H 'Authorization: Bearer <cognito-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "characterData": {
      "experience": 250
    }
  }'
```

## Estimated Time
3-4 hours

## Dependencies
- Issue #1 (AWS Infrastructure Setup)
- Issue #2 (Create Character Lambda)
