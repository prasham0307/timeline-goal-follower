# API Documentation - Timeline Goal Follower

Base URL (Development): `http://localhost:3001/api`

## Authentication

All endpoints except `/auth/signup` and `/auth/login` require authentication via Bearer token.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Auth Endpoints

### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"  // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- 400: Validation error or user already exists
- 500: Server error

---

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "prasham@example.com",
  "password": "changeme"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clx123abc",
    "email": "prasham@example.com",
    "name": "Prasham"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- 401: Invalid credentials
- 500: Server error

---

### GET /auth/me
Get current user information.

**Response (200):**
```json
{
  "user": {
    "id": "clx123abc",
    "email": "prasham@example.com",
    "name": "Prasham",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Errors:**
- 401: Unauthorized
- 404: User not found

---

### POST /auth/password-reset
Request password reset (currently stubbed).

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

---

## Goal Endpoints

### GET /goals
Get all goals for the authenticated user.

**Response (200):**
```json
{
  "goals": [
    {
      "id": "goal123",
      "title": "4-Month Fitness Transformation",
      "description": "Get fit and healthy",
      "startDate": "2025-06-01T00:00:00Z",
      "deadline": "2025-09-30T00:00:00Z",
      "template": "Fitness 4-Month Plan",
      "defaultTasks": "[...]",
      "progress": {
        "percentage": 45,
        "completed": 54,
        "total": 120
      },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /goals
Create a new goal.

**Request:**
```json
{
  "title": "Learn Spanish",
  "description": "Become conversational in 90 days",
  "startDate": "2025-06-01T00:00:00Z",
  "deadline": "2025-08-30T00:00:00Z",
  "template": "Language Learning 90 Days",  // optional
  "defaultTasks": [  // optional, loaded from template if not provided
    {
      "title": "Duolingo 30min",
      "isRecurring": true,
      "recurrence": "daily"
    },
    {
      "title": "Practice speaking",
      "isRecurring": true,
      "recurrence": "mon,wed,fri"
    }
  ]
}
```

**Response (201):**
```json
{
  "goal": {
    "id": "goal456",
    "userId": "user123",
    "title": "Learn Spanish",
    "description": "Become conversational in 90 days",
    "startDate": "2025-06-01T00:00:00Z",
    "deadline": "2025-08-30T00:00:00Z",
    "template": "Language Learning 90 Days",
    "defaultTasks": "[...]",
    "tasks": [],
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "warning": "Goal duration exceeds 365 days..."  // if applicable
}
```

**Errors:**
- 400: Validation error or invalid date range
- 500: Server error

---

### GET /goals/:goalId
Get detailed goal information with timeline preview.

**Response (200):**
```json
{
  "goal": {
    "id": "goal123",
    "title": "4-Month Fitness Transformation",
    "description": "...",
    "startDate": "2025-06-01T00:00:00Z",
    "deadline": "2025-09-30T00:00:00Z",
    "template": "Fitness 4-Month Plan",
    "defaultTasks": [
      {
        "title": "Morning cardio 30min",
        "isRecurring": true,
        "recurrence": "daily"
      }
    ],
    "tasks": [...]
  },
  "timeline": [
    {
      "date": "2025-06-01T00:00:00Z",
      "defaultTasks": [...],
      "tasks": []
    }
    // ... first 30 days
  ],
  "totalDays": 122,
  "tasksByDate": {
    "2025-06-01": [...],
    "2025-06-02": [...]
  },
  "progress": {
    "percentage": 45,
    "completed": 54,
    "total": 120
  }
}
```

**Errors:**
- 404: Goal not found
- 401: Unauthorized

---

### GET /goals/:goalId/days/:date
Get tasks for a specific day.

**Example:** `/goals/goal123/days/2025-06-15`

**Response (200):**
```json
{
  "date": "2025-06-15T00:00:00Z",
  "defaultTasks": [
    {
      "title": "Morning cardio 30min",
      "isRecurring": true,
      "recurrence": "daily"
    }
  ],
  "tasks": [
    {
      "id": "task123",
      "title": "Gym: Leg day",
      "notes": "Focus on squats and lunges",
      "date": "2025-06-15T00:00:00Z",
      "completed": false,
      "isRecurring": false,
      "recurrence": null
    }
  ],
  "progress": {
    "percentage": 25,
    "completed": 1,
    "total": 4
  }
}
```

---

### POST /goals/:goalId/generate-timeline
Regenerate timeline for a goal (idempotent operation).

**Response (200):**
```json
{
  "timeline": [
    {
      "date": "2025-06-01T00:00:00Z",
      "defaultTasks": [...],
      "tasks": []
    }
  ],
  "totalDays": 122
}
```

---

### POST /goals/:goalId/tasks
Create a task for a goal.

**Request:**
```json
{
  "title": "Gym: Leg day",
  "notes": "Focus on squats and lunges",
  "date": "2025-06-15T00:00:00Z",  // optional, for one-off tasks
  "isRecurring": false,
  "recurrence": null  // or "daily", "mon,wed,fri", etc.
}
```

**Response (201):**
```json
{
  "task": {
    "id": "task123",
    "goalId": "goal123",
    "userId": "user123",
    "title": "Gym: Leg day",
    "notes": "Focus on squats and lunges",
    "date": "2025-06-15T00:00:00Z",
    "completed": false,
    "isRecurring": false,
    "recurrence": null,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### DELETE /goals/:goalId
Delete a goal and all associated tasks.

**Response (200):**
```json
{
  "message": "Goal deleted successfully"
}
```

---

## Task Endpoints

### PATCH /tasks/:taskId
Update a task (toggle completion, edit details).

**Request:**
```json
{
  "title": "Updated title",
  "notes": "Updated notes",
  "completed": true,
  "date": "2025-06-16T00:00:00Z",
  "isRecurring": false,
  "recurrence": "daily"
}
```
All fields are optional. Send only fields to update.

**Response (200):**
```json
{
  "task": {
    "id": "task123",
    "title": "Updated title",
    "notes": "Updated notes",
    "completed": true,
    // ... other fields
  }
}
```

**Errors:**
- 404: Task not found
- 401: Unauthorized

---

### DELETE /tasks/:taskId
Delete a task.

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

## Template Endpoints

### GET /templates
Get all available goal templates.

**Response (200):**
```json
{
  "templates": [
    {
      "id": "tpl123",
      "name": "Fitness 4-Month Plan",
      "description": "A comprehensive 4-month fitness program",
      "category": "Fitness",
      "defaultTasks": [
        {
          "title": "Morning cardio 30min",
          "isRecurring": true,
          "recurrence": "daily"
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /templates/:name
Get a specific template by name.

**Example:** `/templates/Fitness%204-Month%20Plan`

**Response (200):**
```json
{
  "template": {
    "id": "tpl123",
    "name": "Fitness 4-Month Plan",
    "description": "A comprehensive 4-month fitness program",
    "category": "Fitness",
    "defaultTasks": [...]
  }
}
```

**Errors:**
- 404: Template not found

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message here"
}
```

or for validation errors:

```json
{
  "error": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["title"],
      "message": "Title is required"
    }
  ]
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid token)
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

---

## Pagination

Currently not implemented. All endpoints return full results. For production with large datasets:

```
GET /goals?page=1&limit=20
```

---

## Webhooks (Future)

Not yet implemented. Potential webhook events:
- `goal.created`
- `goal.completed`
- `task.completed`
- `reminder.due`
