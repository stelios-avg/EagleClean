import catalog from '../data/products.json';
import { HIDDEN_SHOP_CATEGORIES } from '../constants/shop';
import { supabase } from '../lib/supabase';
import type { ContactDetails } from '../navigation/types';
import type { Product, ProductOrder, ProductOrderItem } from '../types/database';

type CatalogRow = Omit<Product, 'created_at'> & { image?: string };

/** Instant local catalog — browsing never waits on the network. */
function localProducts(category: string): Product[] {
  if ((HIDDEN_SHOP_CATEGORIES as readonly string[]).includes(category)) {
    return [];
  }
  return (catalog as CatalogRow[])
    .filter((p) => p.category === category && p.active)
    .sort((a, b) => a.sort - b.sort)
    .map(({ image: _image, ...p }) => ({ ...p, created_at: '' }));
}

export function catalogProducts(category: string): Product[] {
  return localProducts(category);
}

export async function listProductsByCategory(category: string): Promise<Product[]> {
  return localProducts(category);
}

export type OrderItemInput = {
  productId: string;
  nameEl: string;
  nameEn: string;
  variantLabel: string | null;
  unitPriceCents: number;
  quantity: number;
};

/** Creates the order plus its line items for the signed-in user. */
export async function createProductOrder(
  items: OrderItemInput[],
  contact: Pick<ContactDetails, 'email' | 'phone' | 'address'>
): Promise<ProductOrder> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? 'Not signed in');
  }

  const total = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('product_orders')
    .insert({
      user_id: user.id,
      contact_email: contact.email.trim(),
      contact_phone: contact.phone.trim(),
      contact_address: contact.address.trim(),
      total_cents: total,
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(orderError.message);
  }

  const { error: itemsError } = await supabase.from('product_order_items').insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      name_el: i.nameEl,
      name_en: i.nameEn,
      variant_label: i.variantLabel,
      unit_price_cents: i.unitPriceCents,
      quantity: i.quantity,
    }))
  );

  if (itemsError) {
    // Don't leave a header row without items behind.
    await supabase.from('product_orders').delete().eq('id', order.id);
    throw new Error(itemsError.message);
  }

  return order;
}

export type MyOrder = ProductOrder & { product_order_items: ProductOrderItem[] };

export async function listMyOrders(): Promise<MyOrder[]> {
  const { data, error } = await supabase
    .from('product_orders')
    .select('*, product_order_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as MyOrder[] | null) ?? [];
}
