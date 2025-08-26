# Social Media Application

A modern full-stack social media application built with Next.js, Fastify, tRPC, and PostgreSQL. This is a monorepo containing both the frontend client and backend server applications.

## 🏗️ Project Structure
```
social-app/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/     # Next.js App Router pages
│   │   ├── components/  # Reusable UI components
│   │   ├── modules/ # Feature-specific modules (auth, posts, etc.)
│   │   ├── trpc/    # tRPC client configuration
│   │   └── ...
│   ├── package.json
│   └── README.md
└── server/          # Fastify backend application
│   ├── src/
│   │   ├── api/     # API route handlers
│   │   ├── db/      # Database schema and configuration
│   │   ├── router/  # tRPC router definitions
│   │   ├── handlers/ # Authentication and other handlers
│   │   └── ...
│   ├── package.json
│   └── drizzle.config.ts
└── README.md
```

## 🚀 Features

- **User Authentication**: Secure authentication
- **Post Management**: Create, edit, delete, and view posts
- **Comment System**: Interactive commenting system
- **Search Functionality**: Search posts by content and username
- **Admin Features**: Content moderation and user management
- **Profile Management**: User profile customization
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: End-to-end type safety with TypeScript and tRPC

## 🛠️ Tech Stack

### Frontend (Client)
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Shadcn/ui** - UI component library
- **tRPC** - Type-safe API client
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend (Server)
- **Fastify** - Fast and efficient web framework
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Database (via Neon)
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/khanhphan162/social-app.git
cd social-app
```

### 2. Install dependencies
```bash
# Install dependencies for both client and server
pnpm install
```

### 3. Environment Setup

#### Server Environment
Create `server/.env` file:
```env
DATABASE_URL=your_postgresql_connection_string
PORT=4000
FRONTEND_URL=http://localhost:3000
```

#### Client Environment
Create `client/.env` file:
```env
BACKEND_URL=http://localhost:4000
```

### 4. Database Setup
```bash
# Navigate to server directory
cd server

# Generate database schema
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 5. Start Development Servers

#### Terminal 1 - Start Backend Server
```bash
cd server
pnpm dev
```
Server will run on http://localhost:4000

#### Terminal 2 - Start Frontend Client
```bash
cd client
pnpm dev
```
Client will run on http://localhost:3000

## 🔧 Available Scripts

### Client Scripts
```bash
cd client
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Server Scripts
```bash
cd server
pnpm dev          # Start development server with hot reload
pnpm build        # Build TypeScript to JavaScript
pnpm start        # Start production server
pnpm db:generate  # Generate database migrations
pnpm db:push      # Push schema changes to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Drizzle Studio
```

## 🏗️ Architecture

### Client Architecture
- **App Router**: Next.js 13+ App Router for file-based routing
- **Module-based Structure**: Features organized in modules (auth, posts, etc.)
- **Component Library**: Reusable UI components with Shadcn/ui
- **Type-safe API**: tRPC client for end-to-end type safety

### Server Architecture
- **Fastify Framework**: High-performance web framework
- **tRPC Router**: Type-safe API endpoints
- **Drizzle ORM**: Type-safe database operations
- **Modular Structure**: Organized by feature domains

### API Communication
- **tRPC**: End-to-end type safety between client and server
- **HTTP/JSON**: RESTful API patterns with tRPC
- **Real-time**: WebSocket support for live updates

## 🔒 Authentication

The application uses Better Auth for authentication with the following features:
- User registration and login
- JWT token-based authentication
- Role-based access control (admin/user)
- Secure password hashing with bcrypt

## 🗄️ Database

- **PostgreSQL**: Primary database
- **Drizzle ORM**: Type-safe database toolkit
- **Neon**: Recommended PostgreSQL hosting
- **Migrations**: Automated schema management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests and linting
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Refer to the individual README files in `client/` and `server/` directories

## 🔗 Links

- [Client Documentation](./client/README.md)
- [Server API Documentation](./server/)
- [Database Schema](./server/src/db/schema.ts)