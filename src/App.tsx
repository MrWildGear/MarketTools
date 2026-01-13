import { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import type { Profile, MarketData } from './lib/types';
import { MainWindow } from './components/MainWindow';
import { getDefaultProfile } from './lib/constants';

interface AppSettings {
  selectedProfile: string;
  autoCopyEnabled: boolean;
  autoCopyMode: 'sell' | 'buy' | 'sell95' | 'buy95';
}

function App() {
  const [profile, setProfile] = useState<Profile>(getDefaultProfile());
  const [profiles, setProfiles] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [status, setStatus] = useState<string>('');
  const [autoCopyEnabled, setAutoCopyEnabled] = useState(false);
  const [autoCopyMode, setAutoCopyMode] = useState<'sell' | 'buy' | 'sell95' | 'buy95'>('sell');
  const hasLoadedSettings = useRef(false);

  useEffect(() => {
    // Load settings first
    invoke<AppSettings>('load_settings')
      .then((settings) => {
        setAutoCopyEnabled(settings.autoCopyEnabled);
        setAutoCopyMode(settings.autoCopyMode);
        hasLoadedSettings.current = true;
        // Load the selected profile
        return invoke<Profile | null>('load_profile', { profileName: settings.selectedProfile });
      })
      .then((loaded) => {
        if (loaded) {
          setProfile(loaded);
        }
      })
      .catch(console.error);

    // Load profiles list
    invoke<string[]>('list_profiles').then(setProfiles).catch(console.error);

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

  // Save settings whenever profile, autoCopyEnabled, or autoCopyMode changes
  useEffect(() => {
    // Skip saving on initial load
    if (!hasLoadedSettings.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      invoke('save_settings', {
        settings: {
          selectedProfile: profile.profileName,
          autoCopyEnabled,
          autoCopyMode,
        },
      }).catch(console.error);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [profile.profileName, autoCopyEnabled, autoCopyMode]);

  const handleAutoCopyChange = (enabled: boolean, mode?: 'sell' | 'buy' | 'sell95' | 'buy95') => {
    setAutoCopyEnabled(enabled);
    if (mode !== undefined) {
      setAutoCopyMode(mode);
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
        autoCopyEnabled={autoCopyEnabled}
        autoCopyMode={autoCopyMode}
        onAutoCopyChange={handleAutoCopyChange}
      />
    </div>
  );
}

export default App;
