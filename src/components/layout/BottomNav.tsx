import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/hybrid-day', label: 'Day', icon: Calendar },
  { path: '/coach', label: 'Coach', icon: MessageSquare },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-2 px-4 min-w-[64px]',
                'transition-all duration-200',
                isActive
                  ? 'text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'relative p-1.5 rounded-xl transition-all duration-200',
                    isActive && 'bg-amber-500/10'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </div>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
