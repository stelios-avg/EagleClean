import type { Ionicons } from '@expo/vector-icons';

export type ShopCategorySlug =
  | 'detergents'
  | 'bags'
  | 'paper'
  | 'tools'
  | 'professional'
  | 'bins'
  | 'equipment'
  | 'personal-care'
  | 'dispensers'
  | 'beverages'
  | 'household';

export type ShopCategory = {
  slug: ShopCategorySlug;
  /** i18n key suffix — full key is `shopCat.${slug}` */
  icon: keyof typeof Ionicons.glyphMap;
};

/** Display order of the marketplace categories. */
export const SHOP_CATEGORIES: ShopCategory[] = [
  { slug: 'detergents', icon: 'flask-outline' },
  { slug: 'paper', icon: 'file-tray-stacked-outline' },
  { slug: 'bags', icon: 'trash-bin-outline' },
  { slug: 'tools', icon: 'brush-outline' },
  { slug: 'professional', icon: 'shield-checkmark-outline' },
  { slug: 'bins', icon: 'trash-outline' },
  { slug: 'equipment', icon: 'cart-outline' },
  { slug: 'dispensers', icon: 'water-outline' },
  { slug: 'personal-care', icon: 'sparkles-outline' },
  { slug: 'household', icon: 'home-outline' },
  { slug: 'beverages', icon: 'cafe-outline' },
];
