import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, ScreenContainer, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { t } = useI18n();

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
      <Heading>{t('auth.signupTitle')}</Heading>
      <Subtitle>{t('auth.placeholder')}</Subtitle>
      <View style={{ height: 8 }} />
      <PillButton label={t('auth.createMock')} onPress={handleSignUp} />
      <PillButton
        label={t('auth.backToLogin')}
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
