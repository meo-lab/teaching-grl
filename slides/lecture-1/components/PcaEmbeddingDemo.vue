<template>
  <div
    class="pca-demo"
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
    @wheel.stop
  >
    <div class="pca-demo__controls">
      <button type="button" @click="startRotation">Rotate to PCA projection</button>
      <button type="button" @click="reset">Reset</button>
      <label>
        <input v-model="showProjections" type="checkbox" />
        Show projections
      </label>
    </div>
    <div ref="canvasHost" class="pca-demo__canvas" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const canvasHost = ref(null)
const showProjections = ref(true)

let sketchInstance
let demoApi = {
  startPcaRotation: () => {},
  resetDemo: () => {},
  setShowTrajectories: () => {},
}

function startRotation() {
  demoApi.startPcaRotation()
}

function reset() {
  demoApi.resetDemo()
}

watch(showProjections, value => {
  demoApi.setShowTrajectories(value)
})

onMounted(async () => {
  const { default: p5 } = await import('p5')

  sketchInstance = new p5((p) => {
    let points = []
    let labels = []
    let pcs = []
    let eigenvalues = []

    let mean
    let center

    let animating = false
    let animT = 0

    let startEye
    let startUp
    let targetEye
    let targetUp

    let camDistance = 700

    let font

    let camRadius
    let camAzimuth
    let camElevation

    let initialEye
    let initialCenter
    let initialUp

    let firstFrame = true

    let pcaAxisFade = 0
    let pcaProjectionReached = false

    const nPerClass = 120

    let originalPoints = []
    let projectedPoints = []
    let displayPoints = []

    let projectionProgress = 0
    let projectingToPlane = false

    let showTrajectories = true

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
      computePCA()

      center = mean.copy()

      originalPoints = points.map(point => point.copy())
      displayPoints = points.map(point => point.copy())
      projectedPoints = computeProjectedPointsOnPCPlane()
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

      if (animating) {
        animateCamera()
      } else {
        p.orbitControl(1, 1, 0.1)
      }

      drawAxes()

      if (projectingToPlane) {
        updateProjectedPoints()
      }

      if (showTrajectories && pcaProjectionReached) {
        drawProjectionTrajectories()
      }

      drawPoints()

      if (pcaProjectionReached) {
        pcaAxisFade = p.constrain(pcaAxisFade + 6, 0, 255)
        drawPCAProjectionAxes(pcaAxisFade)
      }
    }

    demoApi = {
      startPcaRotation,
      resetDemo,
      setShowTrajectories: value => {
        showTrajectories = value
      },
    }

    function updateProjectedPoints() {
      projectionProgress = p.constrain(projectionProgress + 0.012, 0, 1)

      let t = projectionProgress
      t = t * t * (3 - 2 * t)

      for (let i = 0; i < points.length; i++) {
        displayPoints[i] = p5.Vector.lerp(originalPoints[i], projectedPoints[i], t)
      }

      if (projectionProgress >= 1) {
        projectingToPlane = false
      }
    }

    function computeProjectedPointsOnPCPlane() {
      const result = []

      for (const point of points) {
        const centered = p5.Vector.sub(point, center)
        const pc1Coord = centered.dot(pcs[0])
        const pc2Coord = centered.dot(pcs[1])

        const projected = p5.Vector.add(
          center,
          p5.Vector.add(
            p5.Vector.mult(pcs[0].copy(), pc1Coord),
            p5.Vector.mult(pcs[1].copy(), pc2Coord)
          )
        )

        result.push(projected)
      }

      return result
    }

    function resetDemo() {
      animating = false
      animT = 0

      pcaProjectionReached = false
      pcaAxisFade = 0

      projectingToPlane = false
      projectionProgress = 0

      displayPoints = originalPoints.map(point => point.copy())

      firstFrame = true
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

    function computePCA() {
      mean = p.createVector(0, 0, 0)

      for (const point of points) {
        mean.add(point)
      }

      mean.div(points.length)

      const C = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]

      for (const point of points) {
        const x = point.x - mean.x
        const y = point.y - mean.y
        const z = point.z - mean.z

        C[0][0] += x * x
        C[0][1] += x * y
        C[0][2] += x * z

        C[1][0] += y * x
        C[1][1] += y * y
        C[1][2] += y * z

        C[2][0] += z * x
        C[2][1] += z * y
        C[2][2] += z * z
      }

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          C[i][j] /= points.length - 1
        }
      }

      const eig = jacobiEigen3(C).sort((a, b) => b.value - a.value)

      pcs = eig.map(eigen =>
        unitVec(p.createVector(eigen.vector[0], eigen.vector[1], eigen.vector[2]))
      )

      eigenvalues = eig.map(eigen => eigen.value)
    }

    function jacobiEigen3(A) {
      const V = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]

      for (let iter = 0; iter < 60; iter++) {
        let pivot = 0
        let q = 1
        let maxVal = p.abs(A[0][1])

        if (p.abs(A[0][2]) > maxVal) {
          pivot = 0
          q = 2
          maxVal = p.abs(A[0][2])
        }

        if (p.abs(A[1][2]) > maxVal) {
          pivot = 1
          q = 2
          maxVal = p.abs(A[1][2])
        }

        if (maxVal < 1e-10) break

        const theta = 0.5 * p.atan2(2 * A[pivot][q], A[q][q] - A[pivot][pivot])
        const c = p.cos(theta)
        const s = p.sin(theta)

        const App =
          c * c * A[pivot][pivot] -
          2 * s * c * A[pivot][q] +
          s * s * A[q][q]

        const Aqq =
          s * s * A[pivot][pivot] +
          2 * s * c * A[pivot][q] +
          c * c * A[q][q]

        A[pivot][pivot] = App
        A[q][q] = Aqq

        A[pivot][q] = 0
        A[q][pivot] = 0

        for (let r = 0; r < 3; r++) {
          if (r !== pivot && r !== q) {
            const Arp = c * A[r][pivot] - s * A[r][q]
            const Arq = s * A[r][pivot] + c * A[r][q]

            A[r][pivot] = Arp
            A[pivot][r] = Arp

            A[r][q] = Arq
            A[q][r] = Arq
          }
        }

        for (let r = 0; r < 3; r++) {
          const Vrp = c * V[r][pivot] - s * V[r][q]
          const Vrq = s * V[r][pivot] + c * V[r][q]

          V[r][pivot] = Vrp
          V[r][q] = Vrq
        }
      }

      return [0, 1, 2].map(i => ({
        value: A[i][i],
        vector: [V[0][i], V[1][i], V[2][i]],
      }))
    }

    function drawAxes() {
      const axisLen = 180
      const alpha = pcaProjectionReached ? 45 : 255

      p.strokeWeight(2)

      drawArrow3D(p.createVector(-axisLen, 0, 0), p.createVector(axisLen, 0, 0), 'x', alpha)
      drawArrow3D(p.createVector(0, axisLen, 0), p.createVector(0, -axisLen, 0), 'y', alpha)
      drawArrow3D(p.createVector(0, 0, -axisLen), p.createVector(0, 0, axisLen), 'z', alpha)
    }

    function drawPCAProjectionAxes(alpha = 255) {
      const len1 = p.sqrt(eigenvalues[0]) * 1.8
      const len2 = p.sqrt(eigenvalues[1]) * 1.8

      p.strokeWeight(3)

      const pc1Start = p5.Vector.add(center, p5.Vector.mult(pcs[0].copy(), -len1))
      const pc1End = p5.Vector.add(center, p5.Vector.mult(pcs[0].copy(), len1))

      const pc2Start = p5.Vector.add(center, p5.Vector.mult(pcs[1].copy(), -len2))
      const pc2End = p5.Vector.add(center, p5.Vector.mult(pcs[1].copy(), len2))

      drawArrow3D(pc1Start, pc1End, 'PC1', alpha)
      drawArrow3D(pc2Start, pc2End, 'PC2', alpha)
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

      const screenUp = p.createVector(cam.upX, cam.upY, cam.upZ).normalize()
      const roll = p.atan2(screenUp.x, screenUp.y)

      p.rotateZ(-roll)

      if (screenUp.y < 0) {
        p.rotateZ(p.PI)
      }

      p.textAlign(p.CENTER, p.CENTER)

      p.noStroke()
      p.fill(0, alpha)

      p.textSize(22)
      p.text(txt, 0, 0)

      p.pop()
    }

    function drawPoints() {
      p.noStroke()

      if (pcaProjectionReached) {
        for (let i = 0; i < originalPoints.length; i++) {
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

      for (let i = 0; i < displayPoints.length; i++) {
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

    function drawProjectionTrajectories() {
      p.strokeWeight(0.6)

      for (let i = 0; i < points.length; i++) {
        if (labels[i] === 0) {
          p.stroke(40, 150, 95, 55)
        } else {
          p.stroke(230, 135, 45, 55)
        }

        p.line(
          originalPoints[i].x,
          originalPoints[i].y,
          originalPoints[i].z,
          projectedPoints[i].x,
          projectedPoints[i].y,
          projectedPoints[i].z
        )
      }
    }

    function animateCamera() {
      animT += 0.01

      let t = p.constrain(animT, 0, 1)
      t = t * t * (3 - 2 * t)

      const eye = p5.Vector.lerp(startEye, targetEye, t)
      const up = p5.Vector.lerp(startUp, targetUp, t).normalize()

      p.camera(eye.x, eye.y, eye.z, center.x, center.y, center.z, up.x, up.y, up.z)

      if (animT >= 1) {
        animating = false
        pcaProjectionReached = true
        projectingToPlane = true
        projectionProgress = 0
      }
    }

    function startPcaRotation() {
      const cam = p._renderer._curCamera

      if (!cam) return

      animating = true
      animT = 0

      pcaProjectionReached = false
      pcaAxisFade = 0

      startEye = p.createVector(cam.eyeX, cam.eyeY, cam.eyeZ)
      startUp = p.createVector(cam.upX, cam.upY, cam.upZ)

      camDistance = p.dist(cam.eyeX, cam.eyeY, cam.eyeZ, center.x, center.y, center.z)

      const viewDir = pcs[2].copy()
      const currentViewDir = p5.Vector.sub(center, startEye).normalize()

      if (viewDir.dot(currentViewDir) < 0) {
        viewDir.mult(-1)
      }

      targetEye = p5.Vector.add(center, p5.Vector.mult(viewDir, -camDistance))

      targetUp = pcs[1].copy()

      const currentUp = startUp.copy().normalize()

      if (targetUp.dot(currentUp) < 0) {
        targetUp.mult(-1)
      }
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
.pca-demo {
  width: 360px;
  height: 360px;
  overflow: hidden;
  border-radius: 0.75rem;
  background: white;
}

.pca-demo__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 4px 6px;
  font-size: 11px;
  line-height: 1;
}

.pca-demo__controls button {
  border: 1px solid #d4d7dc;
  border-radius: 6px;
  background: #f8fafc;
  color: #1f2937;
  padding: 5px 7px;
  font: inherit;
  cursor: pointer;
}

.pca-demo__controls button:hover {
  background: #eef2f7;
}

.pca-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1f2937;
  white-space: nowrap;
}

.pca-demo__canvas {
  width: 600px;
  height: 400px;
  transform: scale(0.6);
  transform-origin: top left;
}
</style>
