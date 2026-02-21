# Luminary Pro - Life Operating System

A production-grade, private beta wellness operating system built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Daily Check-ins**: Track your energy, clarity, and body metrics
- **Hybrid Day Planning**: Structure your day with time blocks and habits
- **Finance Management**: Track income, expenses, and savings goals
- **AI Coach**: Personal AI wellness guide with memory and context
- **Herb Library**: Discover natural remedies and wellness herbs
- **Location Discovery**: Find wellness venues near you
- **Community**: Connect with fellow warriors
- **Motivation**: Daily quotes and inspiration
- **Shop**: Premium wellness products

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Custom Properties
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **AI**: OpenAI GPT-4 Turbo
- **PWA**: Service Worker, Manifest, Offline Support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (for AI Coach)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd luminary-pro
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the schema from `supabase/schema/000_initial_schema.sql`
   - Deploy the edge function from `supabase/functions/ai-coach/`

5. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
luminary-pro/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # UI components (Button, Card, Input, etc.)
│   │   └── layout/        # Layout components (Sidebar, Navigation)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and configurations
│   ├── pages/             # Page components
│   ├── stores/            # Zustand state stores
│   ├── styles/            # Global styles and design system
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global CSS
├── supabase/
│   ├── schema/            # Database schema
│   └── functions/         # Edge functions
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- `profiles`: User profiles and preferences
- `daily_checkins`: Daily wellness check-ins
- `hybrid_day_plans`: Daily planning data
- `day_blocks`: Time blocks within day plans
- `habits`: User habits and tracking
- `income_entries`, `spending_entries`, `savings_goals`: Finance tracking
- `herbs`, `saved_herbs`: Herb library
- `places`, `saved_places`: Location discovery
- `community_posts`, `post_comments`, `post_reactions`: Community features
- `coach_conversations`, `coach_messages`: AI Coach conversations
- `products`, `orders`: Shop functionality

## License

Private Beta - All rights reserved.

## Support

For support, email support@luminary.app or join our Discord community.
