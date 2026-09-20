# PATCHPULSE — REST API Documentation

Base URL: `/api`

All responses adhere to the standard envelope format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Body:** `{ "name": "...", "email": "...", "password": "...", "role": "CITIZEN" | "OPERATOR" | "ADMIN" }`
- **Response:** `{ "accessToken": "...", "user": { "id": "...", "name": "...", "role": "..." } }`

### `POST /api/auth/login`
Authenticates a user.
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `{ "accessToken": "...", "user": { ... } }`

### `GET /api/auth/me`
Retrieves authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`

---

## 2. Reports Endpoints

### `POST /api/reports`
Ingests a multi-modal citizen report, triggers AI classification, generates embeddings, executes clustering against active issues, and recalculates priority.
- **Body:**
```json
{
  "description": "Streetlight broken near parking area",
  "category": "STREETLIGHT",
  "locationName": "Block C Parking Area",
  "latitude": 12.9915,
  "longitude": 80.2337,
  "mediaUrl": "https://images.unsplash.com/...",
  "voiceUrl": "https://cdn.example.com/..."
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Report analyzed and clustered with existing incident",
  "data": {
    "report": { "id": "...", "status": "CLUSTERED" },
    "issue": { "id": "P-024", "priorityScore": 91, "priorityBand": "CRITICAL" },
    "isClustered": true
  }
}
```

### `GET /api/reports`
Query parameters: `page`, `limit`, `status`, `userId`.

---

## 3. Issues Endpoints

### `GET /api/issues`
Query parameters: `page`, `limit`, `search`, `category`, `priorityBand`, `status`, `sortBy`.

### `GET /api/issues/:id`
Returns full Issue Fingerprint, associated reports, signals, work orders, verifications, and priority reasoning.

### `PATCH /api/issues/:id/status`
Updates lifecycle status with controlled state transition validation.
- **Body:** `{ "status": "ASSIGNED" }`

### `POST /api/issues/:id/prioritize`
Manually recalculates explainable priority score.

---

## 4. Work Orders Endpoints

### `POST /api/work-orders`
Generates an actionable repair work order.
- **Body:** `{ "issueId": "P-024", "summary": "...", "requiredTeam": "Electrical Maintenance Unit 2" }`

### `GET /api/work-orders`
Query parameters: `page`, `limit`, `status`, `priority`.

### `PATCH /api/work-orders/:id/status`
Advances work order status: `ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED`.

---

## 5. Resolution Verification Endpoints

### `POST /api/issues/:id/verify`
Performs automated AI dual-frame visual verification comparing before vs after images.
- **Body:**
```json
{
  "afterImageUrl": "https://images.unsplash.com/...",
  "workOrderId": "PX-0192"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "isVerified": true,
    "confidence": 0.97,
    "recommendation": "VERIFIED RESOLVED: Defect rectified"
  }
}
```

### `POST /api/issues/:id/reopen`
Reopens a verified issue if defect reoccurs.
- **Body:** `{ "reason": "Flickering resumed after rain" }`

---

## 6. Live Telemetry & Signals

### `GET /api/signals/recent`
Returns real-time stream of latest weak signals across all sources.

---

## 7. Flagship 13-Step Simulation Controller

### `GET /api/demo/state`
Returns current step (1 to 13), progress, and step telemetry.

### `POST /api/demo/next`
Advances simulation by one step.

### `POST /api/demo/reset`
Restores clean initial demo state without database corruption.
