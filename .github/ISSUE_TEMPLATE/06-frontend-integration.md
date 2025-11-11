---
name: Frontend Integration with AWS
about: Integrate React frontend with AWS Cognito and Lambda APIs
title: "[FRONTEND] Integrate with AWS Backend Services"
labels: frontend, integration, aws
assignees: ''
---

## Overview
Update the React frontend to use AWS Cognito for authentication and Lambda/API Gateway for character management instead of localStorage.

## Prerequisites
- Issue #1 (AWS Infrastructure Setup) completed
- Issue #2-5 (All Lambda functions) completed
- All API endpoints tested and working
- Cognito User Pool configured

## Implementation Requirements

### 1. AWS Amplify Setup
Install and configure AWS Amplify for easy AWS integration.

#### Tasks
- [ ] Install dependencies:
  ```bash
  npm install aws-amplify @aws-amplify/ui-react
  ```
- [ ] Create `src/aws-config.ts`:
  ```typescript
  export const awsConfig = {
    Auth: {
      Cognito: {
        userPoolId: 'YOUR_USER_POOL_ID',
        userPoolClientId: 'YOUR_CLIENT_ID',
        region: 'us-east-1'
      }
    },
    API: {
      REST: {
        charactersAPI: {
          endpoint: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev',
          region: 'us-east-1'
        }
      }
    }
  };
  ```
- [ ] Initialize Amplify in `src/main.tsx`:
  ```typescript
  import { Amplify } from 'aws-amplify';
  import { awsConfig } from './aws-config';
  
  Amplify.configure(awsConfig);
  ```

### 2. Authentication Components
Create authentication UI using Amplify UI components.

#### Tasks
- [ ] Create `src/components/Auth/Login.tsx`
  - Use `Authenticator` component from `@aws-amplify/ui-react`
  - Handle sign up, sign in, forgot password flows
  - Customize UI to match app theme
- [ ] Update `src/App.tsx` to wrap with Authenticator
- [ ] Create protected route wrapper
- [ ] Add sign out button to UI
- [ ] Test authentication flow

#### Example Implementation
```typescript
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <p>Welcome {user?.username}</p>
          <button onClick={signOut}>Sign out</button>
          {/* Your app components */}
        </div>
      )}
    </Authenticator>
  );
}
```

### 3. API Service Layer
Create service layer to interact with Lambda functions via API Gateway.

#### Tasks
- [ ] Create `src/services/api.ts`:
  ```typescript
  import { fetchAuthSession } from 'aws-amplify/auth';
  import { get, post, put, del } from 'aws-amplify/api';
  
  export const characterAPI = {
    getAll: async () => {
      return await get({
        apiName: 'charactersAPI',
        path: '/characters'
      }).response;
    },
    
    create: async (characterData: any) => {
      return await post({
        apiName: 'charactersAPI',
        path: '/characters',
        options: {
          body: { characterData }
        }
      }).response;
    },
    
    update: async (characterId: string, characterData: any) => {
      return await put({
        apiName: 'charactersAPI',
        path: `/characters/${characterId}`,
        options: {
          body: { characterData }
        }
      }).response;
    },
    
    delete: async (characterId: string) => {
      return await del({
        apiName: 'charactersAPI',
        path: `/characters/${characterId}`
      }).response;
    }
  };
  ```

### 4. Update Character Management Components

#### CharacterList Component Updates
- [ ] Replace localStorage calls with API calls
- [ ] Update `src/components/CharacterList.tsx`:
  - Use `characterAPI.getAll()` on component mount
  - Add loading state while fetching
  - Add error handling
  - Update delete handler to use `characterAPI.delete()`
  - Refresh list after create/update/delete operations

#### CharacterForm Component Updates
- [ ] Update `src/components/CharacterForm.tsx`:
  - Use `characterAPI.create()` for new characters
  - Use `characterAPI.update()` for existing characters
  - Add loading state during save
  - Add error handling and user feedback
  - Show success message on save

#### XPManager Component Updates
- [ ] Update `src/components/XPManager.tsx`:
  - Use `characterAPI.update()` when spending XP
  - Add loading state during updates
  - Add error handling
  - Optimistic UI updates (update UI immediately, rollback on error)

### 5. State Management
Implement proper state management for characters.

