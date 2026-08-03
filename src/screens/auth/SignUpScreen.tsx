import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormInput, PillButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';
import AuthShell from './AuthShell';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const { t } = useI18n();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const closeModal = () => navigation.getParent()?.goBack();

  const handleSignUp = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert(t('auth.errorTitle'), t('auth.passwordHint'));
      return;
    }
    setBusy(true);
    try {
      const { needsEmailConfirmation } = await signUp(email, password, fullName);
      if (needsEmailConfirmation) {
        Alert.alert(t('auth.checkEmailTitle'), t('auth.checkEmailBody'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      closeModal();
    } catch (e) {
      Alert.alert(t('auth.errorTitle'), (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.signupTitle')}
      subtitle={t('auth.signupSubtitle')}
      onClose={closeModal}
      footer={
        <Pressable
          onPress={() => navigation.goBack()}
          disabled={busy}
          hitSlop={8}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Text style={styles.footerText}>
            {t('auth.hasAccountPrefix')}{' '}
            <Text style={styles.footerLink}>{t('auth.hasAccountAction')}</Text>
          </Text>
        </Pressable>
      }
    >
      <FormInput
        label={t('auth.fullName')}
        value={fullName}
        onChangeText={setFullName}
        placeholder={t('auth.fullNamePlaceholder')}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        icon="person-outline"
      />
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
        placeholder={t('auth.passwordHint')}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        icon="lock-closed-outline"
      />
      <View style={{ height: 4 }} />
      <PillButton
        label={busy ? t('auth.pleaseWait') : t('auth.create')}
        onPress={handleSignUp}
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
