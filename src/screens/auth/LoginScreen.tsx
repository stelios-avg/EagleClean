import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, ScreenContainer, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const handleLogin = () => {
    // Phase 2: real form + supabase.auth.signInWithPassword
    signIn('demo@eagleclean.app');
    // Dismiss the whole Auth modal; the caller underneath is now authenticated.
    navigation.getParent()?.goBack();
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="lock-closed-outline" size={56} color={colors.accent} />
      </View>
      <Heading>Login</Heading>
      <Subtitle>Placeholder — Supabase Auth arrives in Phase 2.</Subtitle>
      <View style={{ height: 8 }} />
      <PillButton label="Log in (mock)" onPress={handleLogin} />
      <PillButton
        label="No account? Sign up"
        variant="outline"
        onPress={() => navigation.navigate('SignUp')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'flex-start',
    marginBottom: 6,
  },
});
