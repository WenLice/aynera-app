# Aynera Mobile

React Native (Expo) app for the Aynera member experience.

## Stack

- Expo + TypeScript
- React Navigation (native stack + bottom tabs)
- Brand tokens in `src/theme/tokens.ts`

## Current shell (v0.1)

1. Splash
2. Welcome
3. Profile setup (basic fields)
4. Pending review
5. Meet tab (mock introductions)
6. Profile tab

No backend yet — flows are demo/navigation only.

## Backend

The app talks to the Aynera API (`Product/Backend API`). Configure the base URL per
build with `EXPO_PUBLIC_AYNERA_API_BASE_URL` (default `http://localhost:5057`); Expo
inlines it at build time, so set it before `expo start` / `expo export`.

Wired today: launch cities (`GET /early-access/cities/GetAll`), early-access signup
(`POST /early-access/register`), sign-in by one-time code or password
(`/auth/otp/request`, `/auth/otp/verify`, `/auth/password`, `/auth/refresh`), and session
bootstrap on Splash (`GET /members/me`, `GET /admissions/me`). Tokens are kept in
`expo-secure-store` on phones and `localStorage` on web.

## Run

```bash
cd apps/mobile
npm start
```

Then press `a` for Android emulator, or scan the QR with Expo Go on your phone.

## Next

- Real auth (phone OTP)
- API + admin approval states
- Chat
- Focus / Together
