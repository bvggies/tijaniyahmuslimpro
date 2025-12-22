# Tijaniyah Muslim Pro - Mobile App

A comprehensive Islamic mobile application built with Expo, React Native, and TypeScript. Features prayer times, Quran reading, Tijaniyah trackers, community features, and more.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x (recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator / physical device

### Installation

```bash
cd apps/mobile
npm install
```

### Environment Variables

Create a `.env` file in `apps/mobile/`:

```env
EXPO_PUBLIC_API_BASE_URL=https://tijaniyahmuslimpro-admin-mu.vercel.app
EXPO_PUBLIC_USE_MOCKS=false
```

**Environment Variables:**
- `EXPO_PUBLIC_API_BASE_URL`: Backend API base URL (defaults to production URL)
- `EXPO_PUBLIC_USE_MOCKS`: Set to `true` to use mock data instead of API calls (useful for development)

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📱 Features

### ✅ Implemented Features

1. **Authentication**
   - Welcome screen with Islamic design
   - Sign In / Sign Up
   - Guest mode (read-only access)
   - Secure token storage

2. **Prayer Module**
   - Prayer times with location-based calculation
   - Next prayer countdown
   - Qibla compass
   - Mosque locator
   - Prayer settings (calculation method, offsets)
   - Hijri date display

3. **Quran Module**
   - Surah list with search
   - Surah reader with Arabic text
   - Bookmarks
   - Last read tracking
   - Font size controls

4. **Duas Module**
   - Tijaniyah duas list
   - Categories
   - Arabic, transliteration, and translation

5. **Tasbih**
   - Digital counter
   - Session tracking
   - Presets (33, 99, 100, custom)

6. **Tijaniyah Trackers**
   - Wazifa tracker
   - Lazim tracker
   - Progress tracking
   - Streak tracking

7. **Journal**
   - Create/edit entries
   - PIN lock protection
   - Calendar view

8. **Community**
   - Feed with posts
   - Like and comment
   - Chat rooms
   - Messages

9. **AI Noor**
   - Islamic Q&A assistant
   - Groq AI integration
   - Disclaimer for educational use

10. **Donate**
    - Campaigns list
    - Donation history
    - Pledge recording (payment integration pending)

11. **Other Features**
    - Makkah Live stream
    - Scholars directory
    - Events / Zikr gatherings
    - Settings
    - Support tickets
    - All Features grid page

## 🎨 Design System

### Color Palette

- **Dark Teal**: `#061c1e` (950) to `#eaf9fb` (50)
- **Pine Blue**: `#edf7f6` (50) to `#2e6b65` (700)
- **Evergreen**: `#08f774` (500) - Accent color
- **White**: `#ffffff`

### Theme

- **Background**: Dark teal 950 (`#061c1e`) everywhere
- **Cards**: Dark teal 800 (`#105056`) / 700 (`#187881`)
- **Glass Overlay**: `rgba(255,255,255,0.06)`
- **Borders**: `rgba(255,255,255,0.12)`
- **Text**: White (headings), Pine blue 100 (body), Pine blue 300 (muted)

### Typography

- Headings: White, bold
- Body: Pine blue 100
- Muted: Pine blue 300
- Accents: Evergreen 500

## 🏗️ Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens (legacy)
│   ├── _layout.tsx        # Root navigation
│   ├── auth-stack.tsx     # Auth navigation
│   └── screens/           # Legacy screens
├── src/
│   ├── components/
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # React Query hooks
│   ├── navigation/         # Navigation stacks
│   ├── screens/            # Feature screens
│   ├── services/           # API client, auth, location, etc.
│   └── theme/              # Colors, spacing, typography
├── assets/                 # Images, fonts, etc.
└── package.json
```

## 🔌 API Integration

### Mock Mode

Set `EXPO_PUBLIC_USE_MOCKS=true` to use mock data. This is useful for:
- Development without backend
- Testing UI components
- Offline development

### API Client

Located in `src/services/apiClient.ts`:
- Automatic token injection
- Refresh token handling
- Error handling
- Mock data fallback

### Available Hooks

- `usePrayerTimes()` - Fetch prayer times
- `useNextPrayer()` - Get next prayer with countdown
- `useSurahs()` - Get surah list
- `useBookmarks()` - Quran bookmarks
- `useWazifas()` - Wazifa tracker
- `useLazims()` - Lazim tracker
- `useJournalEntries()` - Journal entries
- `usePosts()` - Community posts
- `useChatRooms()` - Chat rooms
- `useCampaigns()` - Donation campaigns
- And more...

## 🧭 Navigation

### Tab Navigation

- **Home**: Dashboard with quick actions
- **Prayer**: Prayer times, Qibla, Mosques
- **Quran**: Surah list, reader, bookmarks
- **Community**: Feed, chat
- **Profile**: Settings, journal, trackers

### Stack Navigation

Each tab has its own stack navigator:
- `HomeStack`
- `PrayerStack`
- `QuranStack`
- `CommunityStack`
- `ProfileStack`

### Feature Routes

All feature routes are centralized in `src/navigation/featureRoutes.ts` for easy navigation.

## 🔐 Authentication

### Guest Mode

- Read-only access to:
  - Prayer times
  - Quran reading
  - Duas
  - Qibla compass
  - Makkah Live
- Locked features (require sign-in):
  - Posting/chatting
  - Journal
  - Donations
  - Trackers

### Token Management

- Access tokens stored in `expo-secure-store`
- Automatic refresh on 401 errors
- Guest mode flag stored securely

## 📦 Building for Production

### EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure (first time)
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Environment Variables for Production

Set in EAS secrets or `.env.production`:
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_USE_MOCKS=false`

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `npx expo start -c`
2. **Type errors**: Run `npx tsc --noEmit` to check types
3. **Navigation errors**: Ensure all routes are registered in `_layout.tsx`
4. **API errors**: Check `EXPO_PUBLIC_API_BASE_URL` and network connectivity

### Debugging

- Enable React Query devtools (if configured)
- Check Expo logs: `npx expo start --dev-client`
- Use React Native Debugger for network inspection

## 📝 Development Notes

### Adding New Features

1. Create screen in `src/screens/[feature]/`
2. Add hook in `src/hooks/use[Feature].ts`
3. Register route in appropriate stack navigator
4. Add to `featureRoutes.ts` if needed
5. Update `_layout.tsx` if it's a root-level route

### Code Style

- TypeScript strict mode
- Functional components with hooks
- React Query for data fetching
- Consistent spacing/typography from theme
- Dark teal background everywhere

## 📄 License

Private - Tijaniyah Muslim Pro

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Built with ❤️ for the Tijaniyah community**

