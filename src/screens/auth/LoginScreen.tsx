import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, Heading, PillButton, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert(t('auth.errorTitle'), t('auth.invalidCredentials'));
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
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
          <Ionicons name="lock-closed-outline" size={56} color={colors.accent} />
        </View>
        <Heading>{t('auth.loginTitle')}</Heading>
        <Subtitle>{t('auth.loginSubtitle')}</Subtitle>
        <View style={{ height: 8 }} />
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
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
        />
        <View style={{ height: 8 }} />
        <PillButton
          label={busy ? t('auth.pleaseWait') : t('auth.login')}
          onPress={handleLogin}
          disabled={busy}
        />
        <PillButton
          label={t('auth.noAccount')}
          variant="outline"
          onPress={() => navigation.navigate('SignUp')}
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
