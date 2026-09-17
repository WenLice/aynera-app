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
