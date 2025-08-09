# Onboarding Completion Check — Option A

This project implements a simple, minimal onboarding gate that runs once per login per tab using sessionStorage. It reads the `onboarding_complete` flag from Supabase (`users.onboarding_complete`) and redirects authenticated users who haven’t completed onboarding to `/welcome` exactly once per session per tab.

## What’s implemented

- __Per-tab cache__: Uses `sessionStorage` to cache onboarding status, so each tab gates once per login.
- __Non-blocking UI__: Pages render, and the redirect occurs after the check; no global loading screen.
- __Exempt routes__: `/welcome`, `/onboarding`, `/login`, `/checkout-success`, `/cancel`, `/subscription-required` are never redirected.
- **Store flag**: New `onboardingChecked` flag in `useUserStore` indicates the status has been resolved for the current tab/session.

## Storage key

- Key: `onboardingChecked:{userId}`
- Values: `'true'` or `'false'` (string).

## Flow

1. __App boot__ (`AppRouter` calls `useUserStore.boot()`):
   - Get session from Supabase.
   - If authenticated:
     - Check `sessionStorage` for `onboardingChecked:{userId}`.
     - If missing, fetch `users.onboarding_complete` from Supabase, store in cache, and set `onboardingChecked=true`.
   - If not authenticated: set `onboardingChecked=true` (nothing to gate).

2. __Auth changes__ (Supabase `onAuthStateChange`):
   - `SIGNED_IN`: read from cache or fetch once; set `onboardingChecked=true`.
   - `SIGNED_OUT`: reset `onboardingChecked=false` and `onboardingComplete=false`.

3. __Login path__ (`useUserStore.login`) also fetches status and seeds cache for immediate UX.

4. __Onboarding completion__ (`updateOnboardingStatus(true)` from `PremiumWelcomeFlow`):
   - Writes `true` to Supabase and updates `sessionStorage` + store flags (`onboardingComplete=true`, `onboardingChecked=true`).

5. __Redirect hook__ (`useOnboardingRedirect`):
   - Waits for `isAuthenticated && onboardingChecked`.
   - If not on an exempt route and `onboardingComplete === false`, redirects once to `/welcome` for that tab.

## Files touched

- `src/lib/stores/useUserStore.ts` — added `onboardingChecked`, sessionStorage cache logic on boot/sign-in/login/update, and logout resets.
- `src/hooks/useOnboardingRedirect.ts` — waits for `onboardingChecked`, added exempt routes, redirects once per tab.

## Testing

- __Fresh login__: Log in on a new tab. You should be redirected to `/welcome` once if `onboarding_complete=false`.
- __Page refresh__: Refresh after login; no additional redirect should occur (once per tab behavior).
- __Complete onboarding__: Finish the flow; you should not be redirected again.
- __Logout/Login__: After logout and re-login, gating should occur once again.
- __Multi-tab__: Open a second tab after login; it will gate once independently.

## Dev notes / edge cases

- Token refresh does not re-run the gate; it’s scoped to login/sign-in or boot.
- If `sessionStorage` is unavailable, store falls back to a safe default and marks `onboardingChecked=true` to avoid blocking.
- To force re-check in the same tab for debugging, clear `sessionStorage` key `onboardingChecked:{userId}` via DevTools.

## Exempt routes

- `/welcome`, `/onboarding`, `/login`, `/checkout-success`, `/cancel`, `/subscription-required`.

## Future options

- Switch to `localStorage` to share the cache across tabs.
- Add time-based TTL to re-check after N hours.