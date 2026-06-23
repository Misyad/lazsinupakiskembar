# Mobile Optimization Guide - KOINNU Ranting System

## Overview

Mobile-first optimization untuk field workers (petugas lapangan) yang primarily menggunakan smartphone untuk input penarikan dan tracking kaleng.

## Implemented Mobile Features

### 1. Mobile Utilities (`lib/mobile/utils.ts`)

**Device Detection:**
```typescript
import { isMobile, isTouchDevice } from '@/lib/mobile/utils'

if (isMobile()) {
  // Show mobile-optimized UI
}

if (isTouchDevice()) {
  // Enable touch gestures
}
```

**Viewport Height Fix:**
Fixes mobile browser address bar issue:
```typescript
import { initMobileViewport } from '@/lib/mobile/utils'

// Initialize on app mount
useEffect(() => {
  const cleanup = initMobileViewport()
  return cleanup
}, [])
```

**Connection Detection:**
```typescript
import { isSlowConnection } from '@/lib/mobile/utils'

if (isSlowConnection()) {
  // Load lower quality images, reduce animations
}
```

### 2. Touch-Friendly CSS (`lib/mobile/styles.css`)

**Usage:**

```tsx
// Touch-friendly buttons (minimum 44px)
<button className="tap-target btn-mobile">
  Input Penarikan
</button>

// Large touch targets for primary actions
<button className="tap-target-lg btn-mobile-lg">
  Simpan
</button>

// Mobile-optimized inputs (prevents zoom on iOS)
<input className="input-mobile" type="text" />

// Mobile-friendly card spacing
<div className="card-mobile">
  Content
</div>
```

## Mobile Design Guidelines

### Touch Target Sizes
- **Minimum:** 44px × 44px (Apple/Android guideline)
- **Recommended:** 48px × 48px for primary actions
- **Large:** 56px × 56px for critical actions

### Font Sizes
- **Body text:** 16px minimum (prevents zoom on iOS)
- **Headings:** 24px+ for readability
- **Labels:** 14px minimum

### Spacing
- **Padding:** 16px minimum for touch areas
- **Margin:** 12px minimum between interactive elements
- **Safe area:** Account for notched devices

### Colors & Contrast
- **Contrast ratio:** 4.5:1 minimum for text
- **Touch feedback:** Visual indication on tap
- **Error states:** Clear, high-contrast indicators

## Performance Optimization

### Image Optimization
```typescript
import { getOptimalImageSize } from '@/lib/mobile/utils'

const imageSize = getOptimalImageSize()
const imageSrc = `/images/photo-${imageSize}.jpg`
```

### Lazy Loading
- Use Next.js Image component with lazy loading
- Defer non-critical resources
- Implement intersection observer for below-fold content

### Bundle Size
- Code splitting per route
- Dynamic imports for heavy components
- Tree shaking for unused code

### Network Optimization
- API response compression
- Cache-first strategy for static assets
- Offline support for critical features

## Responsive Breakpoints

```css
/* Mobile-first approach */
/* Base styles: Mobile (< 640px) */

@media (min-width: 640px) {
  /* Small tablet */
}

@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}
```

## Testing Checklist

### Device Testing
- [ ] iPhone (iOS Safari)
- [ ] Android phone (Chrome)
- [ ] Budget smartphone (< Rp 2 juta)
- [ ] Tablet (7-10 inch)

### Feature Testing
- [ ] Touch targets are minimum 44px
- [ ] Text is readable without zoom
- [ ] Forms work without horizontal scroll
- [ ] Images load appropriately
- [ ] Performance: Lighthouse mobile score > 85
- [ ] Network: Works on 3G connection

### User Flows (Mobile)
- [ ] Login via mobile
- [ ] Scan QR kaleng
- [ ] Input penarikan (amount, notes)
- [ ] View riwayat penarikan
- [ ] Navigate between sections

## Known Limitations

- QR scanner requires camera permissions
- Offline mode not yet implemented
- Push notifications not available
- PWA features not configured

## Future Enhancements

1. **Progressive Web App (PWA)**
   - Install to home screen
   - Offline functionality
   - Background sync

2. **Gestures**
   - Swipe to delete
   - Pull to refresh
   - Pinch to zoom (QR display)

3. **Camera Optimization**
   - QR scanner performance
   - Photo upload for documentation
   - Image compression

4. **Offline Support**
   - Cache critical data
   - Queue offline actions
   - Sync when online
