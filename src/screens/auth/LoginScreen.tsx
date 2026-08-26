import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormInput, PillButton } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';
import AuthShell from './AuthShell';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const closeModal = () => navigation.getParent()?.goBack();

  const handleLogin = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert(t('auth.errorTitle'), t('auth.invalidCredentials'));
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
      closeModal();
    } catch (e) {
      Alert.alert(t('auth.errorTitle'), (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      onClose={closeModal}
      footer={
        <PressableScale
          onPress={() => navigation.navigate('SignUp')}
          disabled={busy}
          hitSlop={8}
        >
          <Text style={styles.footerText}>
            {t('auth.noAccountPrefix')}{' '}
            <Text style={styles.footerLink}>{t('auth.noAccountAction')}</Text>
          </Text>
        </PressableScale>
      }
    >
      <FormInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('contact.emailPlaceholder')}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        icon="mail-outline"
      />
      <FormInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        icon="lock-closed-outline"
      />
      <View style={{ height: 4 }} />
      <PillButton
        label={busy ? t('auth.pleaseWait') : t('auth.login')}
        onPress={handleLogin}
        disabled={busy}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footerText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerLink: {
    fontFamily: fonts.bold,
    color: colors.accent,
  },
});
