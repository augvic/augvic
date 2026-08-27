const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const rootDir = path.join(__dirname, '..')
const releaseDir = path.join(rootDir, 'release')
const unpackedDir = path.join(releaseDir, 'win-unpacked')
const distDir = path.join(rootDir, 'dist')
const releasesDir = path.join(rootDir, 'releases')
const TRANSIENT_LOCK_CODES = new Set(['EPERM', 'EBUSY', 'ENOTEMPTY'])

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function withRetry(fn, { attempts = 150, delayMs = 2000 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return fn()
    } catch (err) {
      if (!TRANSIENT_LOCK_CODES.has(err.code) || attempt === attempts) throw err
      if (attempt % 10 === 0) console.log(`Aguardando lock liberar (tentativa ${attempt}/${attempts})...`)
      sleepSync(delayMs)
    }
  }
}

function currentVersion() {
  const { version } = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
  return version
}

function bumpPackageVersion() {
  execSync('npm --no-git-tag-version version patch', { cwd: rootDir, stdio: 'ignore' })
}

function moveUnpackedToDist() {
  const tempDir = path.join(rootDir, 'win-unpacked')
  withRetry(() => fs.renameSync(unpackedDir, tempDir))
  withRetry(() => fs.renameSync(tempDir, distDir))
}

function moveInstallerToReleases(version) {
  const installerName = `v${version}.exe`
  const installerPath = path.join(releaseDir, installerName)
  if (!fs.existsSync(installerPath)) {
    throw new Error(`${path.relative(rootDir, installerPath)} não encontrado - o build (npm run dist) rodou?`)
  }
  withRetry(() => fs.mkdirSync(releasesDir, { recursive: true }))
  const destPath = path.join(releasesDir, installerName)
  withRetry(() => fs.rmSync(destPath, { force: true }))
  withRetry(() => fs.renameSync(installerPath, destPath))
  return installerName
}

function main() {
  const version = currentVersion()
  moveUnpackedToDist()
  const installerName = moveInstallerToReleases(version)
  withRetry(() => fs.rmSync(releaseDir, { recursive: true, force: true }))
  bumpPackageVersion()
  console.log(`Release empacotado: releases/${installerName} (portable em dist/)`)
}

main()
