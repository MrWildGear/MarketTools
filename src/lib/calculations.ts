import { CalculatedData, Profile } from './types';

export function buyBrokerFee(profile: Profile): number {
  if (profile.useBuyCustomBroker) {
    return profile.buyCustomBroker;
  }
  return npcBroker(profile);
}

export function sellBrokerFee(profile: Profile): number {
  if (profile.useSellCustomBroker) {
    return profile.sellCustomBroker;
  }
  return npcBroker(profile);
}

export function npcBroker(profile: Profile): number {
  return (
    (3 -
      (profile.brokerRelations * 0.3 +
        profile.factionStanding * 0.03 +
        profile.corpStanding * 0.02)) /
    100
  );
}

export function salesTax(accounting: number): number {
  return 0.075 * (1 - accounting * 0.11);
}

export function calculateProfit(
  sellPrice: number,
  buyPrice: number,
  profile: Profile
): CalculatedData {
  if (sellPrice < 0 || buyPrice < 0) {
    return {
      revenue: 0,
      costOfSales: 0,
      profit: 0,
      margin: 0,
      markup: 0,
      buyOrderCost: 0,
      sellOrderCost: 0,
    };
  }

  const buyBrokerFeeRate = buyBrokerFee(profile);
  const sellBrokerFeeRate = sellBrokerFee(profile);
  const salesTaxRate = salesTax(profile.accounting);

  const adjustedSellPrice = sellPrice - 0.01;
  const adjustedBuyPrice = buyPrice + 0.01;

  const revenue =
    adjustedSellPrice -
    adjustedSellPrice * sellBrokerFeeRate -
    adjustedSellPrice * salesTaxRate;

  const costOfSales = adjustedBuyPrice + adjustedBuyPrice * buyBrokerFeeRate;

  const profit = revenue - costOfSales;

  const buyOrderCost = buyPrice * buyBrokerFeeRate;
  const sellOrderCost = sellPrice * sellBrokerFeeRate + sellPrice * salesTaxRate;

  const margin = revenue !== 0 ? (100 * (revenue - costOfSales)) / revenue : 0;
  const markup = costOfSales !== 0 ? (100 * (revenue - costOfSales)) / costOfSales : 0;

  return {
    revenue,
    costOfSales,
    profit,
    margin,
    markup,
    buyOrderCost,
    sellOrderCost,
  };
}

export function formatISK(amount: number): string {
  if (amount < 0) {
    return '- ISK';
  }
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ISK`;
}

export function formatPercent(value: number): string {
  if (Math.abs(value) >= 10000) {
    return value > 0 ? '∞%' : '-∞%';
  }
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
