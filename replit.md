# Overview

This is a full-stack design-to-code platform that converts Figma designs into production-ready React components. The application provides comprehensive tools for importing Figma files, managing design tokens, building forms, testing APIs, and organizing project assets. It uses a modern tech stack with React frontend, Express backend, and PostgreSQL database to deliver a complete design system management solution.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built using **React with TypeScript** and follows a component-based architecture:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible interfaces
- **Styling**: Tailwind CSS with custom CSS variables for theming and design tokens
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Theme System**: Custom theme provider supporting light/dark modes

The frontend is organized into clear feature-based modules:
- `/pages` - Route components for each major feature (dashboard, figma-import, form-builder, etc.)
- `/components` - Reusable UI components organized by domain (dashboard, layout, ui)
- `/hooks` - Custom React hooks for authentication, mobile detection, and app state
- `/lib` - Utility functions, query client configuration, and WebSocket management

## Backend Architecture

The server uses **Express.js** with TypeScript in a RESTful API pattern:

- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL store for persistence
- **Real-time Features**: WebSocket server for live collaboration and updates
- **File Handling**: Multer middleware for file uploads with configurable limits
- **API Structure**: Route-based organization with consistent error handling

Key backend modules:
- `/server/routes.ts` - Main API endpoint definitions
- `/server/auth.ts` - Authentication middleware and strategies
- `/server/storage.ts` - Database abstraction layer
- `/server/db.ts` - Database connection and Drizzle ORM setup

## Data Storage Solutions

**PostgreSQL** with **Drizzle ORM** provides type-safe database operations:

- **Schema Management**: Centralized schema definitions in `/shared/schema.ts`
- **Migration System**: Drizzle Kit for database migrations and schema updates
- **Connection Pooling**: Neon serverless PostgreSQL with WebSocket support
- **Type Safety**: Full TypeScript integration from database to frontend

Core entities include:
- Users with role-based access control
- Projects with Figma integration metadata
- Components with generated code and properties
- Design tokens for consistent styling
- Forms with dynamic field configurations
- API endpoints for testing and documentation
- Activity logs and notifications for user engagement

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

### Frontend Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **React Query**: Server state management and caching solution
- **React Hook Form**: Performant forms with easy validation
- **React Beautiful DnD**: Drag and drop functionality for form builder
- **Date-fns**: Modern date utility library
- **Wouter**: Minimalist routing library for React

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle Kit**: Database toolkit for migrations and introspection
- **Zod**: Runtime type validation and schema validation

### File Upload & Storage
- **Multer**: Middleware for handling multipart/form-data for file uploads
- Local file system storage with configurable upload directory

### Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time features
- Custom WebSocket manager for client-side connection handling with reconnection logic

The architecture emphasizes type safety throughout the stack, from database schemas to API responses to frontend components, ensuring reliable data flow and reducing runtime errors.