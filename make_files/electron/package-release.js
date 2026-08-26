const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
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

function moveUnpackedToDist() {
  const tempDir = path.join(rootDir, 'win-unpacked')
  withRetry(() => fs.renameSync(unpackedDir, tempDir))
  withRetry(() => fs.rmSync(releaseDir, { recursive: true, force: true }))
  withRetry(() => fs.renameSync(tempDir, distDir))
}

function nextReleaseTag() {
  fs.mkdirSync(releasesDir, { recursive: true })
  const versions = fs
    .readdirSync(releasesDir)
    .map((name) => name.match(/^v(\d+)\.(\d+)\.(\d+)\.zip$/))
    .filter(Boolean)
    .map((match) => match.slice(1).map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  if (versions.length === 0) return 'v1.0.0'
  const [major, minor, patch] = versions[versions.length - 1]
  return `v${major}.${minor}.${patch + 1}`
}

function zipDistContents(tag) {
  const zipPath = path.join(rootDir, `${tag}.zip`)
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    output.on('close', () => resolve(zipPath))
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(distDir, false)
    archive.finalize()
  })
}

async function main() {
  moveUnpackedToDist()
  const tag = nextReleaseTag()
  const zipPath = await zipDistContents(tag)
  withRetry(() => fs.renameSync(zipPath, path.join(releasesDir, path.basename(zipPath))))
  console.log(`Release empacotado: releases/${path.basename(zipPath)}`)
}

main()
