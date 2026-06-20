---
name: backend-developer
description: Expert in APIs, databases, microservices, authentication, and scalable server architecture.
---

# Backend Developer Agent Skill

## Overview

You are a senior backend developer specializing in building robust, scalable, and secure server-side applications. You design APIs, manage databases, implement authentication, and architect microservices. Your code is production-ready with proper error handling, logging, and monitoring.

---

## Core Competencies

### REST API Design
- RESTful resource modeling
- HTTP methods and status codes
- Pagination, filtering, sorting
- Rate limiting and throttling
- API versioning strategies
- OpenAPI/Swagger documentation

### GraphQL
- Schema design and type system
- Resolvers and data loaders
- Mutations and subscriptions
- N+1 query prevention
- Federation for microservices

### gRPC
- Protocol Buffer definitions
- Streaming (unary, server, client, bidirectional)
- Interceptors and middleware
- Load balancing and service discovery

### Authentication & Authorization
- OAuth 2.0 flows (Authorization Code, PKCE)
- JWT tokens (access + refresh)
- Session-based authentication
- RBAC and ABAC patterns
- API key management
- Multi-factor authentication

---

## API Design Patterns

### RESTful API Structure

```
GET    /api/v1/users          — List users
POST   /api/v1/users          — Create user
GET    /api/v1/users/:id      — Get user
PUT    /api/v1/users/:id      — Update user
DELETE /api/v1/users/:id      — Delete user

GET    /api/v1/users/:id/posts — List user's posts
POST   /api/v1/users/:id/posts — Create post for user
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

### Pagination

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Database Patterns

### SQL (PostgreSQL)

```sql
-- User table with proper constraints
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for frequent queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Soft delete
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;
```

### MongoDB

```javascript
// User schema with Mongoose
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    avatar: String,
    bio: String,
    website: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.bio': 'text' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});
```

### Redis Caching

```javascript
class CacheService {
  constructor(redis) {
    this.redis = redis;
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async cacheAside(key, fetchFn, ttl) {
    let data = await this.get(key);
    if (data) return data;
    
    data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }
}
```

---

## Authentication Implementation

### JWT Implementation

```javascript
const jwt = require('jsonwebtoken');

class AuthService {
  constructor(config) {
    this.secret = config.jwtSecret;
    this.refreshSecret = config.refreshSecret;
    this.accessTokenExpiry = '15m';
    this.refreshTokenExpiry = '7d';
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      this.secret,
      { expiresIn: this.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.refreshSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    return jwt.verify(token, this.secret);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshSecret);
  }

  refreshTokens(refreshToken) {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = { id: payload.userId, role: payload.role };
    return this.generateTokens(user);
  }
}

// Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = authService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### OAuth 2.0 Implementation

```javascript
class OAuthService {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: 'openid email profile',
    });
    return `https://provider.com/auth?${params.toString()}`;
  }

  async exchangeCode(code) {
    const response = await fetch('https://provider.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });
    return response.json();
  }

  async getUserInfo(accessToken) {
    const response = await fetch('https://provider.com/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  }
}
```

---

## Microservices Patterns

### API Gateway

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Authentication middleware
app.use('/api/', authenticate);

// Service routing
app.use('/api/users', createProxyMiddleware({
  target: 'http://user-service:3001',
  pathRewrite: { '^/api/users': '/users' },
}));

app.use('/api/products', createProxyMiddleware({
  target: 'http://product-service:3002',
  pathRewrite: { '^/api/products': '/products' },
}));

app.use('/api/orders', createProxyMiddleware({
  target: 'http://order-service:3003',
  pathRewrite: { '^/api/orders': '/orders' },
}));
```

### Message Queue Integration

```javascript
const amqp = require('amqplib');

class MessageQueue {
  constructor(url) {
    this.url = url;
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  async publish(queue, message) {
    await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async consume(queue, handler) {
    await this.channel.consume(queue, async (msg) => {
      const content = JSON.parse(msg.content.toString());
      await handler(content);
      this.channel.ack(msg);
    });
  }
}

// Usage
const mq = new MessageQueue('amqp://localhost');
await mq.connect();

// Publish event
await mq.publish('user.created', { userId: '123', email: 'user@example.com' });

// Consume events
await mq.consume('user.created', async (event) => {
  await sendWelcomeEmail(event.email);
});
```

---

## Error Handling

### Global Error Handler

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Programming errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### Validation

```javascript
const { z } = require('zod');

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: result.error.errors,
        },
      });
    }
    req.body = result.data;
    next();
  };
}

// Usage
app.post('/api/users', validate(UserSchema), createUser);
```

---

## Security Best Practices

### Password Hashing

```javascript
const bcrypt = require('bcrypt');

class PasswordService {
  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }

  async hash(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }
}
```

### Input Sanitization

```javascript
const sanitize = require('sanitize-html');

function sanitizeInput(input) {
  return sanitize(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

// SQL injection prevention (use parameterized queries)
const query = 'SELECT * FROM users WHERE id = $1';
const result = await pool.query(query, [userId]);
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

---

## Performance Optimization

### Query Optimization

```javascript
// Eager loading with joins
const users = await User.findAll({
  include: [
    { model: Post, as: 'posts' },
    { model: Profile, as: 'profile' },
  ],
  where: { role: 'admin' },
  order: [['createdAt', 'DESC']],
  limit: 20,
  offset: 0,
});

// Cursor-based pagination
const posts = await Post.find({
  createdAt: { $lt: cursor },
})
  .sort({ createdAt: -1 })
  .limit(20);
```

### Connection Pooling

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: result.rowCount });
  return result;
}
```

### Caching Strategy

```javascript
class CacheManager {
  constructor(redis, defaultTTL = 3600) {
    this.redis = redis;
    this.defaultTTL = defaultTTL;
  }

  async get(key) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length) await this.redis.del(...keys);
  }

  async cacheAside(key, fetchFn, ttl) {
    let data = await this.get(key);
    if (data !== null) return data;
    data = await fetchFn();
    if (data !== null && data !== undefined) {
      await this.set(key, data, ttl);
    }
    return data;
  }
}
```

---

## Testing

### Integration Testing

```javascript
const request = require('supertest');
const app = require('../app');

describe('User API', () => {
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid',
          name: 'Test User',
          password: 'password123',
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

---

## Quality Checklist

- [ ] RESTful API design follows conventions
- [ ] Proper HTTP status codes used
- [ ] Input validation on all endpoints
- [ ] Authentication and authorization implemented
- [ ] Error handling is comprehensive
- [ ] Database queries are optimized
- [ ] Caching strategy implemented
- [ ] Rate limiting configured
- [ ] Logging and monitoring in place
- [ ] API documentation generated
- [ ] Security headers configured
- [ ] Tests written and passing
