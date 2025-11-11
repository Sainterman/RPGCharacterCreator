---
name: Lambda Function - Delete Character
about: Implement Lambda function to delete characters
title: "[LAMBDA] Implement Delete Character Function"
labels: backend, lambda, aws
assignees: ''
---

## Overview
Create a Lambda function that allows authenticated users to delete their own characters from DynamoDB.

## Prerequisites
- Issue #1 (AWS Infrastructure Setup) completed
- Issue #2 (Create Character Lambda) completed
- DynamoDB `rpg-characters` table configured

## Function Specifications

### Function Name
`rpg-delete-character`

### Runtime
Node.js 20.x

### Handler
`index.handler`

### Trigger
API Gateway - `DELETE /characters/{characterId}`

### Authentication
Requires Cognito JWT token in `Authorization` header

## Implementation Requirements

### Input
**Path Parameter:** `characterId` (UUID)

No request body required.

### Expected Output (Success)
```json
{
  "statusCode": 200,
  "body": {
    "message": "Character deleted successfully",
    "characterId": "uuid-here"
  }
}
```

### Error Responses
```json
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
    "details": "You can only delete your own characters"
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
    "details": "Failed to delete character"
  }
}
```

## Tasks

### 1. Lambda Function Development
- [ ] Create `lambda/delete-character/index.js`
- [ ] Extract userId from Cognito JWT token
- [ ] Extract characterId from path parameters
- [ ] Retrieve existing character from DynamoDB
- [ ] Verify character belongs to authenticated user (authorization check)
- [ ] Delete character from DynamoDB
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

// Proceed with deletion
await deleteCharacterFromDB(characterId, userId);
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
- [ ] Create `DELETE /characters/{characterId}` endpoint
- [ ] Configure path parameter: `characterId`
- [ ] Configure Lambda proxy integration
- [ ] Attach Cognito Authorizer
- [ ] Enable CORS
- [ ] Deploy API

### 7. Testing
- [ ] Test deleting own character (success)
- [ ] Test deleting non-existent character (404)
- [ ] Test deleting another user's character (403)
- [ ] Test with unauthorized request (401)
- [ ] Verify character is removed from DynamoDB
- [ ] Verify deleted character doesn't appear in GET /characters
- [ ] Document test cases

## Code Structure
```
lambda/
└── delete-character/
    ├── index.js          # Main handler
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
- Authenticated users can delete their own characters
- Users cannot delete other users' characters (403)
- Non-existent characters return 404
- Character is completely removed from DynamoDB
- Deleted characters don't appear in subsequent GET requests
- Function logs to CloudWatch
- API returns appropriate HTTP status codes

## Testing Checklist
- [ ] Valid deletion succeeds (200)
- [ ] Non-existent character returns 404
- [ ] Deleting other user's character returns 403
- [ ] No auth token returns 401
- [ ] Invalid auth token returns 401
- [ ] Character removed from DynamoDB
- [ ] Deleted character not in GET /characters response
- [ ] Can re-create character with same name after deletion

## API Examples

### cURL Example
```bash
curl -X DELETE \
  https://api-id.execute-api.region.amazonaws.com/dev/characters/uuid-here \
  -H 'Authorization: Bearer <cognito-jwt-token>'
```

## Optional Enhancement
Consider implementing soft delete (mark as deleted instead of removing):
- [ ] Add `deleted` boolean field to character schema
- [ ] Update delete logic to set `deleted: true`
- [ ] Update GET characters to filter out deleted characters
- [ ] Add `deletedAt` timestamp field

This allows for potential "undo" functionality and data recovery.

## Estimated Time
2-3 hours

## Dependencies
- Issue #1 (AWS Infrastructure Setup)
- Issue #2 (Create Character Lambda)
- Issue #3 (Get Characters Lambda) - for verification testing
