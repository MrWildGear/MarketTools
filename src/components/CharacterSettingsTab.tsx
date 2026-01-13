import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Profile } from '@/lib/types';

interface CharacterSettingsTabProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export function CharacterSettingsTab({
  profile,
  onProfileUpdate,
}: CharacterSettingsTabProps) {
  const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    onProfileUpdate({ ...profile, [key]: value });
  };

  const resetToDefaults = () => {
    onProfileUpdate({
      ...profile,
      accounting: 5,
      brokerRelations: 5,
      factionStanding: 0.0,
      corpStanding: 0.0,
    });
  };

  const brokerFee = (
    3 -
    (profile.brokerRelations * 0.3 +
      profile.factionStanding * 0.03 +
      profile.corpStanding * 0.02)
  ).toFixed(2);

  const salesTax = (0.075 * (1 - profile.accounting * 0.11)).toFixed(2);

  return (
    <div className="flex flex-col gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Fees and Taxes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="broker-relations">Broker Relations</Label>
              <Select
                value={profile.brokerRelations.toString()}
                onValueChange={(value) =>
                  updateField('brokerRelations', parseInt(value, 10))
                }
              >
                <SelectTrigger id="broker-relations">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Broker Fee: {brokerFee}%
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accounting">Accounting</Label>
              <Select
                value={profile.accounting.toString()}
                onValueChange={(value) =>
                  updateField('accounting', parseInt(value, 10))
                }
              >
                <SelectTrigger id="accounting">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sales Tax: {salesTax}%
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="corp-standing">Corporation Standing</Label>
              <Input
                id="corp-standing"
                type="number"
                min="-10"
                max="10"
                step="0.1"
                value={profile.corpStanding}
                onChange={(e) =>
                  updateField('corpStanding', parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faction-standing">Faction Standing</Label>
              <Input
                id="faction-standing"
                type="number"
                min="-10"
                max="10"
                step="0.1"
                value={profile.factionStanding}
                onChange={(e) =>
                  updateField('factionStanding', parseFloat(e.target.value) || 0)
                }
              />
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
