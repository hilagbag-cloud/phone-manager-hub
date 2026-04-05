import type { RepoAnalysis } from '@/types/apk-builder';

export function generateWorkflow(analysis: RepoAnalysis): string {
  const needsCapAdd = !analysis.hasAndroidFolder;
  const buildCmd = analysis.packageJsonContent?.scripts && typeof analysis.packageJsonContent.scripts === 'object' && 'build' in (analysis.packageJsonContent.scripts as any)
    ? 'npm run build'
    : 'echo "No build script found, using existing files"';

  return `name: Build APK
on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Install dependencies
        run: npm install

      - name: Build web app
        run: ${buildCmd}
${needsCapAdd ? `
      - name: Add Android platform
        run: npx cap add android
` : ''}
      - name: Sync Capacitor
        run: npx cap sync android

      - name: Build debug APK
        working-directory: android
        run: chmod +x gradlew && ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
`;
}
