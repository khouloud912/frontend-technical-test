import { copyFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const dbPath = path.join(__dirname, '..', 'src', 'server', 'db.json')
const backupPath = path.join(tmpdir(), `leboncoin-db-backup-${Date.now()}.json`)

/**
 * The tests send real messages through json-server, which writes them to db.json.
 * Back the file up before the run and restore it afterwards so the repo stays clean.
 * (Playwright runs the returned function as the global teardown.)
 */
export default function globalSetup() {
  copyFileSync(dbPath, backupPath)

  return () => {
    copyFileSync(backupPath, dbPath)
    unlinkSync(backupPath)
  }
}
