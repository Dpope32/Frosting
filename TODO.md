# Kaiba TODO

## Immediate: web console + settings cleanup

- [ ] Fix wallpaper thumbnails/backgrounds missing on web.
  - Verify the current S3 object URLs actually return successfully from a fresh browser session.
  - Verify bucket/object access, object key casing, response headers, and browser behavior before assuming CORS.
  - Preserve the existing native behavior and caching.
  - Do not hide failures with empty catch blocks.
- [ ] Fix cross-device image URI handling.
  - Never sync or hydrate device-local `file://` / ImagePicker cache/document URIs onto another platform.
  - Add a safe compatibility path for already-synced stale local URIs so web does not attempt to render them.
  - Preserve existing user data; no destructive migration.
- [ ] Fix `LinearGradient` `colors` / `locations` length mismatches.
  - Known instance: `components/home/BackgroundSection.tsx`.
- [ ] Fix React Native `Animated` native-driver warnings on web.
  - Web animations must not request the native driver.
  - Do not make native animations slower just to silence web warnings.
- [ ] Fix PocketBase `registry_snapshots` PATCH 400.
  - Capture/log the PocketBase validation response body and field errors.
  - Verify payload against the live collection schema.
  - Do not swallow the sync failure or create retry loops.
- [ ] Stop Sentry 429 spam.
  - Audit event volume and duplicate captures.
  - Current config samples tracing/profiling aggressively; tune intentionally after confirming what is generating the flood.
  - Expected image-load failures should not create an event storm.
- [ ] Re-test Settings wallpaper picker on web and iOS after fixes.
- [ ] Finish with a clean browser console: no unexplained red errors, failed API calls, or repeated warnings.

## Release safety before touching production mobile

- [ ] Keep the console/sync cleanup separate from the Expo/React Native upgrade.
- [ ] Test an upgrade over an existing installed production/TestFlight build with real persisted data.
- [ ] Verify after update: onboarding state, preferences, profile image behavior, registry hydration, premium state, sync workspace/key, and all local persisted stores.
- [ ] Exercise cold launch, background/foreground, offline launch, sync push/pull, and second-device sync before production.
- [ ] Establish a known-good production tag/commit before release.
- [ ] Verify the production EAS Update channel with a staging/preview update before publishing production.
- [ ] Modernize `runtimeVersion` on the next native binary. It is currently pinned to `1.0.0`; move to a safer version policy only as part of a new binary, not an OTA-only change.
- [ ] Document the OTA rollback procedure and native-binary rollback procedure.
- [ ] Do not publish an OTA that adds/updates native modules unless the matching native binary already exists.

## iOS release

- [ ] Restore/modernize the old PowerShell release helper with explicit preflight gates and no automatic production publish.
- [ ] Run Expo Doctor, typecheck, tests, and web export before release.
- [ ] Build a production iOS binary with EAS.
- [ ] Test the exact binary in TestFlight on a real device before App Store release.
- [ ] Verify Sentry source maps and release tagging.
- [ ] Babysit first production launches and sync behavior before publishing any follow-up OTA.

## Android

- [ ] Bring Android back to first-class support.
- [ ] Validate the current Android native project against the app config.
- [ ] Replace/modernize `scripts/build-android.ps1` if needed; it is currently a local debug-device helper, not a Play Store release flow.
- [ ] Build a signed production AAB with EAS.
- [ ] Test on a physical Android device and Google Play internal testing.
- [ ] Review Android permissions and remove obsolete storage permissions where appropriate.
- [ ] Complete Play Store listing/release setup.

## Platform modernization

- [ ] Plan the Expo SDK 52 / React Native 0.76 modernization as its own project.
- [ ] Upgrade incrementally with a working build and regression pass at each step.
- [ ] Re-check Tamagui, Reanimated, Expo Router, Sentry, notifications, image picker, file system, contacts, calendar, and expo-updates compatibility at each SDK step.
- [ ] Do not combine the SDK migration with sync-engine changes or a production data migration.
