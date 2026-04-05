

## Plan: Fix build error and create a working GitHub Actions workflow for APK download

### Problem
1. **Build error** in `src/capacitor/bridge.ts` line 285: `type: 'folder'` should be `type: 'directory'` (the `FileEntry` type only allows `'file' | 'directory'`).
2. **GitHub Actions workflow** is broken -- it's missing the web build step, Java setup, Android platform setup, and the APK artifact upload.

### Changes

**1. Fix TypeScript error in `src/capacitor/bridge.ts`**
- Line 285: change `type: 'folder'` to `type: 'directory'`
- Also fix lines 286-287: `size` → `size` and `modified` → `modifiedAt` to match the `FileEntry` interface (which uses `modifiedAt`, not `modified`). Also add `id` field.

**2. Rewrite `.github/workflows/android-build.yml`**
A complete workflow that:
- Checks out code
- Sets up Node.js 22 and Java 21
- Installs npm dependencies
- Builds the web app (`npm run build`)
- Adds Android platform (`npx cap add android`)
- Syncs Capacitor (`npx cap sync`)
- Builds the debug APK (`cd android && ./gradlew assembleDebug`)
- Uploads the APK as a downloadable artifact

After pushing to GitHub, you'll be able to download the APK from the **Actions** tab → click the latest workflow run → scroll to **Artifacts** → download `android-debug-apk`.

### Technical details

The workflow will use `actions/upload-artifact@v4` to make the APK available for download at `android/app/build/outputs/apk/debug/app-debug.apk`.

Also need to scan `bridge.ts` for other mismatches with the `FileEntry` interface (`id`, `modifiedAt` fields) since the bridge uses different property names than the type definition.

