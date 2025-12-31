# Phase 2: Profile & Auth System

## Overview
Phase 2 adds a simple authentication system with user profiles, online user tracking, and social features. This is **feature-flagged** and disabled by default.

## Features Implemented

### 1. Simple Auth System
- Profile creation/edit screen
- Guest mode (skip profile creation)
- Profile data stored in localStorage (client-side)
- Unique user ID generation

### 2. User Profiles
Each profile includes:
- **Profile Name**: Display name (max 30 chars)
- **Profile Photo**: Image upload (stored as base64)
- **Age Range**: Under 20, 21-29, 30-39, 40-49, 50-59, 60+
- **Orientation**: Str8, Bi, Gay, Other
- **About Me Tags**: Multiple selection from:
  - Dom, Sub, Switch, Twink, Otter, Bear, Daddy, Boy, Zaddy
  - Leather, BDSM, Kinky, Sensual, Tantric, Hypnotist
  - Gooner, Gainer, Sissy, Butch, Jock, Himbo, Guy Next Door
  - Geek, Gaymer, DL, Voyeur, Exhibitionist, Bator
  - Single, Open Relationship, Taken
- **Profile Links**:
  - X (Twitter)
  - Bluesky
  - Bateworld
  - Discord
  - Telegram
  - Fetlife
  - Reddit

### 3. Online Users Sidebar
- Shows all currently online users
- Click to view profile
- Filters out blocked users
- Toggle button to show/hide sidebar

### 4. Profile View Modal
- Displays full profile information
- Actions:
  - **Direct Message**: Opens DM (placeholder - not implemented)
  - **Add Friend**: Add/remove friend status
  - **Block**: Block/unblock user

### 5. Friend & Block System
- Friends list stored in localStorage
- Blocked users list stored in localStorage
- Server-side tracking (in-memory, not persistent)

## File Structure

### New Files
- `profile-system.js`: All profile/auth logic
- `PHASE2_PROFILES.md`: This documentation

### Modified Files
- `index.html`: Added profile screens, modals, sidebar
- `script.js`: Added feature flag, profile state, socket integration
- `server.js`: Added profile/online user tracking, socket handlers
- `styles.css`: Added Phase 2 styling

## How to Enable

### Step 1: Enable Feature Flag
In `script.js`, change:
```javascript
const FEATURES = {
  PHASE2_PROFILES: false, // Change to true
};
```

### Step 2: Test Locally
1. Open the app
2. You should see the auth screen (if no profile exists)
3. Create a profile or continue as guest
4. In room/lobby screens, you'll see "👥 Online Users" and "✏️ Edit Profile" buttons

### Step 3: Deploy (When Ready)
- Feature is disabled by default, so it won't affect production
- When ready, enable the flag and deploy

## Current Limitations

1. **No Persistent Storage**: Profiles, friends, and blocks are stored in:
   - Client: localStorage (clears if user clears browser data)
   - Server: In-memory (lost on restart)

2. **No Real Authentication**: No password/login system - just profile creation

3. **Photo Storage**: Photos stored as base64 in localStorage (not scalable)

4. **DM System**: Placeholder only - not implemented

5. **No Database**: All data is ephemeral

## Future Enhancements (Not Implemented)

- Database integration (Supabase/PostgreSQL)
- Real authentication (email/password, OAuth)
- Photo upload to cloud storage
- Direct messaging system
- Friend requests/notifications
- Profile search/discovery
- Activity history
- Privacy settings

## Server-Side Handlers

The server now handles:
- `profileUpdate`: Receives profile updates from clients
- `friendUpdate`: Friend add/remove actions
- `blockUpdate`: Block/unblock actions
- `requestOnlineUsers`: Request current online users list
- `onlineUsersUpdate`: Broadcasts online users to all clients

## Testing Checklist

- [ ] Enable feature flag
- [ ] Create a profile with all fields
- [ ] Upload a profile photo
- [ ] Skip profile creation (guest mode)
- [ ] View online users sidebar
- [ ] Click on online user to view profile
- [ ] Add/remove friend
- [ ] Block/unblock user
- [ ] Edit profile
- [ ] Verify profile persists after page refresh
- [ ] Test with multiple browser windows (multiple users)

## Notes

- Feature is **completely disabled** when `FEATURES.PHASE2_PROFILES = false`
- All Phase 2 UI elements are hidden when disabled
- No performance impact when disabled
- Can be safely deployed with feature disabled
