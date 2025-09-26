# Backbencher_Learns - AI-Powered Learning Platform

## Overview

Backbencher_Learns is a comprehensive educational platform that combines AI-powered personalized learning with social features. The application provides adaptive learning experiences using Google's Gemini AI, gamified progress tracking, and collaborative study environments. Users can create learning topics, take AI-generated quizzes, practice with flashcards, join study groups, participate in community discussions, and prepare for interviews.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built as a Single Page Application (SPA) using React with TypeScript, featuring:
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Theme System**: Custom theme provider supporting light/dark modes with CSS variables
- **Authentication**: Session-based authentication integrated with Replit's OAuth system

### Backend Architecture
The server follows a RESTful Express.js architecture with:
- **API Layer**: Express.js with structured route handlers for topics, quizzes, study groups, community posts, and interview preparation
- **Authentication Middleware**: Passport.js with OpenID Connect for Replit OAuth integration
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **File Upload**: Multer middleware for handling document uploads with memory storage
- **WebSocket Support**: WebSocketServer for real-time features (study groups, community interactions)

### Database Design
PostgreSQL database with Drizzle ORM providing type-safe database operations:
- **User Management**: Users table with XP, levels, streaks, and profile information
- **Learning Content**: Topics, quizzes, quiz attempts, flashcards, and learning sessions
- **Social Features**: Study groups, posts, comments, likes, and achievements
- **Session Storage**: Dedicated sessions table for authentication state

### AI Integration
Google Gemini AI integration for educational content generation:
- **Adaptive Explanations**: Generates content based on difficulty level (beginner, intermediate, advanced)
- **Quiz Generation**: Creates contextual questions with multiple choice answers and explanations
- **Flashcard Creation**: Generates question-answer pairs for spaced repetition learning
- **Interview Preparation**: Produces role-specific interview questions and tips
- **Performance Analysis**: Analyzes quiz results to identify learning gaps

### Development Architecture
Full-stack monorepo structure with:
- **Build System**: Vite for client bundling with HMR, esbuild for server compilation
- **Type Safety**: Shared TypeScript schemas between client and server using Zod validation
- **Development Tools**: Replit-specific plugins for cartographer and dev banner
- **Database Management**: Drizzle Kit for schema migrations and database operations

### Security & Performance
- **Authentication**: Secure session-based auth with httpOnly cookies and CSRF protection
- **Database**: Connection pooling with Neon serverless PostgreSQL
- **File Handling**: Memory-based file uploads with size limits (10MB)
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Caching**: Query-based caching strategy with TanStack Query for optimal performance

## External Dependencies

### Core AI Services
- **Google Gemini AI**: Primary AI service for content generation, explanations, quiz creation, and educational analysis
- **Gemini API Key**: Required environment variable for AI functionality

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter

### Authentication
- **Replit OAuth**: OpenID Connect integration for user authentication
- **Passport.js**: Authentication middleware with session management
- **Connect PG Simple**: PostgreSQL session store for persistent authentication

### UI & Styling
- **Radix UI**: Headless component primitives for accessibility and interaction
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development & Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for server compilation
- **TypeScript**: Type system for both client and server code
- **Zod**: Schema validation for shared data types

### File Handling & Real-time
- **Multer**: File upload middleware for document processing
- **WebSocket**: Real-time communication for collaborative features
- **Date-fns**: Date manipulation and formatting utilities