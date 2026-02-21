import React, { useState } from 'react';
import { Camera, Edit2, Settings, Bell, Moon, Shield, LogOut } from 'lucide-react';
import { Card, CardHeader, Button, Input, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

export const Profile: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { updateProfile, updateAvatar, updateSettings } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    wake_time: user?.wake_time || '06:00',
    work_start: user?.work_start || '09:00',
    work_end: user?.work_end || '17:00',
  });

  const handleSave = async () => {
    await updateProfile({
      full_name: editData.full_name,
      bio: editData.bio,
      wake_time: editData.wake_time,
      work_start: editData.work_start,
      work_end: editData.work_end,
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await updateAvatar(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
          <p className="text-zinc-400 mt-1">Manage your account and preferences</p>
        </div>
        <Button variant="secondary" onClick={() => signOut()}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-medium text-zinc-400">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full cursor-pointer hover:bg-amber-400 transition-colors">
              <Camera className="w-4 h-4 text-zinc-950" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-zinc-100">{user?.full_name}</h2>
            <p className="text-zinc-500">{user?.email}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
              <Badge variant="primary">
                {user?.streak || 0} day streak
              </Badge>
              {user?.personas?.map((persona, idx) => (
                <Badge key={idx} variant="outline">
                  {persona}
                </Badge>
              ))}
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="secondary"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4">
            <Input
              label="Full Name"
              value={editData.full_name}
              onChange={(e) => setEditData((prev) => ({ ...prev, full_name: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Bio
              </label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="time"
                label="Wake Time"
                value={editData.wake_time}
                onChange={(e) => setEditData((prev) => ({ ...prev, wake_time: e.target.value }))}
              />
              <Input
                type="time"
                label="Work Start"
                value={editData.work_start}
                onChange={(e) => setEditData((prev) => ({ ...prev, work_start: e.target.value }))}
              />
              <Input
                type="time"
                label="Work End"
                value={editData.work_end}
                onChange={(e) => setEditData((prev) => ({ ...prev, work_end: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Check-ins" value={user?.total_checkins || 0} />
        <StatCard label="Habits" value={user?.total_habits || 0} />
        <StatCard label="Saved" value={user?.total_saved_herbs || 0} />
      </div>

      {/* Settings */}
      <Card>
        <CardHeader title="Settings" />
        <div className="space-y-2">
          <SettingItem
            icon={Bell}
            label="Notifications"
            description="Get reminded about your habits and goals"
            toggle
          />
          <SettingItem
            icon={Moon}
            label="Dark Mode"
            description="Always use dark theme"
            toggle
            defaultOn
          />
          <SettingItem
            icon={Shield}
            label="Privacy"
            description="Manage your data and privacy settings"
          />
        </div>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader title="Your Goals" />
        <div className="flex flex-wrap gap-2">
          {user?.goals?.map((goal, idx) => (
            <Badge key={idx} variant="primary">
              {goal}
            </Badge>
          )) || <p className="text-zinc-500">No goals set yet</p>}
        </div>
      </Card>

      {/* Why */}
      {user?.why && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
          <CardHeader title="Your Why" />
          <p className="text-zinc-300 italic">"{user.why}"</p>
        </Card>
      )}
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <Card className="p-4 text-center">
    <p className="text-2xl font-bold text-zinc-100">{value}</p>
    <p className="text-sm text-zinc-500">{label}</p>
  </Card>
);

// Setting Item Component
interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  description: string;
  toggle?: boolean;
  defaultOn?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  label,
  description,
  toggle,
  defaultOn = false,
}) => {
  const [isOn, setIsOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
          <Icon className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <p className="font-medium text-zinc-200">{label}</p>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      {toggle && (
        <button
          onClick={() => setIsOn(!isOn)}
          className={cn(
            'w-12 h-6 rounded-full transition-colors relative',
            isOn ? 'bg-amber-500' : 'bg-zinc-700'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              isOn ? 'left-7' : 'left-1'
            )}
          />
        </button>
      )}
    </div>
  );
};
