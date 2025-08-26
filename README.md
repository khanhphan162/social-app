# Social Media Application

A modern full-stack social media application built with Next.js, Fastify, tRPC, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Secure authentication with Better Auth
- **Post Management**: Create, edit, delete, and view posts
- **Comment System**: Interactive commenting with real-time updates
- **Search Functionality**: Search posts by content and username
- **Admin Features**: Content moderation and user management
- **Profile Management**: User profile customization
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live updates using tRPC subscriptions

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons
- **TanStack Query** - Data fetching and caching
- **tRPC** - End-to-end typesafe APIs

### Backend
- **Fastify** - Fast and efficient web framework
- **tRPC** - Type-safe API layer
- **Better Auth** - Authentication system
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Database (via Neon)
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Drizzle Kit** - Database migrations
- **TSX** - TypeScript execution

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

## 🚀 Getting Started

### 1. Clone the repository

```bash
gh repo clone khanhphan162/social-app
cd social-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the environment template:

```bash
cp .env.sample .env.local
```

Fill in your environment variables in `.env.local` (see Environment Variables section below).

### 4. Database Setup

Generate and push database schema:

```bash
pnpm db:generate
pnpm db:push
```

### 5. Development

Start the development servers:

```bash
# Terminal 1 - Backend server
pnpm dev:server

# Terminal 2 - Frontend server
pnpm dev:client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Server Configuration
PORT=4000
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:4000"

```

## 📜 Available Scripts

### Development
- `pnpm dev:server` - Start backend development server
- `pnpm dev:client` - Start frontend development server

### Building
- `pnpm build:server` - Build backend for production
- `pnpm build:front` - Build frontend for production

### Production
- `pnpm start:server` - Start production backend server
- `pnpm start:client` - Start production frontend server

### Database
- `pnpm db:generate` - Generate database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

### Code Quality
- `pnpm lint` - Run ESLint

## 🏗️ Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (home)/            # Main application pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── db/                   # Database configuration
│   ├── index.ts          # Database connection
│   └── schema.ts         # Database schema
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   └── home/            # Home/feed module
├── providers/           # React context providers
├── server/              # Backend server code
│   ├── api/            # API handlers
│   ├── handlers/       # Route handlers
│   ├── lib/           # Server utilities
│   ├── router/        # tRPC routers
│   └── index.ts       # Server entry point
└── trpc/               # tRPC client configuration
```

## 🔐 Authentication

- Username-based authentication
- Session management
- Role-based access control (user/admin)
- Secure password hashing

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: User accounts and profiles
- **Posts**: User posts/content
- **Comments**: Post comments
- **Sessions**: Authentication sessions

## 🚀 Deployment

### Backend Deployment
1. Build the server: `pnpm build:server`
2. Set production environment variables
3. Run migrations: `pnpm db:migrate`
4. Start the server: `pnpm start:server`

### Frontend Deployment
1. Build the frontend: `pnpm build:front`
2. Deploy to your preferred platform (Vercel, Netlify, etc.)
3. Update environment variables for production URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify your `DATABASE_URL` is correct
   - Ensure your database is running and accessible
   - Check firewall settings

2. **CORS Errors**
   - Verify `FRONTEND_URL` and `BACKEND_URL` are correctly set
   - Ensure both servers are running on the specified ports

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
   - Check TypeScript errors: `pnpm tsc --noEmit`

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.
