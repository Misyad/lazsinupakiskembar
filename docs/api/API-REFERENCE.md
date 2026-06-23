# API Documentation - KOINNU Ranting System

## Base URL

```
Development: http://localhost:3000
Production: https://api.lazisnupakem.projecthasan.com
```

## Authentication

All protected endpoints require session cookie authentication.

**Session Cookie:** `koinnu_session`

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "ADMIN_RANTING",
    "roles": ["ADMIN_RANTING"]
  }
}
```

### Logout
```http
POST /api/auth/logout
```

### Get Current User
```http
GET /api/auth/me
```

## Houses (Rumah Donatur)

### List Houses
```http
GET /api/houses
Authorization: Required (houses.read permission)
```

**Response:**
```json
{
  "houses": [
    {
      "id": 1,
      "name": "Keluarga H. Ahmad",
      "address": "Jl. Merdeka No. 123",
      "rtRw": "RT01/RW02",
      "phone": "081234567890",
      "active": true
    }
  ]
}
```

### Create House
```http
POST /api/houses
Authorization: Required (houses.create permission)
Content-Type: application/json

{
  "areaId": 1,
  "name": "Keluarga Baru",
  "phone": "081234567890",
  "address": "Jl. Test No. 456",
  "rtRw": "RT02/RW03",
  "joinedAt": "2026-05-01T00:00:00.000Z"
}
```

### Update House
```http
PATCH /api/houses/:id
Authorization: Required (houses.update permission)
```

### Delete House (Soft Delete)
```http
DELETE /api/houses/:id
Authorization: Required (houses.delete permission)
```

## Coin Boxes (Kaleng)

### List Coin Boxes
```http
GET /api/coin-boxes
Authorization: Required (coin_boxes.read permission)
```

### Create Coin Box
```http
POST /api/coin-boxes
Authorization: Required (coin_boxes.create permission)

{
  "boxNumber": "KNU-RT01-001",
  "status": "ACTIVE",
  "distributedAt": "2026-01-15T00:00:00.000Z"
}
```

### Assign Coin Box to House
```http
POST /api/coin-boxes/:id/assign
Authorization: Required (coin_boxes.assign permission)

{
  "houseId": 1,
  "assignedAt": "2026-05-01T00:00:00.000Z"
}
```

## Withdrawals (Penarikan)

### List Withdrawals
```http
GET /api/withdrawals
Authorization: Required (withdrawals.read permission)
```

### Create Withdrawal
```http
POST /api/withdrawals
Authorization: Required (withdrawals.create permission)

{
  "coinBoxId": 1,
  "houseId": 1,
  "amount": 50000,
  "notes": "Penarikan rutin",
  "collectedAt": "2026-05-15T10:00:00.000Z"
}
```

### Validate Withdrawal
```http
POST /api/withdrawals/:id/validate
Authorization: Required (withdrawals.validate permission)
```

**Response:**
```json
{
  "withdrawal": {
    "id": 1,
    "status": "VALIDATED",
    "validatedAt": "2026-05-16T09:00:00.000Z"
  }
}
```

### Reject Withdrawal
```http
POST /api/withdrawals/:id/reject
Authorization: Required (withdrawals.reject permission)

{
  "reason": "Nominal tidak sesuai"
}
```

### Void Withdrawal
```http
POST /api/withdrawals/:id/void
Authorization: Required (withdrawals.void permission)

{
  "reason": "Input salah"
}
```

## Finance (Keuangan)

### Get Financial Summary
```http
GET /api/finance/summary
Authorization: Required (finance.read permission)
```

**Response:**
```json
{
  "summary": {
    "income": 1000000,
    "expense": 200000,
    "adjustment": 50000,
    "balance": 850000,
    "pendingWithdrawals": 5,
    "activeHouses": 50,
    "activeBoxes": 45
  }
}
```

## Reports (Laporan)

### Export PDF
```http
GET /api/reports/:period/export-pdf
Authorization: Required (finance.read permission)

Example: GET /api/reports/2026-05/export-pdf
```

**Response:** PDF file download

### Export Excel
```http
GET /api/reports/:period/export-excel
Authorization: Required (finance.read permission)

Example: GET /api/reports/2026-05/export-excel
```

**Response:** Excel file download

## Health Check

### System Health
```http
GET /api/health
Authorization: None (public endpoint)
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-06-23T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "responseTime": "15ms"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 300
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 5 minutes
- Returns 429 status when exceeded
- Retry-After header indicates wait time

## CORS

- Enabled for configured origins
- Credentials: included
- Methods: GET, POST, PATCH, DELETE, OPTIONS
