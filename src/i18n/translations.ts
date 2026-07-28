export type Language = 'el' | 'en';

const el = {
  // Welcome
  'welcome.title': 'Καλώς ήρθες!',
  'welcome.subtitle': 'Απόλαυσε ένα πεντακάθαρο σπίτι, με λίγα μόνο βήματα.',
  'welcome.bookNow': 'Κράτηση Τώρα',
  'welcome.loginSignup': 'Σύνδεση / Εγγραφή',

  // Tabs
  'tab.home': 'Αρχική',
  'tab.marketplace': 'Αγορά',
  'tab.account': 'Λογαριασμός',

  // Home
  'home.tagline': 'Κράτησε καθαρισμό κατά παραγγελία',
  'home.searchCta': 'Πότε να έρθουμε;',
  'home.categories': 'Κατηγορίες',
  'home.featured': 'Προτεινόμενα',
  'home.viewAll': 'Όλα',
  'home.services': 'Υπηρεσίες',
  'home.regularDeep': 'Τακτικός & Βαθύς\nΚαθαρισμός',
  'home.bookCleaning': 'Κράτηση καθαρισμού',
  'home.crew': 'Συνεργείο Καθαρισμού',
  'home.crewLink': 'Βαθύς καθαρισμός & εκδηλώσεις',
  'home.essentials': 'Είδη καθαρισμού',
  'home.shopLink': 'Δες την αγορά',

  // Booking navigation titles
  'nav.selectDay': 'Ημέρα & Ώρα',
  'nav.selectService': 'Επιλογή Υπηρεσίας',
  'nav.summary': 'Σύνοψη',
  'nav.contact': 'Στοιχεία Επικοινωνίας',
  'nav.payment': 'Πληρωμή',
  'nav.login': 'Σύνδεση',
  'nav.signup': 'Εγγραφή',

  // Calendar
  'calendar.title': 'Διάλεξε ημέρα & ώρα',
  'calendar.step': 'Βήμα 1 από 3 — πότε να έρθουμε;',
  'calendar.slotsFor': 'Διαθέσιμες ώρες',
  'calendar.pickDayHint': 'Πάτησε μια ημέρα στο ημερολόγιο για να δεις τις διαθέσιμες ώρες.',

  // Service selection
  'services.title': 'Διάλεξε υπηρεσία',
  'services.step': 'Βήμα 2 από 3 — τι να καθαρίσουμε;',
  'services.myHome': 'Το Σπίτι μου',
  'services.crew': 'Συνεργείο Καθαρισμού',
  'service.Studio': 'Στούντιο',
  'service.1 Bedroom': '1 Υπνοδωμάτιο',
  'service.2 Bedroom': '2 Υπνοδωμάτια',
  'service.3 Bedroom': '3 Υπνοδωμάτια',
  'service.Deep Cleaning': 'Βαθύς Καθαρισμός',
  'service.Events': 'Εκδηλώσεις',

  // Summary
  'summary.title': 'Σύνοψη κράτησης',
  'summary.subtitle': 'Έλεγξε την κράτησή σου πριν την πληρωμή.',
  'summary.service': 'Υπηρεσία',
  'summary.option': 'Επιλογή',
  'summary.day': 'Ημέρα',
  'summary.time': 'Ώρα',
  'summary.total': 'Σύνολο',
  'summary.continue': 'Συνέχεια',
  'summary.loginPrompt': 'Συνδέσου ή δημιούργησε λογαριασμό για να ολοκληρώσεις την κράτηση.',
  'summary.loginToConfirm': 'Σύνδεση για ολοκλήρωση',

  // Contact details
  'contact.title': 'Τα στοιχεία σου',
  'contact.step': 'Βήμα 3 από 3 — συμπλήρωσε τα στοιχεία σου για την κράτηση.',
  'contact.email': 'Email',
  'contact.emailPlaceholder': 'name@example.com',
  'contact.emailError': 'Συμπλήρωσε ένα έγκυρο email',
  'contact.phone': 'Τηλέφωνο',
  'contact.phonePlaceholder': 'π.χ. 99 123456',
  'contact.phoneError': 'Συμπλήρωσε ένα έγκυρο τηλέφωνο',
  'contact.address': 'Διεύθυνση',
  'contact.addressPlaceholder': 'Οδός, αριθμός, πόλη',
  'contact.addressError': 'Συμπλήρωσε τη διεύθυνσή σου',
  'contact.continue': 'Συνέχεια στην πληρωμή',

  // Payment
  'payment.title': 'Πληρωμή',
  'payment.subtitle': 'Πλήρωσε με ασφάλεια με το πορτοφόλι της συσκευής σου.',
  'payment.total': 'Σύνολο πληρωμής',
  'payment.successTitle': 'Επιτυχής πληρωμή',
  'payment.successBody': 'Ο καθαρισμός σου κλείστηκε!',
  'payment.failedTitle': 'Η πληρωμή απέτυχε',
  'payment.unavailableTitle': 'Μη διαθέσιμη πληρωμή',
  'payment.walletUnavailable':
    'Το Apple Pay / Google Pay δεν είναι διαθέσιμο σε αυτή τη συσκευή. Οι πληρωμές πορτοφολιού απαιτούν development build (όχι Expo Go).',

  // Account
  'account.title': 'Λογαριασμός',
  'account.guestTitle': 'Ο λογαριασμός σου',
  'account.guestSubtitle': 'Συνδέσου για να δεις κρατήσεις, παραγγελίες και τη συνδρομή σου.',
  'account.welcomeBack': 'Καλώς όρισες',
  'account.membership': 'Συνδρομή Μέλους',
  'account.perMonth': ' /μήνα',
  'account.perks': 'Προτεραιότητα στα ραντεβού, ειδικές τιμές μελών και δωρεάν παράδοση προϊόντων.',
  'account.become': 'Γίνε μέλος',
  'account.orders': 'Ιστορικό παραγγελιών',
  'account.ordersSub': 'Κρατήσεις και παραγγελίες',
  'account.ordersSoon': 'Το ιστορικό παραγγελιών έρχεται με το Supabase στη Φάση 2.',
  'account.membershipSoon': 'Η συνδρομή μέσω Stripe έρχεται στη Φάση 3.',
  'account.signOut': 'Αποσύνδεση',
  'account.language': 'Γλώσσα',

  // Auth
  'auth.loginTitle': 'Σύνδεση',
  'auth.signupTitle': 'Εγγραφή',
  'auth.placeholder': 'Προσωρινή οθόνη — το Supabase Auth έρχεται στη Φάση 2.',
  'auth.loginMock': 'Σύνδεση (δοκιμαστική)',
  'auth.noAccount': 'Δεν έχεις λογαριασμό; Εγγράψου',
  'auth.createMock': 'Δημιουργία λογαριασμού (δοκιμαστική)',
  'auth.backToLogin': 'Πίσω στη σύνδεση',

  // Marketplace
  'marketplace.title': 'Αγορά',
  'marketplace.subtitle': 'Προϊόντα καθαρισμού στην πόρτα σου. Το πλήρες κατάστημα ανοίγει σε επόμενη φάση.',
  'marketplace.products': 'Οικολογικά είδη καθαρισμού',
  'marketplace.equipment': 'Επαγγελματικός εξοπλισμός',
  'marketplace.soon': 'Έρχεται σύντομα',
};

