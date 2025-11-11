---
name: Lambda Function - Get Characters
about: Implement Lambda function to retrieve user's characters
title: "[LAMBDA] Implement Get Characters Function"
labels: backend, lambda, aws
assignees: ''
---

## Overview
Create a Lambda function that retrieves all characters belonging to an authenticated user from DynamoDB.

## Prerequisites
- Issue #1 (AWS Infrastructure Setup) must be completed
- Issue #2 (Create Character Lambda) completed (for test data)
- DynamoDB `rpg-characters` table with GSI `userId-createdAt-index`

## Function Specifications

### Function Name
`rpg-get-characters`

### Runtime
Node.js 20.x

### Handler
`index.handler`

### Trigger
API Gateway - `GET /characters`

### Authentication
Requires Cognito JWT token in `Authorization` header

## Implementation Requirements

### Input
No request body. UserId extracted from JWT token.

Optional Query Parameters:
- `limit`: Number of results to return (default: 20, max: 100)
- `nextToken`: Pagination token for next page

### Expected Output (Success)
```json
{
  "statusCode": 200,
  "body": {
    "characters": [
      {
        "characterId": "uuid-1",
        "userId": "cognito-user-id",
        "characterName": "Aragorn",
        "characterData": { /* full character object */ },
        "createdAt": "2025-11-10T12:00:00.000Z",
        "updatedAt": "2025-11-10T12:00:00.000Z"
      },
      {
        "characterId": "uuid-2",
        "userId": "cognito-user-id",
        "characterName": "Gandalf",
        "characterData": { /* full character object */ },
        "createdAt": "2025-11-09T10:00:00.000Z",
        "updatedAt": "2025-11-09T10:00:00.000Z"
      }
    ],
    "count": 2,
    "nextToken": null
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

// 500 - Internal Server Error
{
  "statusCode": 500,
  "body": {
    "error": "Internal server error",
    "details": "Failed to retrieve characters"
  }
}
```

## Tasks

### 1. Lambda Function Development
- [ ] Create `lambda/get-characters/index.js`
- [ ] Extract userId from Cognito JWT token
- [ ] Parse query parameters (limit, nextToken)
- [ ] Query DynamoDB using GSI `userId-createdAt-index`
- [ ] Sort characters by createdAt (newest first)
- [ ] Implement pagination support
- [ ] Handle empty results gracefully
- [ ] Implement error handling and logging
- [ ] Add CORS headers to response

### 2. Dependencies
- [ ] Create `package.json`:
  ```json
  {
    "dependencies": {
      "@aws-sdk/client-dynamodb": "^3.0.0",
      "@aws-sdk/lib-dynamodb": "^3.0.0"
    }
  }
  ```

### 3. Environment Variables
- [ ] Configure Lambda environment variables:
  - `CHARACTERS_TABLE_NAME`: DynamoDB table name
  - `USER_INDEX_NAME`: GSI name (`userId-createdAt-index`)
  - `AWS_REGION`: AWS region

### 4. Lambda Configuration
- [ ] Set memory to 256 MB
- [ ] Set timeout to 10 seconds
- [ ] Attach IAM execution role
- [ ] Enable CloudWatch Logs

### 5. API Gateway Integration
- [ ] Create `GET /characters` endpoint
- [ ] Configure Lambda proxy integration
- [ ] Attach Cognito Authorizer
- [ ] Enable CORS
- [ ] Configure query string parameters
- [ ] Deploy API

### 6. Testing
- [ ] Test with user who has multiple characters
- [ ] Test with user who has no characters (empty array)
- [ ] Test pagination with limit parameter
- [ ] Test with unauthorized request
- [ ] Verify characters are sorted by creation date
- [ ] Verify only user's own characters are returned
- [ ] Document test cases

## Code Structure
```
lambda/
└── get-characters/
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
- [ ] Documentation with API examples
- [ ] Postman collection or curl examples

## Acceptance Criteria
- Authenticated users can retrieve their characters
- Only user's own characters are returned
- Characters are sorted by creation date (newest first)
- Empty array returned when user has no characters
- Pagination works correctly with limit parameter
- Proper error messages for invalid requests
- Function logs to CloudWatch
- API returns appropriate HTTP status codes

## Testing Checklist
- [ ] User with characters receives correct list (200)
- [ ] User with no characters receives empty array (200)
- [ ] Characters are sorted correctly (newest first)
- [ ] Limit parameter restricts results
- [ ] No auth token returns 401
- [ ] Invalid auth token returns 401
- [ ] User A cannot see User B's characters
- [ ] Pagination token works for large result sets

## API Examples

### cURL Example
```bash
curl -X GET \
  https://api-id.execute-api.region.amazonaws.com/dev/characters \
  -H 'Authorization: Bearer <cognito-jwt-token>'
```

### With Pagination
```bash
curl -X GET \
  'https://api-id.execute-api.region.amazonaws.com/dev/characters?limit=10' \
  -H 'Authorization: Bearer <cognito-jwt-token>'
```

## Estimated Time
2-3 hours

## Dependencies
- Issue #1 (AWS Infrastructure Setup)
- Issue #2 (Create Character Lambda) - for test data
