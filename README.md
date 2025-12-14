# Golden Gate Innovation Task- Feature-Based Architecture

A **clean, modular NestJS + PostgreSQL + TypeScript** backend where **each module contains everything it needs** - entities, services, controllers, and repositories.

## 📁 Project Structure (Simple & Clean!)

```
src/
├── modules/
│   ├── user/                   # Everything user-related
│   │   ├── entities/           # User data model
│   │   ├── dtos/               # API request/response shapes
│   │   ├── repositories/       # Database access
│   │   ├── services/           # Business logic
│   │   ├── controllers/        # HTTP endpoints
│   │   └── user.module.ts      # Module config
│   │
│   ├── subscription/           # Everything subscription-related
│   │   ├── entities/           # Bundle data model
│   │   ├── dtos/               # API shapes
│   │   ├── repositories/       # Database access
│   │   ├── services/           # Business logic
│   │   ├── controllers/        # HTTP endpoints
│   │   └── subscription.module.ts
│   │
│   └── chat/                   # Everything chat-related
│       ├── entities/           # ChatMessage data model
│       ├── dtos/               # API shapes
│       ├── repositories/       # Database access
│       ├── services/           # Chat + OpenAI logic
│       ├── controllers/        # HTTP endpoints
│       └── chat.module.ts
│
├── common/                     # Shared stuff only
│   ├── database/               # TypeORM setup
│   ├── exceptions/             # Custom errors
│   └── filters/                # Error handling
│
├── app.module.ts               # App entry
└── main.ts                     # Server setup
```

**That's it!** No confusing domain/infrastructure/application layers. Just simple modules!

---

## 🚀 Quick Start

### 1. Install

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

````env

PORT=5000
NODE_ENV=development
JWT_SECRET=Golden-Gate-Innovation
JWT_EXPIRES_IN=30d
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Mujeeb12345
DB_NAME=chatbotSystem

FREE_MESSAGES_PER_MONTH=3

MOCK_OPENAI_MIN_DELAY_MS=200
MOCK_OPENAI_MAX_DELAY_MS=300
MOCK_OPENAI_MIN_TOKENS=50
MOCK_OPENAI_MAX_TOKENS=500
OPENAI_API_KEY=API-KEY


### 5. Run

```bash
npm run start:dev
````

✅ Running at **http://localhost:5000/api/v1**

---

## 🎮 Features

### Module 1: Users (`modules/user/`)

- **Create users:** with email and User by default have Basic Bundle along with thier defined Quota
- **Login:** Return Access Token for authentication later user create bundle, chat and thier usage plans after authentication and authorization.

### Module 2: Subscriptions (`modules/subscription/`)

- **Bundle tiers:** Basic, Pro, Enterprise
- **Billing cycles:** Monthly or Yearly
- **Auto-renewal:** with payment simulation
- **Cancellation:** support
- **Usage tracking:** as according to the user plan usage + remainings messages.

### Module 3: Chat System (`modules/chat/`)

- **Mock OpenAI:** with realistic delays (200-800ms)
- **3 free messages/month:** per user (auto-resets)
- **Subscription bundles**:
  - Basic: 10 messages
  - Pro: 100 messages
  - Enterprise: Unlimited
- **Smart quota deduction** - uses bundle with most remaining
- **Token tracking** for each response
- **Chat history** persistence

---

## 📡 API Examples

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/v1/users/register-user \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Testing", "password": "password123"}'
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Testing",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Login (Get Access Token)

```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Response:**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Send Chat Message (Requires Authentication)

```bash
curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"question": "What is NestJS?"}'
```

**Response:**

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "question": "What is NestJS?",
  "answer": "That is an interesting question! Based on my analysis, here is what I can tell you...",
  "tokensUsed": 245,
  "createdAt": "2024-01-01T10:30:00.000Z"
}
```

**Note:** The `userId` is automatically extracted from the JWT token. The message quota is deducted from the user's active bundle.

### 4. Get Chat History (Requires Authentication)

```bash
curl -X GET http://localhost:5000/api/v1/chat/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
[
  {
    "id": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789",
    "question": "What is TypeScript?",
    "answer": "Great question! After processing your input, here is what I found...",
    "tokensUsed": 312,
    "createdAt": "2024-01-01T11:00:00.000Z"
  },
  {
    "id": "b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890",
    "question": "How does authentication work?",
    "answer": "I understand your inquiry. Let me provide you with a comprehensive response...",
    "tokensUsed": 189,
    "createdAt": "2024-01-01T10:45:00.000Z"
  },
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "question": "What is NestJS?",
    "answer": "That is an interesting question! Based on my analysis, here is what I can tell you...",
    "tokensUsed": 245,
    "createdAt": "2024-01-01T10:30:00.000Z"
  }
]
```

**Note:** Returns all chat messages for the authenticated user, ordered by creation date (newest first).

### 5. Get Monthly Usage (Requires Authentication)

```bash
curl -X GET http://localhost:5000/api/v1/chat/usage \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "bundleUsages": [
    {
      "bundleId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "tier": "BASIC",
      "messagesUsed": 3,
      "maxMessages": 10,
      "remainingMessages": 7
    }
  ]
}
```

### 6. Create Subscription Bundle (Requires Authentication)

```bash
curl -X POST http://localhost:5000/api/v1/subscriptions/bundles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"tier": "PRO", "billingCycle": "MONTHLY"}'
```

**Response:**

```json
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "tier": "PRO",
  "maxMessages": 100,
  "messagesUsed": 0,
  "remainingMessages": 100,
  "price": 49.99,
  "billingCycle": "MONTHLY",
  "status": "ACTIVE",
  "autoRenew": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-02-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:** The `userId` is automatically extracted from the JWT token.