const en: Record<TranslationKey, string> = {
  'welcome.title': 'Welcome!',
  'welcome.subtitle': 'Enjoy a spotless home, easily booked with a few simple taps.',
  'welcome.bookNow': 'Book Now',
  'welcome.loginSignup': 'Login / Sign Up',

  'tab.home': 'Home',
  'tab.marketplace': 'Marketplace',
  'tab.account': 'Account',

  'home.tagline': 'Book cleaners on-demand',
  'home.searchCta': 'When should we come?',
  'home.categories': 'Categories',
  'home.featured': 'Featured',
  'home.viewAll': 'View All',
  'home.services': 'Services',
  'home.regularDeep': 'Regular & deep\nCleaning',
  'home.bookCleaning': 'Book Cleaning services',
  'home.crew': 'Cleaning Crew',
  'home.crewLink': 'Deep cleaning & events',
  'home.essentials': 'Cleaning essentials',
  'home.shopLink': 'Shop the marketplace',

  'nav.selectDay': 'Day & Time',
  'nav.selectService': 'Select a Service',
  'nav.summary': 'Summary',
  'nav.contact': 'Contact Details',
  'nav.payment': 'Payment',
  'nav.login': 'Login',
  'nav.signup': 'Sign Up',

  'calendar.title': 'Pick a day & time',
  'calendar.step': 'Step 1 of 3 — when should we come?',
  'calendar.slotsFor': 'Available times',
  'calendar.pickDayHint': 'Tap a day on the calendar to see available times.',

  'services.title': 'Choose a service',
  'services.step': 'Step 2 of 3 — what should we clean?',
  'services.myHome': 'My Home',
  'services.crew': 'Cleaning Crew',
  'service.Studio': 'Studio',
  'service.1 Bedroom': '1 Bedroom',
  'service.2 Bedroom': '2 Bedroom',
  'service.3 Bedroom': '3 Bedroom',
  'service.Deep Cleaning': 'Deep Cleaning',
  'service.Events': 'Events',

  'summary.title': 'Booking summary',
  'summary.subtitle': 'Review your cleaning before payment.',
  'summary.service': 'Service',
  'summary.option': 'Option',
  'summary.day': 'Day',
  'summary.time': 'Time',
  'summary.total': 'Total',
  'summary.continue': 'Continue',
  'summary.loginPrompt': 'Log in or create an account to confirm your booking.',
  'summary.loginToConfirm': 'Log in to confirm',

  'contact.title': 'Your details',
  'contact.step': 'Step 3 of 3 — fill in your details for the booking.',
  'contact.email': 'Email',
  'contact.emailPlaceholder': 'name@example.com',
  'contact.emailError': 'Enter a valid email',
  'contact.phone': 'Phone',
  'contact.phonePlaceholder': 'e.g. 99 123456',
  'contact.phoneError': 'Enter a valid phone number',
  'contact.address': 'Address',
  'contact.addressPlaceholder': 'Street, number, city',
  'contact.addressError': 'Enter your address',
  'contact.continue': 'Continue to payment',

  'payment.title': 'Payment',
  'payment.subtitle': 'Pay securely with your device wallet.',
  'payment.total': 'Total to pay',
  'payment.successTitle': 'Payment successful',
  'payment.successBody': 'Your cleaning is booked!',
  'payment.failedTitle': 'Payment failed',
  'payment.unavailableTitle': 'Payment unavailable',
  'payment.walletUnavailable':
    'Apple Pay / Google Pay is not available on this device. Wallet payments require a development build (not Expo Go).',

  'account.title': 'Account',
  'account.guestTitle': 'Your account',
  'account.guestSubtitle': 'Log in to see your bookings, orders and membership.',
  'account.welcomeBack': 'Welcome back',
  'account.membership': 'Membership Card',
  'account.perMonth': ' /month',
  'account.perks': 'Priority slots, member pricing and free product delivery.',
  'account.become': 'Become a member',
  'account.orders': 'Order history',
  'account.ordersSub': 'Bookings and marketplace orders',
  'account.ordersSoon': 'Order history arrives with Supabase in Phase 2.',
  'account.membershipSoon': 'Stripe subscription checkout arrives in Phase 3.',
  'account.signOut': 'Sign out',
  'account.language': 'Language',

  'auth.loginTitle': 'Login',
  'auth.signupTitle': 'Sign Up',
  'auth.placeholder': 'Placeholder — Supabase Auth arrives in Phase 2.',
  'auth.loginMock': 'Log in (mock)',
  'auth.noAccount': 'No account? Sign up',
  'auth.createMock': 'Create account (mock)',
  'auth.backToLogin': 'Back to login',

  'marketplace.title': 'Marketplace',
  'marketplace.subtitle':
    'Cleaning products delivered to your door. The full shop opens in a later phase.',
  'marketplace.products': 'Eco-friendly essentials',
  'marketplace.equipment': 'Professional equipment',
  'marketplace.soon': 'Coming soon',
};

export type TranslationKey = keyof typeof el;

export const translations: Record<Language, Record<TranslationKey, string>> = { el, en };
