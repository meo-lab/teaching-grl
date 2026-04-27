import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const siteBase = '/grl/'
const rootDir = process.cwd()
const distDir = resolve(rootDir, 'dist')
const tempDir = resolve(rootDir, 'tmp-slidev-build')

const decks = [
  {
    entry: 'slides/0-course-information/slides.md',
    base: `${siteBase}0-course-information/`,
    out: resolve(tempDir, '0-course-information'),
    dest: resolve(distDir, '0-course-information'),
    pdf: resolve(distDir, '0-course-information', 'slides.pdf'),
  },
]

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0)
    process.exit(result.status ?? 1)
}

rmSync(distDir, { recursive: true, force: true })
rmSync(tempDir, { recursive: true, force: true })
mkdirSync(tempDir, { recursive: true })

run('npx', ['slidev', 'build', 'slides.md', '--base', siteBase, '--out', distDir])

for (const deck of decks) {
  run('npx', ['slidev', 'build', deck.entry, '--base', deck.base, '--out', deck.out])
  mkdirSync(dirname(deck.dest), { recursive: true })
  cpSync(deck.out, deck.dest, { recursive: true })
  run('npx', ['slidev', 'export', deck.entry, '--output', deck.pdf])
}

rmSync(tempDir, { recursive: true, force: true })
