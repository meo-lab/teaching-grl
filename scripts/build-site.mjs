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
    entry: 'slides/3-machine-learning-on-data-representations/slides.md',
    slug: '3-machine-learning-on-data-representations',
  },
  {
    entry: 'slides/4-deep-representation-learning-i/slides.md',
    slug: '4-deep-representation-learning-i',
  },
  {
    entry: 'slides/5-deep-representation-learning-ii/slides.md',
    slug: '5-deep-representation-learning-ii',
  },
  {
    entry: 'slides/6-location-encoders-and-spatial-embeddings/slides.md',
    slug: '6-location-encoders-and-spatial-embeddings',
  },
  {
    entry: 'slides/7-self-supervised-deep-learning/slides.md',
    slug: '7-self-supervised-deep-learning',
  },
  {
    entry: 'slides/8-geospatial-embeddings/slides.md',
    slug: '8-geospatial-embeddings',
  },
  {
    entry: 'slides/9-synthesis-choosing-the-right-representation/slides.md',
    slug: '9-synthesis-choosing-the-right-representation',
  },
  {
    entry: 'slides/labs/lab-1/slides.md',
    slug: 'labs/lab-1',
  },
  {
    entry: 'slides/labs/lab-2/slides.md',
    slug: 'labs/lab-2',
  },
  {
    entry: 'slides/labs/lab-3/slides.md',
    slug: 'labs/lab-3',
  },
  {
    entry: 'slides/labs/lab-4/slides.md',
    slug: 'labs/lab-4',
  },
  {
    entry: 'slides/labs/lab-5/slides.md',
    slug: 'labs/lab-5',
  },
  {
    entry: 'slides/labs/lab-6/slides.md',
    slug: 'labs/lab-6',
  },
  {
    entry: 'slides/labs/lab-7/slides.md',
    slug: 'labs/lab-7',
  },
  {
    entry: 'slides/labs/lab-8/slides.md',
    slug: 'labs/lab-8',
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
  run('npx', [
    'slidev',
    'export',
    deck.entry,
    '--output',
    deck.pdf,
    '--wait-until',
    'load',
    '--wait',
    '1000',
    '--timeout',
    '120000',
  ])
}

rmSync(tempDir, { recursive: true, force: true })
