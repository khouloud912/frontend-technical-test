import { copyFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const dbPath = path.join(__dirname, '..', 'src', 'server', 'db.json')
const backupPath = path.join(tmpdir(), `leboncoin-db-backup-${Date.now()}.json`)

/** Tests write real messages to db.json: back it up, restore it after the run. */
export default function globalSetup() {
  copyFileSync(dbPath, backupPath)

  // The returned function is Playwright's global teardown
  return () => {
    copyFileSync(backupPath, dbPath)
    unlinkSync(backupPath)
  }
}
