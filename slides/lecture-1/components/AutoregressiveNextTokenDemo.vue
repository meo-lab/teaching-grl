<script setup>
import p5 from "p5";
import { onBeforeUnmount, onMounted, ref } from "vue";

const container = ref(null);
let sketch = null;
let cleanupCanvasEvents = null;

onMounted(() => {
  if (!container.value) return;

  sketch = new p5((p) => {
    const initialTokens = ["I", "ate"];
    const futureTokens = ["an", "Apple,", "it", "was", "tasty"];

    let step = 0;
    let phase = 0;
    let animProgress = 0;
    let buttons = [];
    let lastCanvasPointerPress = 0;

    const phaseNames = [
      "1. add mask token",
      "2. estimate probabilities",
      "3. predict mask",
      "4. append to sequence",
    ];

    p.setup = () => {
      const canvas = p.createCanvas(630, 300);
      canvas.parent(container.value);
      p.textFont("Arial");
      setupCanvasEvents(canvas.elt);
    };

    p.draw = () => {
      p.background(255);

      drawTitle();
      drawContextSequence();
      drawPredictionBox();
      drawControls();

      if (animProgress < 1) {
        animProgress += 0.035;
      }
    };

    function drawTitle() {
      p.fill(40);
      p.noStroke();

      p.textAlign(p.LEFT);

      p.textSize(28);
      p.textStyle(p.BOLD);
    }

    function drawContextSequence() {
      const panelX = 60;
      const panelW = 880;

      const x0 = panelX + 10;
      const y0 = 20;

      const maxX = panelX + panelW - 24;
      const lineHeight = 56;

      p.fill(40);

      p.textSize(18);
      p.textStyle(p.BOLD);

      let x = x0;
      let y = y0;

      const visibleTokens = [...initialTokens, ...futureTokens.slice(0, step)];

      for (const tok of visibleTokens) {
        const w = tokenWidth(tok);

        if (x + w > maxX) {
          x = x0;
          y += lineHeight;
        }

        drawToken(tok, x, y, p.color(230));

        x += w + 12;
      }

      if (step < futureTokens.length) {
        const nextTok = futureTokens[step];
        const w = tokenWidth(nextTok);

        if (x + w > maxX) {
          x = x0;
          y += lineHeight;
        }

        if (phase <= 2) {
          drawToken("<msk>", x, y, p.color(240));
        }

        if (phase === 3) {
          const startX = panelX + panelW / 2;
          const startY = 340;

          const xx = p.lerp(startX, x, easeOut(animProgress));
          const yy = p.lerp(startY, y, easeOut(animProgress));

          drawToken(nextTok, xx, yy, p.color(255, 220, 120));
        }
      }
    }

    function drawPredictionBox() {
      const x = 60;
      const y = 80;

      const w = 550;
      const h = 170;

      p.fill(255);
      p.stroke(220);

      p.rect(x, y, w, h, 18);

      const contextString = [...initialTokens, ...futureTokens.slice(0, step)].join(" ");

      p.noStroke();

      p.fill(40);

      p.textAlign(p.LEFT);

      p.textSize(20);
      p.textStyle(p.BOLD);

      p.text(`Language Model p(<msk> | ${contextString})`, x + 24, y + 32);

      p.textStyle(p.NORMAL);
      p.textSize(13);

      p.fill(90);

      p.text("softmax over candidate next tokens", x + 24, y + 54);

      const stepX = x + 24;
      const stepY = y + 78;

      for (let i = 0; i < phaseNames.length; i++) {
        p.fill(80);

        p.textAlign(p.LEFT);

        p.textSize(11);
        p.textStyle(i === phase ? p.BOLD : p.NORMAL);

        p.text(phaseNames[i], stepX, stepY + i * 16);
      }

      const candidates = getCandidates();

      const bx = x + 300;
      const by = y + 60;

      if (phase >= 1) {
        for (let i = 0; i < candidates.length; i++) {
          const c = candidates[i];

          const yy = by + i * 22;

          p.fill(40);

          p.textStyle(c.selected ? p.BOLD : p.NORMAL);
          p.textSize(13);

          p.text(c.token, bx, yy + 10);

          p.fill(230);
          p.noStroke();

          p.rect(bx + 80, yy, 120, 14, 5);

          p.fill(c.selected ? p.color(255, 220, 120) : p.color(120));

          p.rect(bx + 80, yy, 120 * c.p, 14, 5);

          p.fill(40);

          p.textAlign(p.LEFT, p.CENTER);

          p.text(`${(c.p * 100).toFixed(0)}%`, bx + 210, yy + 7);

          p.textAlign(p.LEFT);
        }
      }

      if (phase >= 2 && step < futureTokens.length) {
        p.fill(40);

        p.textSize(18);
        p.textStyle(p.BOLD);

        p.text(`Prediction: "${futureTokens[step]}"`, x + 24, y + 152);
      }
    }

    function drawControls() {
      buttons = [];

      const x = 60;
      const y = 260;

      const bw = 125;
      const bh = 34;
      const gap = 12;

      const atStart = step === 0 && phase === 0;
      const atEnd = step === futureTokens.length && phase === 3;

      buttons.push(drawButton(x, y, bw, bh, "Previous Token", !atStart));
      buttons.push(drawButton(x + (bw + gap), y, bw, bh, "Previous Step", !atStart));
      buttons.push(drawButton(x + 2 * (bw + gap), y, bw, bh, "Next Step", !atEnd));
      buttons.push(drawButton(x + 3 * (bw + gap), y, bw, bh, "Next Token", !atEnd));
    }

    function drawButton(x, y, w, h, label, enabled) {
      const isPrev = label.includes("Previous");
      const isNext = label.includes("Next");
      const isToken = label.includes("Token");

      p.fill(enabled ? 252 : 242);
      p.stroke(enabled ? 205 : 225);
      p.rect(x, y, w, h, 10);

      p.fill(enabled ? 150 : 205);
      p.noStroke();

      const cy = y + h / 2;

      if (isPrev) {
        if (isToken) {
          drawLeftArrow(x + 10, cy - 1);
          drawLeftArrow(x + 20, cy - 1);
        } else {
          drawLeftArrow(x + 14, cy - 1);
        }
      }

      if (isNext) {
        if (isToken) {
          drawRightArrow(x + w - 30, cy);
          drawRightArrow(x + w - 18, cy);
        } else {
          drawRightArrow(x + w - 24, cy);
        }
      }

      p.fill(enabled ? 60 : 160);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(13);

      let tx = x + w / 2;

      if (isPrev && isToken) tx += 18;
      else if (isPrev) tx += 10;

      if (isNext && isToken) tx -= 18;
      else if (isNext) tx -= 10;

      p.text(label, tx, cy);

      return { x, y, w, h, label, enabled };
    }

    function drawLeftArrow(x, y) {
      p.triangle(x, y, x + 12, y - 9, x + 12, y + 9);
    }

    function drawRightArrow(x, y) {
      p.triangle(x, y, x - 12, y - 9, x - 12, y + 9);
    }

    function drawToken(tok, x, y, c) {
      const w = tokenWidth(tok);

      p.fill(c);
      p.stroke(210);

      p.rect(x, y, w, 42, 12);

      p.noStroke();
      p.fill(30);

      p.textAlign(p.CENTER, p.CENTER);

      p.textSize(18);

      p.text(tok, x + w / 2, y + 21);
    }

    function tokenWidth(tok) {
      return p.max(52, p.textWidth(tok) + 26);
    }

    function easeOut(t) {
      return 1 - p.pow(1 - t, 3);
    }

    function getCandidates() {
      if (step === 0) {
        return [
          { token: "an", p: 0.72, selected: true },
          { token: "the", p: 0.12, selected: false },
          { token: "some", p: 0.1, selected: false },
          { token: "a", p: 0.06, selected: false },
        ];
      }

      if (step === 1) {
        return [
          { token: "Apple,", p: 0.62, selected: true },
          { token: "banana", p: 0.21, selected: false },
          { token: "orange", p: 0.12, selected: false },
          { token: "car", p: 0.05, selected: false },
        ];
      }

      if (step === 2) {
        return [
          { token: "it", p: 0.71, selected: true },
          { token: "and", p: 0.14, selected: false },
          { token: "because", p: 0.1, selected: false },
          { token: "they", p: 0.05, selected: false },
        ];
      }

      if (step === 3) {
        return [
          { token: "was", p: 0.81, selected: true },
          { token: "felt", p: 0.08, selected: false },
          { token: "seemed", p: 0.07, selected: false },
          { token: "became", p: 0.04, selected: false },
        ];
      }

      return [
        { token: "tasty", p: 0.66, selected: true },
        { token: "sweet", p: 0.18, selected: false },
        { token: "fresh", p: 0.11, selected: false },
        { token: "red", p: 0.05, selected: false },
      ];
    }

    function pressAt(pos) {
      for (const b of buttons) {
        if (
          pos.x >= b.x &&
          pos.x <= b.x + b.w &&
          pos.y >= b.y &&
          pos.y <= b.y + b.h &&
          b.enabled
        ) {
          if (b.label === "Next Step") {
            nextStep();
          }

          if (b.label === "Previous Step") {
            previousStep();
          }

          if (b.label === "Next Token") {
            nextToken();
          }

          if (b.label === "Previous Token") {
            previousToken();
          }
        }
      }
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

    function stopSlidevPointerHandling(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function setupCanvasEvents(canvas) {
      const onPointerDown = (event) => {
        stopSlidevPointerHandling(event);
        lastCanvasPointerPress = Date.now();
        pressAt(pointerPosition(event));
      };

      canvas.addEventListener("pointerdown", onPointerDown);

      cleanupCanvasEvents = () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
      };
    }

    p.mousePressed = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();

      if (Date.now() - lastCanvasPointerPress < 80) {
        return false;
      }

      pressAt(pointerPosition(event));

      return false;
    };

    function nextStep() {
      if (step === futureTokens.length && phase === 3) return;

      phase++;

      if (phase === 3) {
        animProgress = 0;
      }

      if (phase > 3) {
        step++;
        phase = 0;
        animProgress = 0;

        if (step >= futureTokens.length) {
          step = futureTokens.length;
          phase = 3;
        }
      }
    }

    function previousStep() {
      if (step === 0 && phase === 0) return;

      phase--;

      if (phase < 0) {
        step--;
        phase = 3;
      }
    }

    function nextToken() {
      if (step === futureTokens.length && phase === 3) return;

      step++;
      phase = 0;
      animProgress = 0;

      if (step >= futureTokens.length) {
        step = futureTokens.length;
        phase = 3;
      }
    }

    function previousToken() {
      if (step === 0 && phase === 0) return;

      step--;
      phase = 0;
      animProgress = 0;

      if (step < 0) {
        step = 0;
        phase = 0;
      }
    }
  }, container.value);
});

onBeforeUnmount(() => {
  cleanupCanvasEvents?.();
  cleanupCanvasEvents = null;

  if (sketch) {
    sketch.remove();
    sketch = null;
  }
});
</script>

<template>
  <div
    ref="container"
    class="autoregressive-next-token-demo"
    @click.stop
    @dblclick.stop
    @mousedown.stop
    @mouseup.stop
    @pointerdown.stop
    @pointerup.stop
    @touchstart.stop.prevent
    @touchend.stop.prevent
  ></div>
</template>

<style scoped>
.autoregressive-next-token-demo {
  display: flex;
  justify-content: center;
  width: 100%;
  pointer-events: auto;
  touch-action: none;
  user-select: none;
}

.autoregressive-next-token-demo :deep(canvas) {
  display: block;
  width: min(100%, 630px) !important;
  max-width: 100%;
  height: auto !important;
  aspect-ratio: 630 / 300;
  pointer-events: auto;
  touch-action: none;
}
</style>
