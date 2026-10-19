<template>
  <div
    class="tsne-demo"
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
    @wheel.stop
  >
    <div class="tsne-demo__controls">
      <button type="button" @click="startTsne">Run t-SNE projection</button>
      <button type="button" @click="reset">Reset</button>
      <label>
        <input v-model="showTrajectories" type="checkbox" />
        Show trajectories
      </label>
    </div>
    <div ref="canvasHost" class="tsne-demo__canvas" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const canvasHost = ref(null)
const showTrajectories = ref(true)

let sketchInstance
let demoApi = {
  startTSNE: () => {},
  resetDemo: () => {},
  setShowTrajectories: () => {},
}

function startTsne() {
  demoApi.startTSNE()
}

function reset() {
  demoApi.resetDemo()
}

watch(showTrajectories, value => {
  demoApi.setShowTrajectories(value)
})

onMounted(async () => {
  const { default: p5 } = await import('p5')

  sketchInstance = new p5((p) => {
    let points = []
    let labels = []

    let originalPoints = []
    let displayPoints = []

    let Y = []
    let P = []

    let tsneRunning = false
    let tsneProgress = 0
    let tsneIter = 0

    let planeCenter
    let planeRight
    let planeUp

    const nPerClass = 120
    const nTotal = nPerClass * 2
    let font

    let camRadius
    let camAzimuth
    let camElevation

    let initialEye
    let initialCenter
    let initialUp

    let firstFrame = true

    let tsneAxisFade = 0

    let showTrajectoriesValue = true
    let trajectories = []

    p.preload = () => {
      font = p.loadFont(
        'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf'
      )
    }

    p.setup = () => {
      p.createCanvas(600, 400, p.WEBGL)
      camRadius = 1000

      camAzimuth = p.radians(50)
      camElevation = p.radians(-10)

      initialCenter = p.createVector(0, 0, 0)
      initialEye = sphericalToCartesian(camRadius, camAzimuth, camElevation)
      initialUp = p.createVector(0, 1, 0)

      p.textFont(font)

      generateData()

      originalPoints = points.map(point => point.copy())
      displayPoints = points.map(point => point.copy())
    }

    p.draw = () => {
      p.background(255)

      if (firstFrame) {
        p.camera(
          initialEye.x,
          initialEye.y,
          initialEye.z,
          initialCenter.x,
          initialCenter.y,
          initialCenter.z,
          initialUp.x,
          initialUp.y,
          initialUp.z
        )

        firstFrame = false
      }

      p.orbitControl(1, 1, 0.1)

      drawAxes()

      if (tsneRunning && tsneProgress >= 1) {
        tsneAxisFade = p.constrain(tsneAxisFade + 6, 0, 255)
        drawTSNEAxes(tsneAxisFade)
      }

      if (tsneRunning) {
        runTSNESteps(2)
        updateDisplayPoints()
      }

      if (showTrajectoriesValue && tsneRunning) {
        drawTrajectories()
      }

      drawPoints()
    }

    demoApi = {
      startTSNE,
      resetDemo,
      setShowTrajectories: value => {
        showTrajectoriesValue = value
      },
    }

    function drawTrajectories() {
      p.strokeWeight(0.6)
      p.noFill()

      for (let i = 0; i < nTotal; i++) {
        if (labels[i] === 0) {
          p.stroke(40, 150, 95, 55)
        } else {
          p.stroke(230, 135, 45, 55)
        }

        p.beginShape()

        for (const point of trajectories[i]) {
          p.vertex(point.x, point.y, point.z)
        }

        p.endShape()
      }
    }

    function sphericalToCartesian(r, azimuth, elevation) {
      const x = r * p.cos(elevation) * p.cos(azimuth)
      const y = r * p.sin(elevation)
      const z = r * p.cos(elevation) * p.sin(azimuth)

      return p.createVector(x, y, z)
    }

    function generateData() {
      p.randomSeed(4)

      const dir = unitVec(p.createVector(1.6, 0.4, 1.2))
      const side1 = unitVec(p.createVector(-0.5, 1.3, 0.2))
      const side2 = unitVec(dir.copy().cross(side1))

      const c1 = p5.Vector.mult(dir, -95)
      const c2 = p5.Vector.mult(dir, 95)

      for (let i = 0; i < nPerClass; i++) {
        points.push(sampleBlob(c1, dir, side1, side2))
        labels.push(0)
      }

      for (let i = 0; i < nPerClass; i++) {
        points.push(sampleBlob(c2, dir, side1, side2))
        labels.push(1)
      }
    }

    function sampleBlob(c, a, b, d) {
      const u = p.randomGaussian() * 85
      const v = p.randomGaussian() * 32
      const w = p.randomGaussian() * 26

      return p.createVector(
        c.x + a.x * u + b.x * v + d.x * w,
        c.y + a.y * u + b.y * v + d.y * w,
        c.z + a.z * u + b.z * v + d.z * w
      )
    }

    function startTSNE() {
      tsneRunning = true
      tsneProgress = 0
      tsneIter = 0
      tsneAxisFade = 0

      trajectories = []

      for (let i = 0; i < nTotal; i++) {
        trajectories[i] = []
      }

      originalPoints = points.map(point => point.copy())
      displayPoints = originalPoints.map(point => point.copy())

      captureCurrentCameraPlane()
      initializeEmbedding()
      computeHighDimProbabilities()
    }

    function resetDemo() {
      tsneRunning = false
      tsneProgress = 0
      tsneIter = 0
      tsneAxisFade = 0

      displayPoints = originalPoints.map(point => point.copy())
      firstFrame = true
    }

    function captureCurrentCameraPlane() {
      const cam = p._renderer._curCamera

      const eye = p.createVector(cam.eyeX, cam.eyeY, cam.eyeZ)
      const target = p.createVector(cam.centerX, cam.centerY, cam.centerZ)
      const up = p.createVector(cam.upX, cam.upY, cam.upZ)

      const viewDir = unitVec(p5.Vector.sub(target, eye))

      planeRight = unitVec(viewDir.copy().cross(up))
      planeUp = unitVec(planeRight.copy().cross(viewDir))

      if (planeUp.y > 0) {
        planeUp.mult(-1)
      }

      planeCenter = p.createVector(0, 0, 0)
    }

    function initializeEmbedding() {
      Y = []

      for (let i = 0; i < nTotal; i++) {
        const point = originalPoints[i]

        const x = point.dot(planeRight) / 140
        const y = point.dot(planeUp) / 140

        Y.push({
          x: x + p.randomGaussian() * 0.01,
          y: y + p.randomGaussian() * 0.01,
          vx: 0,
          vy: 0,
        })
      }

      recenterEmbedding()
    }

    function computeHighDimProbabilities() {
      P = []

      const k = 18

      for (let i = 0; i < nTotal; i++) {
        P[i] = new Array(nTotal).fill(0)

        const distances = []

        for (let j = 0; j < nTotal; j++) {
          if (i === j) continue

          distances.push({
            index: j,
            d2: squaredDistance3D(originalPoints[i], originalPoints[j]),
          })
        }

        distances.sort((a, b) => a.d2 - b.d2)

        const sigma2 = distances[k].d2

        for (let a = 0; a < k; a++) {
          const j = distances[a].index
          const d2 = distances[a].d2

          P[i][j] = p.exp(-d2 / (2 * sigma2))
        }
      }

      for (let i = 0; i < nTotal; i++) {
        for (let j = i + 1; j < nTotal; j++) {
          const probability = p.max(P[i][j], P[j][i])
          P[i][j] = probability
          P[j][i] = probability
        }
      }
    }

    function runTSNESteps(numSteps) {
      for (let step = 0; step < numSteps; step++) {
        tsneStep()
        tsneIter++
      }

      tsneProgress = p.constrain(tsneProgress + 0.006, 0, 1)
    }

    function tsneStep() {
      const learningRate = 0.02
      const neighborStrength = 0.35
      const repulsionStrength = 0.002
      const damping = 0.88
      const maxSpeed = 0.015

      for (let i = 0; i < nTotal; i++) {
        let fx = 0
        let fy = 0

        for (let j = 0; j < nTotal; j++) {
          if (i === j) continue

          const dx = Y[j].x - Y[i].x
          const dy = Y[j].y - Y[i].y

          const d2 = dx * dx + dy * dy + 0.001
          const d = p.sqrt(d2)

          if (P[i][j] > 0) {
            const targetDist = 0.12
            const attract = neighborStrength * P[i][j] * (d - targetDist)

            fx += attract * dx / d
            fy += attract * dy / d
          }

          const repel = repulsionStrength / d2

          fx -= repel * dx / d
          fy -= repel * dy / d
        }

        Y[i].vx = damping * Y[i].vx + learningRate * fx
        Y[i].vy = damping * Y[i].vy + learningRate * fy

        Y[i].vx = p.constrain(Y[i].vx, -maxSpeed, maxSpeed)
        Y[i].vy = p.constrain(Y[i].vy, -maxSpeed, maxSpeed)
      }

      for (let i = 0; i < nTotal; i++) {
        Y[i].x += Y[i].vx
        Y[i].y += Y[i].vy
      }

      recenterEmbedding()
      rescaleEmbedding()
    }

    function recenterEmbedding() {
      let mx = 0
      let my = 0

      for (let i = 0; i < nTotal; i++) {
        mx += Y[i].x
        my += Y[i].y
      }

      mx /= nTotal
      my /= nTotal

      for (let i = 0; i < nTotal; i++) {
        Y[i].x -= mx
        Y[i].y -= my
      }
    }

    function rescaleEmbedding() {
      const maxRadius = 20

      for (let i = 0; i < nTotal; i++) {
        const r = p.sqrt(Y[i].x * Y[i].x + Y[i].y * Y[i].y)

        if (r > maxRadius) {
          const scale = maxRadius / r

          Y[i].x *= scale
          Y[i].y *= scale

          Y[i].vx *= 0.3
          Y[i].vy *= 0.3
        }
      }
    }

    function updateDisplayPoints() {
      const scale = 120

      let t = tsneProgress
      t = t * t * (3 - 2 * t)

      for (let i = 0; i < nTotal; i++) {
        const projected = p5.Vector.add(
          planeCenter,
          p5.Vector.add(
            p5.Vector.mult(planeRight.copy(), Y[i].x * scale),
            p5.Vector.mult(planeUp.copy(), Y[i].y * scale)
          )
        )

        displayPoints[i] = p5.Vector.lerp(originalPoints[i], projected, t)

        if (tsneRunning && tsneProgress < 1 && tsneIter % 20 === 0) {
          trajectories[i].push(displayPoints[i].copy())
        }
      }
    }

    function drawAxes() {
      const axisLen = 180
      const alpha = tsneRunning ? 45 : 255

      p.stroke(0, alpha)
      p.fill(0, alpha)

      p.strokeWeight(2)

      drawArrow3D(p.createVector(-axisLen, 0, 0), p.createVector(axisLen, 0, 0), 'x', alpha)
      drawArrow3D(p.createVector(0, axisLen, 0), p.createVector(0, -axisLen, 0), 'y', alpha)
      drawArrow3D(p.createVector(0, 0, -axisLen), p.createVector(0, 0, axisLen), 'z', alpha)
    }

    function drawArrow3D(start, end, label, alpha = 255) {
      p.stroke(0, alpha)

      p.line(start.x, start.y, start.z, end.x, end.y, end.z)

      const dir = p5.Vector.sub(end, start).normalize()
      const tip = end.copy()

      p.push()

      p.translate(tip.x, tip.y, tip.z)

      if (p.abs(dir.y) < 0.99) {
        const axis = p.createVector(0, 1, 0).cross(dir).normalize()
        const angle = p.acos(p.createVector(0, 1, 0).dot(dir))

        p.rotate(angle, axis)
      }

      p.noStroke()
      p.fill(0, alpha)

      p.cone(7, 18)

      p.pop()

      const labelPos = p5.Vector.add(end, p5.Vector.mult(dir.copy(), 32))

      drawBillboardText(label, labelPos, alpha)
    }

    function drawBillboardText(txt, pos, alpha = 255) {
      const cam = p._renderer._curCamera

      p.push()

      p.translate(pos.x, pos.y, pos.z)

      const eye = p.createVector(cam.eyeX, cam.eyeY, cam.eyeZ)
      const toCam = p5.Vector.sub(eye, pos).normalize()

      const yaw = p.atan2(toCam.x, toCam.z)
      const pitch = p.asin(-toCam.y)

      p.rotateY(yaw)
      p.rotateX(pitch)

      p.textAlign(p.CENTER, p.CENTER)

      p.noStroke()
      p.fill(0, alpha)

      p.textSize(22)
      p.text(txt, 0, 0)

      p.pop()
    }

    function drawTSNEAxes(alpha = 255) {
      if (!planeCenter || !planeRight || !planeUp) return

      const len = 190

      p.stroke(0, alpha)
      p.fill(0, alpha)
      p.strokeWeight(3)

      const xStart = p5.Vector.add(planeCenter, p5.Vector.mult(planeRight.copy(), -len))
      const xEnd = p5.Vector.add(planeCenter, p5.Vector.mult(planeRight.copy(), len))

      const yStart = p5.Vector.add(planeCenter, p5.Vector.mult(planeUp.copy(), -len))
      const yEnd = p5.Vector.add(planeCenter, p5.Vector.mult(planeUp.copy(), len))

      drawArrow3D(xStart, xEnd, 't-SNE 1', alpha)
      drawArrow3D(yStart, yEnd, 't-SNE 2', alpha)
    }

    function drawPoints() {
      if (tsneRunning) {
        p.noStroke()

        for (let i = 0; i < nTotal; i++) {
          const point = originalPoints[i]

          if (labels[i] === 0) {
            p.fill(40, 150, 95, 45)
          } else {
            p.fill(230, 135, 45, 45)
          }

          p.push()
          p.translate(point.x, point.y, point.z)
          p.sphere(4, 8, 8)
          p.pop()
        }
      }

      p.noStroke()

      for (let i = 0; i < nTotal; i++) {
        const point = displayPoints[i]

        if (labels[i] === 0) {
          p.fill(40, 150, 95, 215)
        } else {
          p.fill(230, 135, 45, 215)
        }

        p.push()
        p.translate(point.x, point.y, point.z)
        p.sphere(5, 8, 8)
        p.pop()
      }
    }

    function squaredDistance3D(a, b) {
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dz = a.z - b.z

      return dx * dx + dy * dy + dz * dz
    }

    function unitVec(v) {
      const m = p.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)

      return p.createVector(v.x / m, v.y / m, v.z / m)
    }
  }, canvasHost.value)
})

onBeforeUnmount(() => {
  sketchInstance?.remove()
  sketchInstance = undefined
})
</script>

<style scoped>
.tsne-demo {
  width: 360px;
  height: 360px;
  overflow: hidden;
  border-radius: 0.75rem;
  background: white;
}

.tsne-demo__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 4px 6px;
  font-size: 11px;
  line-height: 1;
}

.tsne-demo__controls button {
  border: 1px solid #d4d7dc;
  border-radius: 6px;
  background: #f8fafc;
  color: #1f2937;
  padding: 5px 7px;
  font: inherit;
  cursor: pointer;
}

.tsne-demo__controls button:hover {
  background: #eef2f7;
}

.tsne-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1f2937;
  white-space: nowrap;
}

.tsne-demo__canvas {
  width: 600px;
  height: 400px;
  transform: scale(0.6);
  transform-origin: top left;
}
</style>
