import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productPhoto } from '../data/productImages';
import { colors, radii } from '../theme';

export function ProductThumb({ productId }: { productId: string }) {
  const source = productPhoto(productId);
  return (
    <View style={styles.wrap}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="contain" />
      ) : (
        <Ionicons name="cube-outline" size={22} color={colors.tabInactive} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 64,
    height: 64,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 64,
    height: 64,
  },
});
