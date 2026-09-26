import { Category } from '../types';
import { PRODUCTS } from '../products';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'dark-chocolate',
    name: 'Single Origin Dark',
    tagline: 'Pure Cacao Terroir',
    description: 'Uncompromised dark chocolate bars crafted from single-estate cacao beans across South India and equatorial micro-farms.',
    heroImage: '/Kunafa Pistachio Dark Chocolate 1.png'
  },
  {
    id: 'cat-2',
    slug: 'pralines-truffles',
    name: 'Haute Pralines & Truffles',
    tagline: 'Artisanal Shells & Ganaches',
    description: 'Hand-painted chocolate shells encapsulating Kashmiri saffron, toasted hazelnut gianduja, and single-malt infused ganache.',
    heroImage: '/Kunafa and Pistachio Creme 1.png'
  },
  {
    id: 'cat-3',
    slug: 'luxury-gift-boxes',
    name: 'Grand Gift Chests',
    tagline: 'The Ultimate Expression of Gratitude',
    description: 'Custom handcrafted keepsake boxes upholstered in deep velvet with gold foil stamping for monumental celebrations.',
    heroImage: '/White Chocolate Hazelnut Creme 1.png'
  },
  {
    id: 'cat-4',
    slug: 'festive-special-editions',
    name: 'Royal Vintage Reserve',
    tagline: 'Limited Micro-Batch Releases',
    description: 'Rare harvests infused with royal botanicals, edible 24k gold leaf, and wild Himalayan forest honey.',
    heroImage: '/Crispy Speculoos Creme Milk Chocolate 1.png'
  }
];

export const MOCK_PRODUCTS = PRODUCTS;
