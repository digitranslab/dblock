# DBlock Branding Update

## Overview
Update the application branding from "Kozmoai" to "DBlock", including logo assets and UI text references across authentication pages and the app header.

## User Stories

### US-1: New DBlock Logo Asset
**As a** user  
**I want** to see the new DBlock logo throughout the application  
**So that** the branding is consistent with the DBlock identity

**Acceptance Criteria:**
- [ ] DBlockLogo.svg file exists in `src/frontend/src/assets/`
- [ ] Logo displays a yellow chat bubble with "doo" eyes design
- [ ] Logo is properly sized and scalable as an SVG

### US-2: Login Page Branding
**As a** user  
**I want** to see the DBlock logo and branding on the login page  
**So that** I know I'm signing into the correct application

**Acceptance Criteria:**
- [ ] Login page displays DBlockLogo instead of KozmoaiLogo
- [ ] Page title reads "Sign in to DBlock"
- [ ] Logo renders correctly with proper sizing (h-10 w-10 scale-[1.5])

### US-3: Sign Up Page Branding
**As a** user  
**I want** to see the DBlock logo and branding on the sign up page  
**So that** I know I'm creating an account for the correct application

**Acceptance Criteria:**
- [ ] Sign up page displays DBlockLogo instead of KozmoaiLogo
- [ ] Page title reads "Sign up for DBlock"
- [ ] Logo renders correctly with proper sizing (h-10 w-10 scale-[1.5])

### US-4: App Header Branding
**As a** user  
**I want** to see the DBlock logo in the application header  
**So that** the branding is consistent throughout the app

**Acceptance Criteria:**
- [ ] App header component displays DBlockLogo
- [ ] Logo is properly positioned in the navbar

### US-5: Feature Flag Control
**As a** developer  
**I want** the new logo to be controlled by a feature flag  
**So that** we can easily toggle between old and new branding if needed

**Acceptance Criteria:**
- [ ] `ENABLE_NEW_LOGO` feature flag exists in feature-flags.ts
- [ ] When flag is `true`, DBlockLogo is displayed
- [ ] When flag is `false`, fallback emoji (⛓️) is displayed

## Technical Notes

### Files Modified
- `src/frontend/src/assets/DBlockLogo.svg` - New logo asset
- `src/frontend/src/pages/SignUpPage/index.tsx` - Updated imports and branding text
- `src/frontend/src/pages/LoginPage/index.tsx` - Updated imports and branding text
- `src/frontend/src/components/core/appHeaderComponent/index.tsx` - Updated logo import
- `src/frontend/src/customization/feature-flags.ts` - ENABLE_NEW_LOGO set to true

### Implementation Status
✅ **COMPLETED** - All user stories have been implemented and verified.
