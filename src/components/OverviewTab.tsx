import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { MarketData, Profile } from '@/lib/types';
import { calculateProfit, formatISK, formatPercent } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

interface OverviewTabProps {
  marketData: MarketData | null;
  profile: Profile;
}

export function OverviewTab({ marketData, profile }: OverviewTabProps) {
  const [copied, setCopied] = useState(false);
  const [autoCopyEnabled, setAutoCopyEnabled] = useState(false);
  const [autoCopyMode, setAutoCopyMode] = useState<'sell' | 'buy' | 'sell95' | 'buy95'>('sell');

  const calculated = useMemo(() => {
    if (!marketData) {
      return null;
    }
    return calculateProfit(marketData.sellPrice, marketData.buyPrice, profile);
  }, [marketData, profile]);

  const handleCopy = async (text: string) => {
    await writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const marginColorClass = useMemo(() => {
    if (!calculated) return '';
    const marginPercent = calculated.margin / 100;
    if (marginPercent >= profile.marginThreshold) {
      return 'border-green-500 text-green-600 dark:text-green-400';
    }
    if (marginPercent > profile.minimumThreshold) {
      return 'border-orange-500 text-orange-600 dark:text-orange-400';
    }
    return 'border-red-500 text-red-600 dark:text-red-400';
  }, [calculated, profile]);

  // Auto-copy logic
  useEffect(() => {
    if (autoCopyEnabled && calculated && marketData) {
      let priceToCopy: string;
      switch (autoCopyMode) {
        case 'sell':
          priceToCopy = (marketData.sellPrice - 0.01).toFixed(2);
          break;
        case 'buy':
          priceToCopy = (marketData.buyPrice + 0.01).toFixed(2);
          break;
        case 'sell95':
          priceToCopy = (marketData.sellPrice * 0.95).toFixed(2);
          break;
        case 'buy95':
          priceToCopy = (marketData.buyPrice * 0.95).toFixed(2);
          break;
        default:
          priceToCopy = (marketData.sellPrice - 0.01).toFixed(2);
      }
      handleCopy(priceToCopy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculated, autoCopyEnabled, autoCopyMode, marketData]);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Item Name */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {marketData?.itemName || 'No item selected'}
        </h2>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sell</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="cursor-pointer text-lg font-bold hover:opacity-80"
              onClick={() => {
                if (marketData) {
                  handleCopy((marketData.sellPrice - 0.01).toFixed(2));
                }
              }}
            >
              {marketData && marketData.sellPrice >= 0
                ? formatISK(marketData.sellPrice)
                : 'No orders in range'}
            </div>
            {marketData && marketData.sellPrice >= 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                {marketData.sellOrderCount} order{marketData.sellOrderCount !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buy</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="cursor-pointer text-lg font-bold hover:opacity-80"
              onClick={() => {
                if (marketData) {
                  handleCopy((marketData.buyPrice + 0.01).toFixed(2));
                }
              }}
            >
              {marketData && marketData.buyPrice >= 0
                ? formatISK(marketData.buyPrice)
                : 'No orders in range'}
            </div>
            {marketData && marketData.buyPrice >= 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                {marketData.buyOrderCount} order{marketData.buyOrderCount !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Calculations */}
      {calculated && calculated.revenue > 0 && (
        <>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Revenue</Label>
                <span className="text-sm">
                  {formatISK(calculated.revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <Label>Cost of Sales</Label>
                <span className="text-sm">
                  {formatISK(calculated.costOfSales)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <Label>Profit</Label>
                <span className="text-sm">{formatISK(calculated.profit)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Buy Order Cost</Label>
                <span className="text-sm">
                  {formatISK(calculated.buyOrderCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <Label>Sell Order Cost</Label>
                <span className="text-sm">
                  {formatISK(calculated.sellOrderCost)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Profit Margin and Markup */}
          <div className="grid grid-cols-2 gap-4">
            <Card className={cn('border-2', marginColorClass)}>
              <CardHeader>
                <CardTitle>Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(calculated.margin)}
                </div>
                <p className="text-xs text-muted-foreground">
                  (Profit / Revenue)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Markup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(calculated.markup)}
                </div>
                <p className="text-xs text-muted-foreground">
                  (Profit / Cost of Sales)
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Auto Copy Settings */}
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Auto Copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-copy">Enable auto copy</Label>
            <Switch
              id="auto-copy"
              checked={autoCopyEnabled}
              onCheckedChange={setAutoCopyEnabled}
            />
          </div>

          {autoCopyEnabled && (
            <RadioGroup
              value={autoCopyMode}
              onValueChange={(value) => setAutoCopyMode(value as 'sell' | 'buy' | 'sell95' | 'buy95')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell" id="sell" />
                <Label htmlFor="sell" className="cursor-pointer">
                  Sell price
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy" id="buy" />
                <Label htmlFor="buy" className="cursor-pointer">
                  Buy price
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell95" id="sell95" />
                <Label htmlFor="sell95" className="cursor-pointer">
                  Sell price at 95%
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy95" id="buy95" />
                <Label htmlFor="buy95" className="cursor-pointer">
                  Buy price at 95%
                </Label>
              </div>
            </RadioGroup>
          )}

          {copied && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              Copied to clipboard
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
