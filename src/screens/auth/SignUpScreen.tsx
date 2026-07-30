import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, Heading, PillButton, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const { t } = useI18n();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

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
      navigation.getParent()?.goBack();
    } catch (e) {
      Alert.alert(t('auth.errorTitle'), (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.icon}>
          <Ionicons name="person-add-outline" size={56} color={colors.accent} />
        </View>
        <Heading>{t('auth.signupTitle')}</Heading>
        <Subtitle>{t('auth.signupSubtitle')}</Subtitle>
        <View style={{ height: 8 }} />
        <FormInput
          label={t('auth.fullName')}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('auth.fullNamePlaceholder')}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <FormInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('contact.emailPlaceholder')}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordHint')}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <View style={{ height: 8 }} />
        <PillButton
          label={busy ? t('auth.pleaseWait') : t('auth.create')}
          onPress={handleSignUp}
          disabled={busy}
        />
        <PillButton
          label={t('auth.backToLogin')}
          variant="outline"
          onPress={() => navigation.goBack()}
          disabled={busy}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.screen,
    gap: 10,
  },
  icon: {
    alignItems: 'flex-start',
    marginBottom: 6,
  },
});
