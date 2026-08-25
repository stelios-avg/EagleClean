import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SubpageHeader } from '../../components/ui';
import { formatEuros } from '../../constants/payments';
import { useCart } from '../../context/CartContext';
import { useI18n } from '../../i18n/LanguageContext';
import { listProductsByCategory } from '../../services/shop';
import { colors, fonts, radii, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';
import type { Product } from '../../types/database';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopCategory'>;

function ProductRow({ product }: { product: Product }) {
  const { locale } = useI18n();
  const { quantityOf, add, setQuantity } = useCart();
  const qty = quantityOf(product.id);
  const name = locale === 'el' ? product.name_el : product.name_en;

  return (
    <View style={styles.row}>
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
        <Pressable
          onPress={() => add(product)}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          hitSlop={8}
        >
          <Ionicons name="add" size={22} color={colors.textOnDark} />
        </Pressable>
      ) : (
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setQuantity(product.id, qty - 1)}
            style={styles.stepBtn}
            hitSlop={6}
          >
            <Ionicons
              name={qty === 1 ? 'trash-outline' : 'remove'}
              size={17}
              color={colors.textOnDark}
            />
          </Pressable>
          <Text style={styles.stepValue}>{qty}</Text>
          <Pressable
            onPress={() => add(product)}
            style={styles.stepBtn}
            hitSlop={6}
          >
            <Ionicons name="add" size={17} color={colors.textOnDark} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ShopCategoryScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { count, totalCents } = useCart();
  const { category } = route.params;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listProductsByCategory(category)
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch((e) => {
        if (active) {
          setError((e as Error).message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [category]);

  return (
    <View style={styles.root}>
      <SubpageHeader
        title={t(`shopCat.${category}`)}
        onBack={() => navigation.goBack()}
        topInset={insets.top}
      />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : products.length === 0 ? (
        <Text style={styles.errorText}>{t('shop.emptyCategory')}</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ProductRow product={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {count > 0 ? (
        <Pressable
          onPress={() => navigation.navigate('ShopCart')}
          style={({ pressed }) => [
            styles.cartBar,
            { bottom: Math.max(insets.bottom, 14) },
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{count}</Text>
          </View>
          <Text style={styles.cartBarLabel}>{t('shop.viewCart')}</Text>
          <Text style={styles.cartBarTotal}>{formatEuros(totalCents)}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.screen,
    paddingBottom: 110,
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
  errorText: {
    margin: spacing.screen,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cartBar: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  cartBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: colors.textOnDark,
    fontSize: 13,
    fontFamily: fonts.extraBold,
  },
  cartBarLabel: {
    flex: 1,
    color: colors.textOnDark,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  cartBarTotal: {
    color: colors.textOnDark,
    fontSize: 16,
    fontFamily: fonts.extraBold,
  },
});
