export enum OrderRange {
  HUB = 0,
  SYSTEM = 1,
  ONEJUMP = 2,
  TWOJUMP = 3,
  REGION = 4,
}

export interface Profile {
  charId: number;
  profileName: string;
  marginThreshold: number;
  minimumThreshold: number;
  accounting: number;
  brokerRelations: number;
  factionStanding: number;
  corpStanding: number;
  useBuyCustomBroker: boolean;
  buyCustomBroker: number;
  useSellCustomBroker: boolean;
  sellCustomBroker: number;
  buyRange: OrderRange;
  sellRange: OrderRange;
}

export interface MarketData {
  itemName: string;
  typeId: number;
  sellPrice: number;
  buyPrice: number;
  sellOrderCount: number;
  buyOrderCount: number;
  sellPrice95Ci: number;
  buyPrice95Ci: number;
}

export interface CalculatedData {
  revenue: number;
  costOfSales: number;
  profit: number;
  margin: number;
  markup: number;
  buyOrderCost: number;
  sellOrderCost: number;
}
