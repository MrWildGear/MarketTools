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

/**
 * Rounds a price to 4 significant figures according to EVE Online's tick size rules.
 * This prevents arbitrary undercutting and ensures prices conform to the game's market order precision limits.
 * 
 * @param price - The price to round
 * @returns A string representation of the price rounded to 4 significant figures
 * 
 * @example
 * roundTo4SigFigs(1234567.89) // "1235000"
 * roundTo4SigFigs(123.456) // "123.5"
 * roundTo4SigFigs(0.123456) // "0.1235"
 */
export function roundTo4SigFigs(price: number): string {
  if (price === 0) {
    return '0';
  }

  // Handle negative numbers
  const isNegative = price < 0;
  const absPrice = Math.abs(price);

  // Calculate the order of magnitude
  const magnitude = Math.floor(Math.log10(absPrice));
  
  // Calculate the factor to round to 4 significant figures
  // For magnitude 6, we want to round to nearest 1000 (10^3), so factor = 10^(magnitude - 3)
  const factor = Math.pow(10, magnitude - 3);
  
  // Round to 4 significant figures
  const rounded = Math.round(absPrice / factor) * factor;

  // Format the number: use scientific notation to determine decimal places needed
  // Then convert back to standard notation
  const sign = isNegative ? '-' : '';
  
  // Calculate how many decimal places are needed to show 4 significant figures
  // If magnitude >= 3, no decimals needed (e.g., 1235000)
  // If magnitude >= 0, need (4 - magnitude - 1) decimal places (e.g., 123.5 needs 1)
  // If magnitude < 0, need (4 - magnitude - 1) decimal places (e.g., 0.1235 needs 4)
  let decimalPlaces: number;
  if (magnitude >= 3) {
    decimalPlaces = 0;
  } else {
    decimalPlaces = Math.max(0, 4 - magnitude - 1);
  }
  
  // Format with appropriate decimal places
  const formatted = rounded.toFixed(decimalPlaces);
  
  // Remove trailing zeros after decimal point, but keep the decimal point if there are significant digits
  return sign + formatted.replace(/\.?0+$/, '');
}