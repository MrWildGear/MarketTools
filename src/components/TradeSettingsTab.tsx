import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Profile } from '@/lib/types';

interface TradeSettingsTabProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export function TradeSettingsTab({
  profile,
  onProfileUpdate,
}: TradeSettingsTabProps) {
  const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    onProfileUpdate({ ...profile, [key]: value });
  };

  const resetToDefaults = () => {
    onProfileUpdate({
      ...profile,
      marginThreshold: 0.1,
      minimumThreshold: 0.02,
      useBuyCustomBroker: false,
      buyCustomBroker: 0.01,
      useSellCustomBroker: false,
      sellCustomBroker: 0.01,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Broker Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="use-buy-custom">Use custom broker fee for buys</Label>
              <Switch
                id="use-buy-custom"
                checked={profile.useBuyCustomBroker}
                onCheckedChange={(checked) =>
                  updateField('useBuyCustomBroker', checked)
                }
              />
            </div>
            {profile.useBuyCustomBroker && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={profile.buyCustomBroker * 100}
                  onChange={(e) =>
                    updateField(
                      'buyCustomBroker',
                      parseFloat(e.target.value) / 100 || 0
                    )
                  }
                  className="w-20"
                />
                <Label>%</Label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="use-sell-custom">Use custom broker fee for sells</Label>
              <Switch
                id="use-sell-custom"
                checked={profile.useSellCustomBroker}
                onCheckedChange={(checked) =>
                  updateField('useSellCustomBroker', checked)
                }
              />
            </div>
            {profile.useSellCustomBroker && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={profile.sellCustomBroker * 100}
                  onChange={(e) =>
                    updateField(
                      'sellCustomBroker',
                      parseFloat(e.target.value) / 100 || 0
                    )
                  }
                  className="w-20"
                />
                <Label>%</Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Margins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferred-margin">Preferred Margin</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="preferred-margin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={profile.marginThreshold * 100}
                  onChange={(e) =>
                    updateField(
                      'marginThreshold',
                      parseFloat(e.target.value) / 100 || 0
                    )
                  }
                  className="w-20"
                />
                <Label>%</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum-margin">Minimum Margin</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="minimum-margin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={profile.minimumThreshold * 100}
                  onChange={(e) =>
                    updateField(
                      'minimumThreshold',
                      parseFloat(e.target.value) / 100 || 0
                    )
                  }
                  className="w-20"
                />
                <Label>%</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={resetToDefaults} variant="outline">
          Default settings
        </Button>
      </div>
    </div>
  );
}
