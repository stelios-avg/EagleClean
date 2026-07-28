import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heading, ImageCard } from '../../components/ui';
import { colors, spacing } from '../../theme';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>Services</Heading>

      <ImageCard
        image={require('../../../assets/images/service-home.png')}
        title={'Regular & deep\nCleaning'}
        linkLabel="Book Cleaning services"
        onPress={() => navigation.navigate('BookingFlow')}
      />

      <ImageCard
        image={require('../../../assets/images/service-crew.png')}
        title="Cleaning Crew"
        linkLabel="Deep cleaning & events"
        onPress={() => navigation.navigate('BookingFlow')}
      />

      <ImageCard
        image={require('../../../assets/images/marketplace-products.png')}
        title="Cleaning essentials"
        linkLabel="Shop the marketplace"
        height={260}
        onPress={() => navigation.navigate('Marketplace')}
      />

      <View style={{ height: 10 }} />
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
    gap: 18,
  },
});
