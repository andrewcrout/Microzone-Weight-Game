import { WeightCard } from '../../../shared/models/app.models';

export interface CardAssetSet {
  front: string;
  back: string;
  label: string;
}

const ticketCardAssets: CardAssetSet = {
  front: 'assets/Ticket_Templates/Ticket_Front.png',
  back: 'assets/Ticket_Templates/Ticket_Back.png',
  label: 'Ticket card'
};

const weightCardAssetsByValue: Record<number, CardAssetSet> = {
  1: {
    front: 'assets/Lightning_Templates/Lightning_Front.png',
    back: 'assets/Lightning_Templates/Lightning_Back.png',
    label: 'Lightning weight card'
  },
  2: {
    front: 'assets/Water_Templates/Water_Front.png',
    back: 'assets/Water_Templates/Water_Back.png',
    label: 'Water weight card'
  },
  4: {
    front: 'assets/Plant_Templates/Plant_Front.png',
    back: 'assets/Plant_Templates/Plant_Back.png',
    label: 'Plant weight card'
  },
  8: {
    front: 'assets/Fire_Templates/Fire_Front.png',
    back: 'assets/Fire_Templates/Fire_Back.png',
    label: 'Fire weight card'
  },
  13: {
    front: 'assets/Stone_Templates/Stone_Front.png',
    back: 'assets/Stone_Templates/Stone_Back.png',
    label: 'Rock weight card'
  }
};

const weightCardAssetsByElement: Record<string, CardAssetSet> = {
  lightning: weightCardAssetsByValue[1],
  water: weightCardAssetsByValue[2],
  plant: weightCardAssetsByValue[4],
  fire: weightCardAssetsByValue[8],
  rock: weightCardAssetsByValue[13],
  stone: weightCardAssetsByValue[13]
};

const fallbackWeightCardAssets: CardAssetSet = {
  front: '',
  back: '',
  label: 'Weight card'
};

export function getTicketCardAssets(): CardAssetSet {
  return ticketCardAssets;
}

export function getWeightCardAssets(card: WeightCard): CardAssetSet {
  return weightCardAssetsByValue[card.weightValue]
    ?? weightCardAssetsByElement[normalizeElement(card.element)]
    ?? fallbackWeightCardAssets;
}

function normalizeElement(value: string): string {
  return value.trim().toLowerCase();
}
