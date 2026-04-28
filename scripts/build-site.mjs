import { copyFileSync, cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const siteBase = process.env.SITE_BASE ?? '/teaching/grl/'
const rootDir = process.cwd()
const distDir = resolve(rootDir, 'dist')
const tempDir = resolve(rootDir, 'tmp-slidev-build')

const decks = [
  {
    entry: 'slides/1-why-geospatial-representation-learning/slides.md',
    slug: '1-why-geospatial-representation-learning',
  },
  {
    entry: 'slides/2-geospatial-data-images-maps-time-series/slides.md',
    slug: '2-geospatial-data-images-maps-time-series',
  },
  {
    entry: 'slides/3-deep-learning-for-geospatial-prediction/slides.md',
    slug: '3-deep-learning-for-geospatial-prediction',
  },
  {
    entry: 'slides/4-self-supervised-learning-and-foundation-models/slides.md',
    slug: '4-self-supervised-learning-and-foundation-models',
  },
  {
    entry: 'slides/5-earth-embeddings-and-location-encoders/slides.md',
    slug: '5-earth-embeddings-and-location-encoders',
  },
  {
    entry: 'slides/6-spatiotemporal-representations-and-neural-fields/slides.md',
    slug: '6-spatiotemporal-representations-and-neural-fields',
  },
  {
    entry: 'slides/7-geospatial-retrieval-reasoning-and-agents/slides.md',
    slug: '7-geospatial-retrieval-reasoning-and-agents',
  },
].map(deck => ({
  ...deck,
  base: `${siteBase}${deck.slug}/`,
  out: resolve(tempDir, deck.slug),
  dest: resolve(distDir, deck.slug),
  pdf: resolve(distDir, deck.slug, 'slides.pdf'),
  staticRoutes: ['presenter', 'overview'],
}))

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
writeFileSync(resolve(distDir, '.nojekyll'), '')

for (const deck of decks) {
  run('npx', ['slidev', 'build', deck.entry, '--base', deck.base, '--out', deck.out])
  mkdirSync(dirname(deck.dest), { recursive: true })
  cpSync(deck.out, deck.dest, { recursive: true })
  for (const route of deck.staticRoutes ?? []) {
    const routeDir = resolve(deck.dest, route)
    mkdirSync(routeDir, { recursive: true })
    copyFileSync(resolve(deck.dest, 'index.html'), resolve(routeDir, 'index.html'))
  }
  run('npx', ['slidev', 'export', deck.entry, '--output', deck.pdf])
}

rmSync(tempDir, { recursive: true, force: true })
