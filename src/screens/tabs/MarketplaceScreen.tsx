import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Heading, ImageCard, Subtitle } from '../../components/ui';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, spacing } from '../../theme';

export default function MarketplaceScreen() {
  const { t } = useI18n();
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>{t('marketplace.title')}</Heading>
      <Subtitle>{t('marketplace.subtitle')}</Subtitle>
      <ImageCard
        image={require('../../../assets/images/marketplace-products.png')}
        title={t('marketplace.products')}
        linkLabel={t('marketplace.soon')}
        height={300}
        onPress={() => {}}
      />
      <ImageCard
        image={require('../../../assets/images/marketplace-equipment.png')}
        title={t('marketplace.equipment')}
        linkLabel={t('marketplace.soon')}
        height={300}
        imageAlign="bottom"
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
