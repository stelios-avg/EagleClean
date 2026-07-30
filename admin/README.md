# EagleClean Admin Panel

Web admin for booking management and customer support. Uses the same Supabase project as the mobile app.

## Run locally

```bash
# from repo root
npm run admin
```

Open [http://localhost:3000](http://localhost:3000).

## First admin user

1. Create an account (email + password) via the mobile app **or** the admin login page signup is not enabled — sign up in the mobile app first.
2. In the Supabase SQL Editor, promote that user:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_EMAIL_HERE';
```

3. Log in at `/login` with that email and password.

Only users with `profiles.role = 'admin'` can see bookings and accept/reject them.
