import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProductThumb } from '../../components/ProductThumb';
import { PillButton, SubpageHeader, Subtitle } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { SERVICE_FEE_CENTS, formatEuros, withServiceFee } from '../../constants/payments';
import { useCart, type CartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopCart'>;

function CartRow({ item }: { item: CartItem }) {
  const { locale } = useI18n();
  const { add, setQuantity } = useCart();
  const { product, quantity } = item;
  const name = locale === 'el' ? product.name_el : product.name_en;

  return (
    <View style={styles.row}>
      <ProductThumb productId={product.id} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{name}</Text>
        <Text style={styles.rowMeta}>
          {product.variant_label ? `${product.variant_label} · ` : ''}
          {formatEuros(product.price_cents)}
        </Text>
      </View>
      <View style={styles.stepper}>
        <PressableScale
          onPress={() => setQuantity(product.id, quantity - 1)}
          style={styles.stepBtn}
          hitSlop={6}
        >
          <Ionicons
            name={quantity === 1 ? 'trash-outline' : 'remove'}
            size={17}
            color={colors.textOnAccent}
          />
        </PressableScale>
        <Text style={styles.stepValue}>{quantity}</Text>
        <PressableScale onPress={() => add(product)} style={styles.stepBtn} hitSlop={6}>
          <Ionicons name="add" size={17} color={colors.textOnAccent} />
        </PressableScale>
      </View>
      <Text style={styles.rowTotal}>
        {formatEuros(product.price_cents * quantity)}
      </Text>
    </View>
  );
}

export default function CartScreen({ navigation }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { items, totalCents } = useCart();
  const { isAuthenticated } = useAuth();

  const checkout = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    navigation.navigate('ShopCheckout');
  };

  return (
    <View style={styles.root}>
      <SubpageHeader
        title={t('shop.cart')}
        onBack={() => navigation.goBack()}
        topInset={insets.top}
      />

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={34} color={colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>{t('shop.cartEmpty')}</Text>
          <Subtitle>{t('shop.cartEmptyHint')}</Subtitle>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => i.product.id}
            renderItem={({ item }) => <CartRow item={item} />}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <View
            style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}
          >
            <View style={styles.totalRow}>
              <Text style={styles.feeLabel}>{t('summary.serviceFee')}</Text>
              <Text style={styles.feeValue}>{formatEuros(SERVICE_FEE_CENTS)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('shop.total')}</Text>
              <Text style={styles.totalValue}>{formatEuros(withServiceFee(totalCents))}</Text>
            </View>
            {!isAuthenticated ? <Subtitle>{t('shop.loginPrompt')}</Subtitle> : null}
            <PillButton
              label={isAuthenticated ? t('shop.checkout') : t('shop.loginToOrder')}
              onPress={checkout}
            />
          </View>
        </>
      )}
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
    paddingBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowInfo: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  rowMeta: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  rowTotal: {
    minWidth: 62,
    textAlign: 'right',
    fontSize: 14,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen * 1.5,
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.screen,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
});
