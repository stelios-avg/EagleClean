# EagleClean

Mobile app for a cleaning service business, built with React Native + Expo (managed workflow).

## Tech stack

| Concern    | Choice                                                        | Status            |
| ---------- | ------------------------------------------------------------- | ----------------- |
| Frontend   | React Native + Expo (managed)                                 | Phase 1 (done)    |
| Navigation | React Navigation (native stack + bottom tabs)                 | Phase 1 (done)    |
| Backend    | Supabase (database + auth)                                    | Phase 2           |
| Payments   | Stripe React Native (one-time) + Stripe Billing (membership)  | Phase 3           |
| Styling    | Tailwind CSS via NativeWind                                   | Later phase       |

## Running the app

```bash
npm install
npm start        # then press i (iOS simulator) or a (Android emulator)
```

## Navigation architecture

```
NavigationContainer
└── RootNavigator (native stack, headers hidden)
    ├── Welcome                  # initial fork: "Book Now" vs "Login / Sign Up"
    ├── MainTabs (bottom tabs)
    │   ├── Home                 # can launch BookingFlow
    │   ├── Marketplace          # e-commerce (later phase)
    │   └── Account              # profile, orders, Membership Card €14.99/mo
    ├── BookingFlow (native stack)
    │   ├── Calendar             # step 1: pick a day
    │   ├── TimeSlots            # step 2: pick a 1-hour slot
    │   ├── ServiceSelection     # step 3: My Home sizes / Cleaning Crew services
    │   ├── BookingSummary       # review selection (auth enforced here)
    │   └── Payment              # Apple Pay / Google Pay via Stripe Platform Pay
    └── Auth (native stack, modal presentation)
        ├── Login
        └── SignUp
```

### Guest → authenticated handoff

All top-level routes are always registered, regardless of auth state. Auth
is enforced only where it matters (confirming a booking, the Account tab),
by reading `useAuth()` from `src/context/AuthContext.tsx`.

A guest can complete the whole booking flow. On `BookingSummary`, if they
are not logged in, the Auth stack opens as a modal *on top of* the booking
stack. Logging in flips the auth state, the modal dismisses, and the guest
lands back on their untouched summary — now able to confirm. Because no
navigator is conditionally unmounted, no navigation state (and no booking
selection) is ever lost during login.

`AuthContext` is a mock for now; Phase 2 swaps its internals for Supabase
(`onAuthStateChange` + session persistence) without touching any screen.

### Payments (Apple Pay / Google Pay)

The booking flow ends on `Payment`, which uses `@stripe/stripe-react-native`
Platform Pay: a single `PlatformPayButton` + `confirmPlatformPayPayment()`
call renders the native Apple Pay sheet on iOS and Google Pay sheet on
Android. Configuration lives in `src/constants/payments.ts` (publishable
key, merchant ID, country/currency, mock price list).

Still needed to take real payments:

1. **Backend (Phase 2):** a Supabase Edge Function that creates a Stripe
   PaymentIntent with the secret key and returns its `client_secret` —
   see the TODO in `src/screens/booking/PaymentScreen.tsx`.
2. **Stripe keys:** replace `pk_test_REPLACE_ME` in
   `src/constants/payments.ts`.
3. **Apple Pay:** register the merchant ID (`merchant.com.eagleclean.app`)
   in your Apple Developer account and upload the Apple Pay certificate to
   Stripe.
4. **Development build:** wallet payments are native features and do NOT
   work in Expo Go. Run `npx expo run:ios` / `npx expo run:android` (or an
   EAS development build) — the config plugin in `app.json` handles the
   native setup.

## Folder structure

```
src/
├── components/ui.tsx        # minimal shared placeholder UI (NativeWind later)
├── context/AuthContext.tsx  # auth state (mock now, Supabase in Phase 2)
├── navigation/
│   ├── types.ts             # param lists + global typing for useNavigation
│   ├── RootNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── BookingNavigator.tsx
│   └── AuthNavigator.tsx
└── screens/
    ├── WelcomeScreen.tsx
    ├── auth/                # Login, SignUp
    ├── booking/             # Calendar, TimeSlots, ServiceSelection, BookingSummary
    └── tabs/                # Home, Marketplace, Account
```
