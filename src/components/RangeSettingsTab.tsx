import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Profile, OrderRange } from '@/lib/types';
import { ORDER_RANGE_OPTIONS } from '@/lib/constants';

interface RangeSettingsTabProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export function RangeSettingsTab({
  profile,
  onProfileUpdate,
}: RangeSettingsTabProps) {
  const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    onProfileUpdate({ ...profile, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Processing Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buy-range">Buy Order Range</Label>
              <Select
                value={profile.buyRange.toString()}
                onValueChange={(value) =>
                  updateField('buyRange', parseInt(value, 10) as OrderRange)
                }
              >
                <SelectTrigger id="buy-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_RANGE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell-range">Sell Order Range</Label>
              <Select
                value={profile.sellRange.toString()}
                onValueChange={(value) =>
                  updateField('sellRange', parseInt(value, 10) as OrderRange)
                }
              >
                <SelectTrigger id="sell-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_RANGE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
