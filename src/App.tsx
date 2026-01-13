import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import type { Profile, MarketData } from './lib/types';
import { MainWindow } from './components/MainWindow';
import { getDefaultProfile } from './lib/constants';

function App() {
  const [profile, setProfile] = useState<Profile>(getDefaultProfile());
  const [profiles, setProfiles] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Load profiles list
    invoke<string[]>('list_profiles').then(setProfiles).catch(console.error);

    // Load default profile
    invoke<Profile | null>('load_profile', { profileName: 'Default' })
      .then((loaded) => {
        if (loaded) {
          setProfile(loaded);
        }
      })
      .catch(console.error);

    // Listen for market data updates
    const unlisten = listen<MarketData>('market-data', (event) => {
      setMarketData(event.payload);
    });

    // Listen for status updates
    const unlistenStatus = listen<string>('status-update', (event) => {
      setStatus(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
      unlistenStatus.then((fn) => fn());
    };
  }, []);

  const handleProfileChange = async (profileName: string) => {
    const loaded = await invoke<Profile | null>('load_profile', { profileName });
    if (loaded) {
      setProfile(loaded);
    }
  };

  const handleSaveProfile = async () => {
    await invoke('save_profile', { profile });
    const updatedProfiles = await invoke<string[]>('list_profiles');
    setProfiles(updatedProfiles);
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <MainWindow
        profile={profile}
        profiles={profiles}
        marketData={marketData}
        status={status}
        onProfileChange={handleProfileChange}
        onProfileUpdate={setProfile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}

export default App;
