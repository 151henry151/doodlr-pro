# EAS iOS Build (Doodlr)

## Prereqs
- Node 18+, npm
- Expo CLI & EAS CLI: `npm i -g expo-cli eas-cli` (or use npx)
- Expo account and Apple developer account

## Setup
```
cd frontend
npm install
npx eas login
npx eas init   # follow prompts; copies projectId to app.json (update extra.eas.projectId)
```

## Build
- Preview (internal):
```
npx eas build --platform ios --profile preview
```
- Production:
```
npx eas build --platform ios --profile production
```

## Assets
- Replace `assets/icon.png` with a 1024×1024 non-transparent icon
- Replace `assets/splash-icon.png` with splash artwork (large square, centered)

## Compliance
- Anonymous use; no sign-in required
- UGC visible; includes in-app report action and web admin dashboard:
  - Reports endpoint: `POST /report?level=..&x=..&y=..&reason=..`
  - Admin dashboard: `https://hromp.com/doodlr/admin/`
    - GET `/admin/reports` list reports
    - POST `/admin/clear` clear canvas
- Legal: Privacy, Terms, Conduct at `https://hromp.com/doodlr/`
- ATS: Use HTTPS in production; no NSAllowsArbitraryLoads in release

## Store Listing
- Description (example):
  - Doodlr is a collaborative, zoomable pixel canvas. Draw together in real-time, zoom across 6 levels, and create pixel art with friends.
- Keywords: pixel art, drawing, collaborative, canvas, doodle, retro
- Support URL: `https://hromp.com/doodlr/support.html` 