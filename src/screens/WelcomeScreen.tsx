import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandTitle, PillButton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../assets/images/hero-welcome.png')}
        style={styles.hero}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'transparent']}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          style={styles.bottomGradient}
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.brandBar}>
            <BrandTitle size={22} />
          </View>

          <View style={styles.content}>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.welcomeSubtitle}>
              Enjoy a spotless home, easily booked with a few simple taps.
            </Text>
            <View style={styles.buttons}>
              <PillButton
                label="Book Now"
                variant="light"
                onPress={() => navigation.navigate('BookingFlow')}
              />
              <PillButton
                label="Login / Sign Up"
                variant="ghost"
                onPress={() => navigation.navigate('Auth')}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  hero: {
    flex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandBar: {
    alignItems: 'center',
    paddingTop: 14,
  },
  content: {
    padding: 26,
    gap: 12,
  },
  welcomeTitle: {
    color: colors.textOnDark,
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    color: colors.textOnDarkMuted,
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 14,
  },
  buttons: {
    gap: 12,
  },
});
