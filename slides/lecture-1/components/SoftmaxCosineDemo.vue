<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const container = ref(null);
let sketch = null;
let cleanupSketchEvents = null;

onMounted(async () => {
  const { default: p5 } = await import("p5");

  if (!container.value) return;

  sketch = new p5((p) => {
    let pts;
    let dragging = null;
    let cleanupCanvasEvents = null;

    p.setup = () => {
      const canvas = p.createCanvas(900, 420);
      canvas.parent(container.value);
      p.textFont("Arial");

      pts = {
        A: p.createVector(140, 210),
        B: p.createVector(250, 110),
        C: p.createVector(210, 250),
        D: p.createVector(90, 330),
      };

      setupCanvasEvents(canvas.elt);
    };

    p.draw = () => {
      p.clear();

      drawSoftmaxBox();
      drawEmbeddingSpace();
      drawProbabilities();
    };

    function drawEmbeddingSpace() {
      const ox = 170;
      const oy = 197;

      p.push();
      p.translate(ox, oy);

      p.stroke(220);
      p.strokeWeight(1);

      p.line(-120, 0, 120, 0);
      p.line(0, -120, 0, 120);

      p.fill(50);
      p.noStroke();

      p.textAlign(p.LEFT);

      p.textSize(18);
      p.textStyle(p.BOLD);

      p.text("Cosine similarity to A", -115, -145);

      p.textStyle(p.NORMAL);
      p.textSize(12);

      p.text("angle between vectors from origin", -115, -125);

      const A = p5.Vector.sub(pts.A, p.createVector(ox, oy));

      for (const name of ["B", "C", "D"]) {
        const P = p5.Vector.sub(pts[name], p.createVector(ox, oy));

        const c = cosine(A, P);
        const angleDeg = angleBetweenDegrees(A, P);

        p.stroke(120, 120, 120, 90);
        p.strokeWeight(1.5);

        p.line(0, 0, P.x, P.y);

        drawAngleArc(A, P, 38 + 8 * ["B", "C", "D"].indexOf(name));

        p.fill(50);
        p.noStroke();

        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(12);

        p.text(`${name}: cos(${angleDeg.toFixed(0)}°) = ${c.toFixed(2)}`, P.x + 35, P.y);
      }

      p.stroke(30);
      p.strokeWeight(3);

      p.line(0, 0, A.x, A.y);

      p.pop();

      for (const name of ["A", "B", "C", "D"]) {
        drawPoint(name, pts[name], name === "A");
      }
    }

    function drawPoint(name, point, highlighted) {
      p.stroke(40);
      p.strokeWeight(highlighted ? 4 : 2);

      p.fill(highlighted ? p.color(255, 220, 120) : 235);

      p.circle(point.x, point.y, highlighted ? 22 : 18);

      p.noStroke();
      p.fill(20);

      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(13);

      p.text(name, point.x, point.y);

      p.textStyle(p.NORMAL);
    }

    function drawAngleArc(v1, v2, radius) {
      if (v1.mag() < 1e-6 || v2.mag() < 1e-6) return;

      const a1 = p.atan2(v1.y, v1.x);
      const a2 = p.atan2(v2.y, v2.x);

      let diff = a2 - a1;

      while (diff < 0) diff += p.TWO_PI;
      while (diff >= p.TWO_PI) diff -= p.TWO_PI;

      p.noFill();
      p.stroke(60, 60, 60, 120);
      p.strokeWeight(1.5);

      p.arc(0, 0, radius * 2, radius * 2, a1, a1 + diff);
    }

    function drawSoftmaxBox() {
      const x = 340;
      const y = 80;
      const w = 220;
      const h = 200;

      p.fill(255);
      p.stroke(210);

      p.rect(x, y, w, h, 16);

      p.noStroke();
      p.fill(30);

      p.textAlign(p.CENTER);

      p.textSize(18);
      p.textStyle(p.BOLD);

      p.text("softmax", x + w / 2, y + 32);

      p.textStyle(p.NORMAL);
      p.textSize(12);

      p.text("exp(cosᵢ)", x + w / 2 + 12, y + 105 - 40);
      p.text("pᵢ = ─────────────────────", x + w / 2, y + 122 - 40);
      p.text("exp(cosᴮ) + exp(cosᶜ) + exp(cosᴰ)", x + w / 2 + 12, y + 140 - 40);

      p.textSize(10);
      p.fill(90);
      p.text("for i ∈ {B, C, D}", x + w / 2, y + 120);

      const ox = x + 55;
      const oy = y + 150;

      const A = p5.Vector.sub(pts.A, p.createVector(170, 210));

      const cosB = cosine(A, p5.Vector.sub(pts.B, p.createVector(170, 210)));
      const cosC = cosine(A, p5.Vector.sub(pts.C, p.createVector(170, 210)));
      const cosD = cosine(A, p5.Vector.sub(pts.D, p.createVector(170, 210)));

      const probs = softmax([cosB, cosC, cosD]);

      p.fill(40);
      p.textAlign(p.LEFT);
      p.textSize(10);

      p.text(`pᴮ = exp(${cosB.toFixed(2)}) / Σ = ${probs[0].toFixed(2)}`, ox, oy);
      p.text(`pᶜ = exp(${cosC.toFixed(2)}) / Σ = ${probs[1].toFixed(2)}`, ox, oy + 16);
      p.text(`pᴰ = exp(${cosD.toFixed(2)}) / Σ = ${probs[2].toFixed(2)}`, ox, oy + 32);
    }

    function drawProbabilities() {
      const ox = 580;
      const oy = 90;

      const A = p5.Vector.sub(pts.A, p.createVector(170, 210));

      const names = ["B", "C", "D"];

      const scores = names.map((n) => {
        const P = p5.Vector.sub(pts[n], p.createVector(170, 210));
        return cosine(A, P);
      });

      const probs = softmax(scores);

      p.fill(50);
      p.noStroke();

      p.textAlign(p.LEFT);

      p.textSize(18);
      p.textStyle(p.BOLD);

      p.text("Probabilities given A", ox, oy - 35);

      p.textStyle(p.NORMAL);
      p.textSize(12);

      p.text("softmax over cosine scores", ox, oy - 15);

      for (let i = 0; i < names.length; i++) {
        const y = oy + i * 80;
        const barW = probs[i] * 220;

        p.fill(40);
        p.textSize(16);

        p.text(names[i], ox, y + 18);

        p.fill(230);
        p.noStroke();

        p.rect(ox + 35, y, 220, 28, 8);

        p.fill(90);

        p.rect(ox + 35, y, barW, 28, 8);

        p.fill(40);

        p.textAlign(p.LEFT, p.CENTER);

        p.text(`${(probs[i] * 100).toFixed(1)}%`, ox + 270, y + 14);
      }

      p.fill(90);

      p.textSize(12);
      p.textAlign(p.LEFT);

      p.text("Drag A, B, C, or D. Probabilities are computed relative to A.", ox - 48, 320);
    }

    function cosine(v1, v2) {
      const denom = v1.mag() * v2.mag();

      if (denom < 1e-6) return 0;

      return v1.dot(v2) / denom;
    }

    function angleBetweenDegrees(v1, v2) {
      if (v1.mag() < 1e-6 || v2.mag() < 1e-6) return 0;

      const a1 = p.atan2(v1.y, v1.x);
      const a2 = p.atan2(v2.y, v2.x);

      let diff = a2 - a1;

      while (diff < 0) diff += p.TWO_PI;
      while (diff >= p.TWO_PI) diff -= p.TWO_PI;

      return p.degrees(diff);
    }

    function softmax(scores) {
      const m = p.max(scores);
      const exps = scores.map((s) => p.exp(s - m));
      const sumExps = exps.reduce((a, b) => a + b, 0);

      return exps.map((e) => e / sumExps);
    }

    function pointerPosition(event) {
      const canvas = p.canvas;
      const rect = canvas.getBoundingClientRect();
      const source = event?.touches?.[0] ?? event?.changedTouches?.[0] ?? event;

      if (!source || rect.width === 0 || rect.height === 0) {
        return { x: p.mouseX, y: p.mouseY };
      }

      return {
        x: (source.clientX - rect.left) * (p.width / rect.width),
        y: (source.clientY - rect.top) * (p.height / rect.height),
      };
    }

    function startDrag(pos) {
      for (const name of ["A", "B", "C", "D"]) {
        if (p.dist(pos.x, pos.y, pts[name].x, pts[name].y) < 20) {
          dragging = name;
        }
      }
    }

    function dragTo(pos) {
      if (dragging) {
        pts[dragging].x = p.constrain(pos.x, 55, 320);
        pts[dragging].y = p.constrain(pos.y, 70, 350);
      }
    }

    function stopSlidevPointerHandling(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function setupCanvasEvents(canvas) {
      const onPointerDown = (event) => {
        stopSlidevPointerHandling(event);
        canvas.setPointerCapture?.(event.pointerId);
        startDrag(pointerPosition(event));
      };

      const onPointerMove = (event) => {
        if (!dragging) return;

        stopSlidevPointerHandling(event);
        dragTo(pointerPosition(event));
      };

      const onPointerUp = (event) => {
        stopSlidevPointerHandling(event);
        canvas.releasePointerCapture?.(event.pointerId);
        dragging = null;
      };

      const onPointerCancel = () => {
        dragging = null;
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerCancel);
      canvas.addEventListener("lostpointercapture", onPointerCancel);

      cleanupCanvasEvents = () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerCancel);
        canvas.removeEventListener("lostpointercapture", onPointerCancel);
      };
      cleanupSketchEvents = cleanupCanvasEvents;
    }

    p.mousePressed = (event) => {
      startDrag(pointerPosition(event));
      return false;
    };

    p.mouseDragged = (event) => {
      dragTo(pointerPosition(event));
      return false;
    };

    p.mouseReleased = () => {
      dragging = null;
      return false;
    };

    p.touchStarted = (event) => p.mousePressed(event);

    p.touchMoved = (event) => p.mouseDragged(event);

    p.touchEnded = () => {
      dragging = null;
      return false;
    };

  }, container.value);
});

onBeforeUnmount(() => {
  cleanupSketchEvents?.();
  cleanupSketchEvents = null;

  if (sketch) {
    sketch.remove();
    sketch = null;
  }
});
</script>

<template>
  <div
    ref="container"
    class="softmax-cosine-demo"
    @click.stop
    @dblclick.stop
    @mousedown.stop
    @mousemove.stop
    @mouseup.stop
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
    @touchstart.stop.prevent
    @touchmove.stop.prevent
    @touchend.stop.prevent
  ></div>
</template>

<style scoped>
.softmax-cosine-demo {
  display: flex;
  justify-content: center;
  width: 100%;
  pointer-events: auto;
  touch-action: none;
  user-select: none;
}

.softmax-cosine-demo :deep(canvas) {
  display: block;
  max-width: 100%;
  height: auto !important;
  pointer-events: auto;
  touch-action: none;
}
</style>
