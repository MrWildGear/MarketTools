import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getDefaultProfile } from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import type { Profile } from '@/lib/types';

interface ProfileSelectorProps {
  profiles: string[];
  currentProfile: string;
  profile: Profile;
  onProfileChange: (profileName: string) => void;
  onProfileUpdate: (profile: Profile) => void;
}

export function ProfileSelector({
  profiles,
  currentProfile,
  profile,
  onProfileChange,
  onProfileUpdate,
}: ProfileSelectorProps) {
  const [newProfileName, setNewProfileName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;

    const newProfile: Profile = {
      ...getDefaultProfile(),
      profileName: newProfileName.trim(),
    };
    await invoke('save_profile', { profile: newProfile });
    onProfileUpdate(newProfile);
    setNewProfileName('');
    setIsDialogOpen(false);
  };

  const handleDeleteProfile = async () => {
    if (profile.profileName === 'Default') return; // Can't delete default
    try {
      await invoke('delete_profile', { profileName: profile.profileName });
      onProfileChange('Default');
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Label>Profile:</Label>
      <Select value={currentProfile} onValueChange={onProfileChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button 
          size="sm" 
          variant="outline"
          type="button"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateProfile();
                  }
                }}
                placeholder="Enter profile name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDialogOpen(false);
              }} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateProfile();
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {profile.profileName !== 'Default' && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDeleteProfile}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      )}
    </div>
  );
}