### 7. Get User Bundles (Requires Authentication)

```bash
curl -X GET http://localhost:5000/api/v1/subscriptions/bundles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
[
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "tier": "PRO",
    "maxMessages": 100,
    "messagesUsed": 15,
    "remainingMessages": 85,
    "price": 49.99,
    "billingCycle": "MONTHLY",
    "status": "ACTIVE",
    "autoRenew": true,
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-02-15T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "tier": "BASIC",
    "maxMessages": 10,
    "messagesUsed": 3,
    "remainingMessages": 7,
    "price": 9.99,
    "billingCycle": "MONTHLY",
    "status": "ACTIVE",
    "autoRenew": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Note:** Returns all bundles for the authenticated user, ordered by creation date (newest first).

### 8. Get Active Bundles (Requires Authentication)

```bash
curl -X GET http://localhost:5000/api/v1/subscriptions/bundles/active \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
[
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "tier": "PRO",
    "maxMessages": 100,
    "messagesUsed": 15,
    "remainingMessages": 85,
    "price": 49.99,
    "billingCycle": "MONTHLY",
    "status": "ACTIVE",
    "autoRenew": true,
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-02-15T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "tier": "BASIC",
    "maxMessages": 10,
    "messagesUsed": 3,
    "remainingMessages": 7,
    "price": 9.99,
    "billingCycle": "MONTHLY",
    "status": "ACTIVE",
    "autoRenew": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Note:** Returns only active bundles for the authenticated user, ordered by creation date (newest first).

---

## 🏗️ How Each Module Works

### Example: User Module

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controller, Post, Body } from '@nestjs/common';

// ✅ Entity (data model with logic)
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column()
  name!: string;
}

// ✅ Repository (database access)
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}

// ✅ Service (business logic)
@Injectable()
export class UserService {
  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = User.create(dto.email, dto.name);
    return await this.userRepository.create(user);
  }
}

// ✅ Controller (HTTP endpoint)
@Controller('users')
export class UserController {
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }
}

// ✅ Module (wires everything together)
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 💾 Database

Using **TypeORM** with PostgreSQL:

```bash
# Generate a new migration
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

**Note:** The database uses `synchronize: true` in development mode, which automatically syncs entity changes. For production, use migrations instead.

---

## 📦 Tech Stack

- **NestJS** 10.x - Modern Node.js framework
- **TypeScript** - Strict typing
- **TypeORM** - Type-safe ORM
- **PostgreSQL** - Reliable database
- **class-validator** - Input validation
- **Jest** - Testing framework

---

## 🔑 Key Design Decisions

### 1. Self-Contained Modules

Each module has **everything it needs**:

- ✅ Own entities
- ✅ Own repositories
- ✅ Own services
- ✅ Own controllers
- ✅ Own DTOs

### 2. Shared Infrastructure

Only **truly shared** code goes in `common/`:

- Database connection (TypeORM)
- Global error handling
- Custom exceptions

---

## 🚦 Error Handling

All errors are caught and formatted consistently:

```json
{
  "statusCode": 402,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/api/v1/chat",
  "method": "POST",
  "message": "No active bundles. Please purchase one.",
  "error": "Quota Exceeded"
}
```

---

## 🎯 Best Practices

✅ Keep modules independent  
✅ Put feature code in the module folder  
✅ Only share what's truly global  
✅ Use dependency injection for cross-module deps  
✅ Write tests next to your code  
✅ Keep entities simple with behavior  
✅ Keep services focused on one thing

---

## 📚 Scripts

```bash
# Development
npm run start:dev          # Hot reload
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npm run migration:generate # Generate a new migration
npm run migration:run      # Run pending migrations
npm run migration:revert    # Revert the last migration

# Code Quality
npm run lint               # Check code style
npm run format             # Format code

# Testing
npm run test               # Run tests
npm run test:cov           # With coverage
npm run test:watch         # Watch mode
```

---
