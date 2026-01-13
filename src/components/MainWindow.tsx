import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { OverviewTab } from './OverviewTab';
import { CharacterSettingsTab } from './CharacterSettingsTab';
import { TradeSettingsTab } from './TradeSettingsTab';
import { RangeSettingsTab } from './RangeSettingsTab';
import { ProfileSelector } from './ProfileSelector';
import { StatusBar } from './StatusBar';
import { Profile, MarketData } from '@/lib/types';
import { Button } from './ui/button';
import { Save } from 'lucide-react';

interface MainWindowProps {
  profile: Profile;
  profiles: string[];
  marketData: MarketData | null;
  status: string;
  onProfileChange: (profileName: string) => void;
  onProfileUpdate: (profile: Profile) => void;
  onSaveProfile: () => void;
}

export function MainWindow({
  profile,
  profiles,
  marketData,
  status,
  onProfileChange,
  onProfileUpdate,
  onSaveProfile,
}: MainWindowProps) {
  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <div className="flex h-screen flex-col">
      {/* Header with Profile Selector */}
      <div className="flex items-center gap-2 border-b p-4">
        <ProfileSelector
          profiles={profiles}
          currentProfile={profile.profileName}
          onProfileChange={onProfileChange}
          onProfileUpdate={onProfileUpdate}
          profile={profile}
        />
        <Button onClick={onSaveProfile} size="sm" variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="character">Character Settings</TabsTrigger>
              <TabsTrigger value="trade">Trade Settings</TabsTrigger>
              <TabsTrigger value="range">Range Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="m-0 h-[calc(100vh-200px)]">
            <OverviewTab marketData={marketData} profile={profile} />
          </TabsContent>

          <TabsContent value="character" className="m-0 h-[calc(100vh-200px)]">
            <CharacterSettingsTab
              profile={profile}
              onProfileUpdate={onProfileUpdate}
            />
          </TabsContent>

          <TabsContent value="trade" className="m-0 h-[calc(100vh-200px)]">
            <TradeSettingsTab
              profile={profile}
              onProfileUpdate={onProfileUpdate}
            />
          </TabsContent>

          <TabsContent value="range" className="m-0 h-[calc(100vh-200px)]">
            <RangeSettingsTab
              profile={profile}
              onProfileUpdate={onProfileUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Bar */}
      <StatusBar status={status} />
    </div>
  );
}
