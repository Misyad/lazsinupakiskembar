/**
 * Mobile UI Utilities
 * 
 * Helper classes and utilities for mobile-optimized UI
 * Touch-friendly controls, responsive design, performance
 */

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Get optimal image size for current viewport
 */
export function getOptimalImageSize(): 'small' | 'medium' | 'large' {
  if (typeof window === 'undefined') return 'medium'
  
  const width = window.innerWidth
  if (width < 640) return 'small'
  if (width < 1024) return 'medium'
  return 'large'
}

/**
 * Mobile-friendly tap target size check
 * Minimum 44px recommended by Apple & Android guidelines
 */
export function isValidTapTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const minSize = 44
  return rect.width >= minSize && rect.height >= minSize
}

/**
 * Optimize scroll performance with passive listeners
 */
export function addPassiveScrollListener(
  element: HTMLElement | Window,
  handler: EventListener
): () => void {
  element.addEventListener('scroll', handler, { passive: true })
  return () => element.removeEventListener('scroll', handler)
}

/**
 * Prevent zoom on double tap (for specific elements)
 */
export function preventDoubleTapZoom(element: HTMLElement): () => void {
  let lastTap = 0
  
  const handler = (e: TouchEvent) => {
    const currentTime = Date.now()
    const tapLength = currentTime - lastTap
    
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault()
    }
    
    lastTap = currentTime
  }
  
  element.addEventListener('touchend', handler, { passive: false })
  return () => element.removeEventListener('touchend', handler)
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 }
  
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
  }
}

/**
 * Detect slow network connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) return false
  
  const connection = (navigator as any).connection
  if (!connection) return false
  
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData === true
  )
}

/**
 * Viewport height fix for mobile browsers (address bar issue)
 */
export function setMobileViewportHeight(): void {
  if (typeof window === 'undefined') return
  
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

/**
 * Initialize mobile viewport height listener
 */
export function initMobileViewport(): () => void {
  if (typeof window === 'undefined') return () => {}
  
  setMobileViewportHeight()
  
  const handler = () => setMobileViewportHeight()
  window.addEventListener('resize', handler)
  window.addEventListener('orientationchange', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
    window.removeEventListener('orientationchange', handler)
  }
}
