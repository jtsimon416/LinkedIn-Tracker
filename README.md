# LinkedIn Token Tracker

A real-time application for managing shared LinkedIn accounts across a team of recruiters. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Overview

This application solves the problem of multiple recruiters sharing LinkedIn accounts by providing:

- **Real-time "punch clock" system** - Check in/out of LinkedIn accounts
- **Token tracking** - Monitor usage and prevent overages
- **Complete audit logging** - Track who used which account and when
- **Automated token replenishment** - Monthly token reset via cron job
- **Safety features** - Prevent simultaneous use and forced logout
- **Admin controls** - Manage accounts and force check-outs

## Features

### For Recruiters
- ✅ Real-time dashboard showing 3 LinkedIn accounts
- ✅ Check in to claim an account (reveals credentials)
- ✅ Check out when done (log tokens used)
- ✅ See who's currently using each account
- ✅ View remaining tokens for each account
- ✅ Logout prevention (can't sign out while holding an account)

### For Admins
- ✅ Edit account details and credentials
- ✅ Manually adjust token counts
- ✅ Set monthly replenishment amounts
- ✅ Force check-out if someone forgets
- ✅ View complete usage logs with filters
- ✅ Audit trail of all activities

### Technical Features
- ✅ Real-time synchronization across all users
- ✅ Dark theme with professional blue color palette
- ✅ Automated monthly token replenishment
- ✅ Row-level security (RLS) with Supabase
- ✅ Complete TypeScript type safety
- ✅ Responsive design (desktop & tablet)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (dark theme)
- **Backend**: Supabase
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security
  - pg_cron for automation
- **Routing**: React Router v6

## Project Structure

```
linkedin-token-tracker/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AccountEditor.tsx       # Admin account management
│   │   ├── auth/
│   │   │   ├── Login.tsx               # Login page
│   │   │   └── ProtectedRoute.tsx      # Route protection
│   │   ├── dashboard/
│   │   │   ├── AccountCard.tsx         # Account display card
│   │   │   └── CheckOutModal.tsx       # Check-out form modal
│   │   └── layout/
│   │       ├── Layout.tsx              # Main layout wrapper
│   │       └── Navbar.tsx              # Navigation with logout
│   ├── hooks/
│   │   ├── useAuth.ts                  # Authentication hook
│   │   └── useAccounts.ts              # Accounts data hook
│   ├── pages/
│   │   ├── Dashboard.tsx               # Main dashboard
│   │   ├── AdminPanel.tsx              # Admin management
│   │   └── UsageLogs.tsx               # Usage log viewer
│   ├── types/
│   │   └── index.ts                    # TypeScript types
│   ├── utils/
│   │   └── supabase.ts                 # Supabase client
│   ├── App.tsx                         # Main app with routing
│   ├── main.tsx                        # Entry point
│   └── index.css                       # Tailwind + custom styles
├── database-setup.sql                  # Complete DB setup script
├── SETUP.md                            # Detailed setup guide
└── README.md                           # This file
```

## Quick Start

### 1. Install Dependencies
```bash
cd linkedin-token-tracker
npm install
```

### 2. Set Up Database
Follow the detailed instructions in [SETUP.md](./SETUP.md) to:
- Run the database setup script
- Create admin users
- Configure LinkedIn account credentials

### 3. Run the Application
```bash
npm run dev
```

Visit `http://localhost:5173`

## Database Schema

### `linkedin_accounts` Table
- Stores the 3 LinkedIn accounts
- Tracks status (available/in-use)
- Stores credentials (username/password)
- Manages token counts and refresh dates

### `usage_log` Table
- Complete audit trail
- Records every check-in and check-out
- Tracks token usage per session
- Links to recruiter and account

## Color Palette

The application uses a professional dark theme with blue tones:

### Background Colors
- **Primary**: `#0a0e1a` - Main background
- **Secondary**: `#121829` - Section backgrounds
- **Tertiary**: `#1a2137` - Elevated sections
- **Card**: `#1e2742` - Card backgrounds
- **Border**: `#2a3655` - Borders and dividers

### Accent Colors
- **Royal Blue**: `#2a6aff` - Primary buttons and accents
- **Navy Blue**: `#003d80` - Secondary buttons
- **Sky Blue**: `#009fe6` - Links and info
- **Green**: `#059669` - Available status
- **Red**: `#dc2626` - In-use status

## Real-Time Features

The application uses Supabase Realtime to synchronize state across all users:

- When a recruiter checks in to an account, all other users see the change **instantly**
- When an account is checked out, it becomes available for everyone **immediately**
- Admin changes to token counts are reflected **in real-time**
- No page refresh required

## Security

- **Row Level Security (RLS)** - All database access is secured at the row level
- **Authentication Required** - All routes require valid Supabase authentication
- **Admin-Only Routes** - Admin panel requires `is_admin: true` in user metadata
- **Encrypted Credentials** - LinkedIn passwords stored securely in Supabase
- **Logout Prevention** - Users cannot log out while holding an account

## Automated Token Replenishment

The system automatically replenishes tokens monthly using pg_cron:

1. A cron job runs **daily at 2 AM UTC**
2. Checks if any account's `next_refresh_date` is today or earlier
3. Adds the `replenish_amount` to `remaining_tokens`
4. Sets `next_refresh_date` to one month in the future
5. Supports **token carry-over** (unused tokens accumulate)

## Build for Production

```bash
npm run build
```

Deploy the `dist` folder to:
- Vercel (recommended)
- Netlify
- Any static hosting service

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Author

Built with Claude Code - An AI-powered development assistant by Anthropic.
