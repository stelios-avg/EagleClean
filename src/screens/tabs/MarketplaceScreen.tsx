import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Heading, ImageCard, Subtitle } from '../../components/ui';
import { colors, spacing } from '../../theme';

export default function MarketplaceScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>Marketplace</Heading>
      <Subtitle>
        Premium cleaning products, delivered to your door. The full shop opens
        in a later phase.
      </Subtitle>
      <ImageCard
        image={require('../../../assets/images/marketplace-products.png')}
        title="Eco-friendly essentials"
        linkLabel="Coming soon"
        onPress={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: 14,
  },
});
