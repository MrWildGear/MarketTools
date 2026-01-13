import { OrderRange } from './types';

export const HUB_IDS = [60003760, 60004588, 60008494, 60011866, 60005686]; // Jita, Rens, Amarr, Dodixie, Hek

export const ORDER_RANGE_OPTIONS = [
  { value: OrderRange.HUB, label: 'Hubs (Station)' },
  { value: OrderRange.SYSTEM, label: 'System' },
  { value: OrderRange.ONEJUMP, label: '1 jump' },
  { value: OrderRange.TWOJUMP, label: '2 jumps' },
  { value: OrderRange.REGION, label: 'Region' },
];

export function getDefaultProfile() {
  return {
    charId: 0,
    profileName: 'Default',
    marginThreshold: 0.1,
    minimumThreshold: 0.02,
    accounting: 5,
    brokerRelations: 5,
    factionStanding: 0.0,
    corpStanding: 0.0,
    useBuyCustomBroker: false,
    buyCustomBroker: 0.01,
    useSellCustomBroker: false,
    sellCustomBroker: 0.01,
    buyRange: OrderRange.HUB,
    sellRange: OrderRange.HUB,
  };
}