#### Tasks
- [ ] Create React Context or use state management library
- [ ] Create `src/context/CharacterContext.tsx`:
  ```typescript
  interface CharacterContextType {
    characters: Character[];
    loading: boolean;
    error: string | null;
    fetchCharacters: () => Promise<void>;
    createCharacter: (data: any) => Promise<void>;
    updateCharacter: (id: string, data: any) => Promise<void>;
    deleteCharacter: (id: string) => Promise<void>;
  }
  ```
- [ ] Implement CRUD operations in context
- [ ] Add loading and error states
- [ ] Wrap app with CharacterProvider

### 6. Error Handling & User Feedback
Implement comprehensive error handling.

#### Tasks
- [ ] Create error boundary component
- [ ] Create toast/notification system for user feedback
- [ ] Handle network errors gracefully
- [ ] Handle authentication errors (token expiry, etc.)
- [ ] Add retry logic for failed requests
- [ ] Display user-friendly error messages

### 7. Migration from localStorage
Handle existing localStorage data.

#### Tasks
- [ ] Create migration utility
- [ ] On first login, check for localStorage data
- [ ] Prompt user to migrate existing characters
- [ ] Bulk create characters from localStorage
- [ ] Clear localStorage after successful migration
- [ ] Add skip migration option

### 8. Loading States & UX
Improve user experience during async operations.

#### Tasks
- [ ] Add loading spinners for all async operations
- [ ] Implement skeleton screens for character list
- [ ] Add optimistic UI updates
- [ ] Disable buttons during operations
- [ ] Add success/error toast notifications

### 9. Testing
Comprehensive testing of integration.

#### Tasks
- [ ] Test user sign up flow
- [ ] Test user sign in flow
- [ ] Test sign out flow
- [ ] Test password reset flow
- [ ] Test creating characters (authenticated)
- [ ] Test fetching characters (authenticated)
- [ ] Test updating characters (authenticated)
- [ ] Test deleting characters (authenticated)
- [ ] Test unauthorized access handling
- [ ] Test network error scenarios
- [ ] Test localStorage migration

### 10. Environment Variables
Configure environment-specific settings.

#### Tasks
- [ ] Create `.env.example`:
  ```
  VITE_AWS_REGION=us-east-1
  VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
  VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
  VITE_API_ENDPOINT=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
  ```
- [ ] Update `.gitignore` to exclude `.env`
- [ ] Update `src/aws-config.ts` to use environment variables
- [ ] Document required environment variables in README

## Deliverables
- [ ] Authentication fully integrated
- [ ] All character CRUD operations using Lambda APIs
- [ ] localStorage migration implemented
- [ ] Loading states and error handling
- [ ] User feedback (toasts/notifications)
- [ ] Documentation updated
- [ ] Testing completed

## Acceptance Criteria
- Users can sign up, sign in, and sign out
- Characters are stored in DynamoDB (not localStorage)
- All CRUD operations work correctly
- Proper error handling for all scenarios
- Loading states during async operations
- Users can only access their own characters
- Existing localStorage data can be migrated
- UI is responsive and provides good UX

## Testing Checklist
- [ ] Sign up creates new Cognito user
- [ ] Sign in authenticates user
- [ ] Sign out clears session
- [ ] Creating character saves to DynamoDB
- [ ] Fetching characters retrieves from API
- [ ] Updating character saves changes to DynamoDB
- [ ] Deleting character removes from DynamoDB
- [ ] Token refresh works automatically
- [ ] Expired token redirects to login
- [ ] Network errors show user-friendly messages
- [ ] localStorage migration works correctly

## Code Structure
```
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx
│   ├── CharacterList.tsx (updated)
│   ├── CharacterForm.tsx (updated)
│   └── XPManager.tsx (updated)
├── context/
│   └── CharacterContext.tsx
├── services/
│   └── api.ts
├── utils/
│   └── migration.ts
└── aws-config.ts
```

## Estimated Time
6-8 hours

## Dependencies
- Issue #1 (AWS Infrastructure Setup)
- Issue #2 (Create Character Lambda)
- Issue #3 (Get Characters Lambda)
- Issue #4 (Update Character Lambda)
- Issue #5 (Delete Character Lambda)

## Additional Resources
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify UI React Components](https://ui.docs.amplify.aws/react)
- [AWS Amplify Auth Guide](https://docs.amplify.aws/react/build-a-backend/auth/)
