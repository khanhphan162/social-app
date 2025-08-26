# Social Media Application

A modern full-stack social media application built with Next.js, tRPC, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Secure authentication
- **Post Management**: Create, edit, delete, and view posts
- **Comment System**: Interactive commenting with real-time updates
- **Search Functionality**: Search posts by content and username
- **Admin Features**: Content moderation and user management
- **Profile Management**: User profile customization
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live updates using tRPC subscriptions

## 🛠️ Tech Stack

### Frontend & Backend
- **Next.js 15** - Full-stack React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Data fetching and caching
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Database (via Neon)
- **Zod** - Schema validation

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - UI component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variants

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Drizzle Kit** - Database migrations
- **PostCSS** - CSS processing

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/khanhphan162/social-app/
cd social-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

```

### 4. Database Setup

Generate and push database schema:

```bash
pnpm db:generate
pnpm db:push
```

### 5. Development

Start the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:3000

## 📜 Available Scripts

### Development
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database
- `pnpm db:generate` - Generate database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (home)/            # Main application pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── trpc/          # tRPC API handler
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── modals/           # Modal components
│   └── ui/               # Shadcn/ui components
├── db/                   # Database configuration
│   ├── index.ts          # Database connection
│   └── schema.ts         # Database schema
├── hooks/                # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection hook
│   └── use-session.ts    # Session management hook
├── lib/                  # Utility libraries
│   ├── auth-client.ts    # Authentication client
│   └── utils.ts          # General utilities
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   │   └── ui/          # Auth-specific UI components
│   └── home/            # Home/feed module
│       ├── contexts/    # Home-specific contexts
│       └── ui/          # Home-specific UI components
├── providers/           # React context providers
│   └── session-provider.tsx # Session context provider
├── server/              # Server-side code
│   ├── api/            # API route handlers
│   ├── context.ts      # tRPC context creation
│   ├── init.ts         # tRPC initialization
│   ├── lib/           # Server utilities
│   │   └── auth.ts    # Server-side auth utilities
│   └── router/        # tRPC routers
│       ├── commentRouter.ts # Comment operations
│       ├── healthRouter.ts  # Health check
│       ├── index.ts         # Main router
│       ├── postRouter.ts    # Post operations
│       ├── sessionRouter.ts # Session management
│       └── userRouter.ts    # User operations
└── trpc/               # tRPC client configuration
├── client.tsx      # tRPC React client
└── query-client.ts # TanStack Query client
```

## 🔐 Authentication

- Username-based authentication
- Secure session management with HTTP-only cookies
- Role-based access control (user/admin)
- Secure password hashing with bcrypt
- Session refresh and logout functionality

## 🔧 Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify your `DATABASE_URL` is correct
   - Ensure your database is running and accessible
   - Check firewall settings for Neon or your PostgreSQL instance

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
   - Check TypeScript errors: `npx tsc --noEmit`
   - Ensure all environment variables are set

3. **tRPC Errors**
   - Check browser network tab for API errors
   - Verify tRPC context is properly configured
   - Ensure database schema is up to date

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.