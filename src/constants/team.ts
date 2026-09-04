import type { ImageSourcePropType } from 'react-native';

export type TeamCleaner = {
  nameEl: string;
  nameEn: string;
  rating: number;
  photo: ImageSourcePropType;
};

export const TEAM_CLEANERS: TeamCleaner[] = [
  {
    nameEl: 'Ελένη Παπαδοπούλου',
    nameEn: 'Eleni Papadopoulou',
    rating: 4.9,
    photo: require('../../assets/images/team/cleaner-1.png'),
  },
  {
    nameEl: 'Μαρία Νικολάου',
    nameEn: 'Maria Nicolaou',
    rating: 5,
    photo: require('../../assets/images/team/cleaner-2.png'),
  },
  {
    nameEl: 'Άννα Χριστοδούλου',
    nameEn: 'Anna Christodoulou',
    rating: 4.5,
    photo: require('../../assets/images/team/cleaner-3.png'),
  },
  {
    nameEl: 'Σοφία Ιωάννου',
    nameEn: 'Sofia Ioannou',
    rating: 5,
    photo: require('../../assets/images/team/cleaner-4.png'),
  },
];

/** Stable display cleaner for a booking until assignments are stored. */
export function cleanerForBooking(bookingId: string): TeamCleaner {
  let hash = 0;
  for (let i = 0; i < bookingId.length; i += 1) {
    hash = (hash + bookingId.charCodeAt(i)) % TEAM_CLEANERS.length;
  }
  return TEAM_CLEANERS[hash] ?? TEAM_CLEANERS[0];
}
