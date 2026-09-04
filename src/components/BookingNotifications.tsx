import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import { navigateToBookingCompleted } from '../navigation/root-navigation';
import {
  formatArrivalWhen,
  getCachedPushToken,
  hoursUntilArrival,
  parseNoticeData,
  presentArrivalNotice,
  presentCompletedNotice,
  registerPushNotifications,
  savePushTokenToProfile,
} from '../services/notifications';

let handledResponseId: string | null = null;

function openFromNotice(data: unknown) {
  const parsed = parseNoticeData(data);
  if (!parsed || parsed.type !== 'booking_completed') {
    return;
  }
  navigateToBookingCompleted({
    bookingId: parsed.bookingId,
    serviceDate: parsed.serviceDate,
    timeSlot: parsed.timeSlot,
    address: parsed.address,
  });
}

/** Registers for notifications and shows a local banner when an admin accepts or completes a visit. */
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
    const handle = (response: Notifications.NotificationResponse | null) => {
      if (!response) {
        return;
      }
      const id = response.notification.request.identifier;
      if (handledResponseId === id) {
        return;
      }
      handledResponseId = id;
      openFromNotice(response.notification.request.content.data);
      Notifications.clearLastNotificationResponse();
    };

    handle(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('booking-status-notice')
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
            time_slot?: string;
            contact_address?: string;
          };
          if (!next.id || !next.status) {
            return;
          }
          if (!session?.userId || next.user_id !== session.userId) {
            return;
          }

          const key = `${next.id}:${next.status}`;
          if (seen.current.has(key)) {
            return;
          }

          const remotePushWorks =
            Boolean(getCachedPushToken()) &&
            !(Platform.OS === 'android' && Constants.appOwnership === 'expo');

          if (next.status === 'accepted' && next.arrival_time && next.service_date) {
            seen.current.add(key);
            const when = formatArrivalWhen(next.service_date, next.arrival_time, locale);
            const inHours = hoursUntilArrival(next.service_date, next.arrival_time, locale);
            const body = inHours
              ? t('notify.arrivalBodyHours', { hours: inHours, when })
              : t('notify.arrivalBody', { when });
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
            return;
          }

          if (next.status === 'completed') {
            seen.current.add(key);
            navigateToBookingCompleted({
              bookingId: next.id,
              serviceDate: next.service_date,
              timeSlot: next.time_slot,
              address: next.contact_address,
            });
            if (!remotePushWorks) {
              void presentCompletedNotice({
                bookingId: next.id,
                title: t('notify.completedTitle'),
                body: t('notify.completedBody'),
                serviceDate: next.service_date,
                timeSlot: next.time_slot,
                address: next.contact_address,
              });
            }
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
