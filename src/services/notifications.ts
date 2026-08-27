import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let cachedToken: string | null = null;

export function getCachedPushToken(): string | null {
  return cachedToken;
}

function easProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId
  );
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Κρατήσεις',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#30CCCC',
  });
}

/** Asks permission and stores an Expo push token when the device supports it. */
export async function registerPushNotifications(): Promise<string | null> {
  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    return null;
  }

  try {
    const projectId = easProjectId();
    const token = projectId
      ? (await Notifications.getExpoPushTokenAsync({ projectId })).data
      : (await Notifications.getExpoPushTokenAsync()).data;
    cachedToken = token;
    return token;
  } catch {
    cachedToken = null;
    return null;
  }
}

export async function savePushTokenToProfile(userId: string, token: string): Promise<void> {
  await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
}

export function formatArrivalWhen(
  serviceDate: string,
  arrivalTime: string,
  locale: string
): string {
  const dateLabel = new Date(`${serviceDate}T12:00:00`).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `${dateLabel} · ${arrivalTime}`;
}

export function hoursUntilArrival(
  serviceDate: string,
  arrivalTime: string,
  locale: string
): string | null {
  const [year, month, day] = serviceDate.split('-').map(Number);
  const [hour, minute] = arrivalTime.split(':').map(Number);
  if (![year, month, day, hour, minute].every((n) => Number.isFinite(n))) {
    return null;
  }
  const arrival = new Date(year, month - 1, day, hour, minute, 0, 0);
  const diffMs = arrival.getTime() - Date.now();
  if (diffMs <= 0) {
    return null;
  }
  const hours = Math.round(diffMs / 3_600_000);
  const el = locale.toLowerCase().startsWith('el');
  if (hours < 1) {
    return el ? 'σε λιγότερο από μία ώρα' : 'in less than an hour';
  }
  if (hours === 1) {
    return el ? 'σε 1 ώρα' : 'in 1 hour';
  }
  return el ? `σε ${hours} ώρες` : `in ${hours} hours`;
}

export async function presentArrivalNotice(input: {
  bookingId: string;
  serviceDate: string;
  arrivalTime: string;
  locale: string;
  title: string;
  body: string;
}): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: `booking-accepted-${input.bookingId}`,
    content: {
      title: input.title,
      body: input.body,
      sound: 'default',
      data: { bookingId: input.bookingId, type: 'booking_accepted' },
    },
    trigger: null,
  });
}
