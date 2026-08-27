import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  formatArrivalWhen,
  getCachedPushToken,
  hoursUntilArrival,
  presentArrivalNotice,
  registerPushNotifications,
  savePushTokenToProfile,
} from '../services/notifications';

/** Registers for notifications and shows a local banner when an admin accepts a visit. */
export function BookingNotifications() {
  const { session } = useAuth();
  const { t, locale } = useI18n();
  const seen = useRef(new Set<string>());

  useEffect(() => {
    let alive = true;
    void registerPushNotifications().then(async (token) => {
      if (!alive || !token || !session?.userId) {
        return;
      }
      await savePushTokenToProfile(session.userId, token);
    });
    return () => {
      alive = false;
    };
  }, [session?.userId]);

  useEffect(() => {
    const channel = supabase
      .channel('booking-accepted-notice')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload) => {
          const next = payload.new as {
            id?: string;
            user_id?: string | null;
            status?: string;
            service_date?: string;
            arrival_time?: string | null;
          };
          if (next.status !== 'accepted' || !next.id || !next.arrival_time || !next.service_date) {
            return;
          }
          if (!session?.userId || next.user_id !== session.userId) {
            return;
          }
          if (seen.current.has(next.id)) {
            return;
          }
          seen.current.add(next.id);

          const when = formatArrivalWhen(next.service_date, next.arrival_time, locale);
          const inHours = hoursUntilArrival(next.service_date, next.arrival_time, locale);
          const body = inHours
            ? t('notify.arrivalBodyHours', { hours: inHours, when })
            : t('notify.arrivalBody', { when });

          const remotePushWorks =
            Boolean(getCachedPushToken()) &&
            !(Platform.OS === 'android' && Constants.appOwnership === 'expo');

          if (!remotePushWorks) {
            void presentArrivalNotice({
              bookingId: next.id,
              serviceDate: next.service_date,
              arrivalTime: next.arrival_time,
              locale,
              title: t('notify.arrivalTitle'),
              body,
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [locale, session?.userId, t]);

  return null;
}
