import { ChecklistItem } from '../types';

const ITEMS: Omit<ChecklistItem, 'id' | 'checked'>[] = [
  { label: 'Photograph front elevation', category: 'Exterior' },
  { label: 'Check roof condition & gutters', category: 'Exterior' },
  { label: 'Inspect foundation & siding', category: 'Exterior' },
  { label: 'Document all windows & doors', category: 'Exterior' },
  { label: 'Lock change / re-key', category: 'Exterior' },
  { label: 'Winterization check', category: 'Exterior' },
  { label: 'Grass cut / lawn condition', category: 'Exterior' },
  { label: 'Debris & trash removal', category: 'Exterior' },
  { label: 'Photograph each room', category: 'Interior' },
  { label: 'HVAC inspection', category: 'Interior' },
  { label: 'Plumbing — visible leaks', category: 'Interior' },
  { label: 'Electrical panel condition', category: 'Interior' },
  { label: 'Smoke / CO detector present', category: 'Interior' },
  { label: 'Water heater condition', category: 'Interior' },
  { label: 'Appliances documented', category: 'Interior' },
  { label: 'Mold / moisture assessment', category: 'Interior' },
  { label: 'Utility shutoffs confirmed', category: 'Compliance' },
  { label: 'Property secured before exit', category: 'Compliance' },
  { label: 'Work order signed off', category: 'Compliance' },
  { label: 'Report photos uploaded', category: 'Compliance' },
];

export function makeChecklist(): ChecklistItem[] {
  return ITEMS.map((item, i) => ({
    ...item,
    id: `chk-${Date.now()}-${i}`,
    checked: false,
  }));
}

export function calcProgress(checklist: ChecklistItem[]): number {
  if (!checklist.length) return 0;
  return Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100);
}

export function groupByCategory(checklist: ChecklistItem[]): Record<string, ChecklistItem[]> {
  return checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);
}
