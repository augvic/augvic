const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const archiver = require('archiver')
const rootDir = path.join(__dirname, '..')
const releaseDir = path.join(rootDir, 'release')
const unpackedDir = path.join(releaseDir, 'win-unpacked')
const distDir = path.join(rootDir, 'dist')
const releasesDir = path.join(rootDir, 'releases')
const TRANSIENT_LOCK_CODES = new Set(['EPERM', 'EBUSY', 'ENOTEMPTY'])
const EXTRAS = [
  {
    src: path.join(rootDir, ''),
    destName: '',
    requiredFile: '',
    hint: ''
  }
]

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

function copyExtrasIntoResources() {
  const resourcesDir = path.join(distDir, 'resources')
  for (const extra of EXTRAS) {
    const relSrc = path.relative(rootDir, extra.src)
    if (!fs.existsSync(extra.src) || (extra.requiredFile && !fs.existsSync(path.join(extra.src, extra.requiredFile)))) {
      const missing = extra.requiredFile ? path.join(relSrc, extra.requiredFile) : relSrc
      throw new Error(`${missing} não encontrado${extra.hint ? ` - ${extra.hint}` : '.'}`)
    }
    const stagedDir = path.join(resourcesDir, `_staging_${extra.destName}`)
    const finalDir = path.join(resourcesDir, extra.destName)
    withRetry(() => fs.rmSync(finalDir, { recursive: true, force: true }))
    withRetry(() => fs.rmSync(stagedDir, { recursive: true, force: true }))
    withRetry(() => fs.cpSync(extra.src, stagedDir, { recursive: true }))
    withRetry(() => fs.renameSync(stagedDir, finalDir))
  }
}

function currentVersionTag() {
  fs.mkdirSync(releasesDir, { recursive: true })
  const { version } = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
  return `v${version}`
}

function bumpPackageVersion() {
  execSync('npm --no-git-tag-version version patch', { cwd: rootDir, stdio: 'ignore' })
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
  copyExtrasIntoResources()
  const tag = currentVersionTag()
  const zipPath = await zipDistContents(tag)
  withRetry(() => fs.renameSync(zipPath, path.join(releasesDir, path.basename(zipPath))))
  bumpPackageVersion()
  console.log(`Release empacotado: releases/${path.basename(zipPath)}`)
}

main()
