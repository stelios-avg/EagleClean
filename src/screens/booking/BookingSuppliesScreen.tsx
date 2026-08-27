import React, { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProductThumb } from '../../components/ProductThumb';
import { PillButton } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { formatEuros, suppliesTotalCents } from '../../constants/payments';
import { SHOP_CATEGORIES } from '../../constants/shop';
import { useI18n } from '../../i18n/LanguageContext';
import type { BookingSupply, BookingStackParamList } from '../../navigation/types';
import { catalogProducts } from '../../services/shop';
import { colors, fonts, radii, spacing } from '../../theme';
import type { Product } from '../../types/database';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingSupplies'>;

function qtyMapFrom(supplies: BookingSupply[] | undefined): Record<string, number> {
  const next: Record<string, number> = {};
  for (const item of supplies ?? []) {
    next[item.productId] = item.quantity;
  }
  return next;
}

function ProductRow({
  product,
  qty,
  onAdd,
  onSet,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onSet: (n: number) => void;
}) {
  const { locale } = useI18n();
  const name = locale === 'el' ? product.name_el : product.name_en;

  return (
    <View style={styles.row}>
      <ProductThumb productId={product.id} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{name}</Text>
        <View style={styles.rowMeta}>
          {product.variant_label ? (
            <View style={styles.variantChip}>
              <Text style={styles.variantText}>{product.variant_label}</Text>
            </View>
          ) : null}
          <Text style={styles.rowCode}>{product.code}</Text>
        </View>
        <Text style={styles.rowPrice}>{formatEuros(product.price_cents)}</Text>
      </View>
      {qty === 0 ? (
        <PressableScale onPress={onAdd} style={styles.addBtn} hitSlop={8}>
          <Ionicons name="add" size={22} color={colors.textOnAccent} />
        </PressableScale>
      ) : (
        <View style={styles.stepper}>
          <PressableScale onPress={() => onSet(qty - 1)} style={styles.stepBtn} hitSlop={6}>
            <Ionicons
              name={qty === 1 ? 'trash-outline' : 'remove'}
              size={17}
              color={colors.textOnAccent}
            />
          </PressableScale>
          <Text style={styles.stepValue}>{qty}</Text>
          <PressableScale onPress={onAdd} style={styles.stepBtn} hitSlop={6}>
            <Ionicons name="add" size={17} color={colors.textOnAccent} />
          </PressableScale>
        </View>
      )}
    </View>
  );
}

export default function BookingSuppliesScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(SHOP_CATEGORIES[0].slug);
  const [qtyById, setQtyById] = useState(() => qtyMapFrom(route.params.supplies));

  const products = useMemo(() => catalogProducts(category), [category]);

  const selectedItems = useMemo(() => {
    const items: BookingSupply[] = [];
    for (const cat of SHOP_CATEGORIES) {
      for (const product of catalogProducts(cat.slug)) {
        const quantity = qtyById[product.id] ?? 0;
        if (quantity <= 0) {
          continue;
        }
        items.push({
          productId: product.id,
          nameEl: product.name_el,
          nameEn: product.name_en,
          variantLabel: product.variant_label,
          unitPriceCents: product.price_cents,
          quantity,
        });
      }
    }
    return items;
  }, [qtyById]);

  const count = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = suppliesTotalCents(selectedItems);

  const add = (product: Product) => {
    setQtyById((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
  };
  const setQty = (productId: string, quantity: number) => {
    setQtyById((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }
      return next;
    });
  };

  const confirm = () => {
    if (selectedItems.length === 0) {
      Alert.alert(t('supplies.needOneTitle'), t('supplies.needOne'));
      return;
    }
    navigation.navigate('BookingSummary', { ...route.params, supplies: selectedItems });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.lead}>{t('supplies.subtitle')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cats}
      >
        {SHOP_CATEGORIES.map((cat) => {
          const active = cat.slug === category;
          return (
            <PressableScale
              key={cat.slug}
              onPress={() => setCategory(cat.slug)}
              style={[styles.catChip, active && styles.catChipOn]}
            >
              <Text style={[styles.catLabel, active && styles.catLabelOn]}>
                {t(`shopCat.${cat.slug}`)}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            qty={qtyById[item.id] ?? 0}
            onAdd={() => add(item)}
            onSet={(n) => setQty(item.id, n)}
          />
        )}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Text style={styles.footerMeta}>
          {count} · {formatEuros(total)}
        </Text>
        <PillButton
          label={t('supplies.add')}
          onPress={confirm}
          disabled={selectedItems.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lead: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cats: {
    paddingHorizontal: spacing.screen,
    paddingVertical: 12,
    gap: 8,
  },
  catChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  catChipOn: {
    backgroundColor: colors.ink,
  },
  catLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  catLabelOn: {
    color: colors.textOnDark,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowInfo: {
    flex: 1,
    gap: 4,
  },
  rowName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variantChip: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  variantText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  rowCode: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  rowPrice: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerMeta: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
