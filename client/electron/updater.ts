import { app } from 'electron'

/**
 * Auto-update stub.
 * In the future, integrate electron-updater here to check for new versions
 * from a GitHub releases feed or custom update server.
 */
export function checkForUpdates() {
  const currentVersion = app.getVersion()
  console.log(`[Updater] QuizForge v${currentVersion} — update check stub`)
  // TODO: Implement auto-update with electron-updater
  // autoUpdater.checkForUpdatesAndNotify()
}
