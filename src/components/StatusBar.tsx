import { Button } from './ui/button';
import { Pin, HelpCircle, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

interface StatusBarProps {
  status: string;
}

export function StatusBar({ status }: StatusBarProps) {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const initializePinState = async () => {
      try {
        const window = getCurrentWindow();
        const currentState = await window.isAlwaysOnTop();
        setIsPinned(currentState);
      } catch (error) {
        console.error('Failed to get always-on-top state:', error);
      }
    };
    initializePinState();
  }, []);

  const handlePin = async () => {
    try {
      const window = getCurrentWindow();
      const newState = !isPinned;
      await window.setAlwaysOnTop(newState);
      setIsPinned(newState);
    } catch (error) {
      console.error('Failed to set always-on-top:', error);
    }
  };

  const handleChangeLogPath = async () => {
    await invoke('select_log_path');
  };

  return (
    <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-sm">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePin}
          title="Make window stay on top"
        >
          <Pin className={isPinned ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleChangeLogPath}
          title="Change market log path"
        >
          <Folder className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" title="This project was inspred by Elinor-Reloaded">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-muted-foreground">{status || 'Ready'}</div>
    </div>
  );
}
