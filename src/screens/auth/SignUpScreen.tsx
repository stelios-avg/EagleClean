import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, ScreenContainer, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const handleSignUp = () => {
    // Phase 2: real form + supabase.auth.signUp
    signIn('new-user@eagleclean.app');
    // Dismiss the entire Auth modal (not just this screen).
    navigation.getParent()?.goBack();
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="person-add-outline" size={56} color={colors.accent} />
      </View>
      <Heading>Sign Up</Heading>
      <Subtitle>Placeholder — Supabase Auth arrives in Phase 2.</Subtitle>
      <View style={{ height: 8 }} />
      <PillButton label="Create account (mock)" onPress={handleSignUp} />
      <PillButton
        label="Back to login"
        variant="outline"
        onPress={() => navigation.goBack()}
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
