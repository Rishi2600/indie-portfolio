"use client";

import { useEffect, useRef } from "react";
import {
  ALBEDO_MAX,
  ALBEDO_MIN,
  AMBIENT,
  DEPTH,
  FACING_MAX,
  FACING_MIN,
  FALLOFF,
  RELIEF,
  TORCH_HEIGHT,
  type ReliefTile,
} from "@/lib/rock";
import { torchLight } from "@/lib/torch";
import styles from "./Rock.module.css";

/** The relief is soft, so the wall is lit at half the screen's resolution. */
const SCALE = 0.5;
/** How wide each tile is laid on the page, in pixels: unrelated, so no repeat lines up. */
const FORMS_PX = 1230;
const GRAIN_PX = 290;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const MORE_CONTRAST = "(prefers-contrast: more)";

const VERTEX = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

/** The same arithmetic as wallLight() in lib/rock.ts, per pixel. */
const FRAGMENT = `
precision mediump float;
uniform sampler2D uForms;
uniform sampler2D uGrain;
uniform vec2 uView;
uniform float uScroll;
uniform vec3 uLight;
uniform float uReach;
uniform float uStrength;
uniform vec3 uStone;

vec2 slope(vec4 t) {
  vec3 n = t.xyz * 2.0 - 1.0;
  return n.xy / max(n.z, 0.2);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uView.y * ${SCALE.toFixed(2)} - gl_FragCoord.y) / ${SCALE.toFixed(2)};
  vec2 page = px + vec2(0.0, uScroll);
  vec4 forms = texture2D(uForms, page / ${FORMS_PX.toFixed(1)});
  vec4 grain = texture2D(uGrain, page / ${GRAIN_PX.toFixed(1)});
  vec3 n = normalize(vec3(slope(forms) + slope(grain) * 0.55, 1.0));

  vec3 toLight = vec3(uLight.xy - px, uLight.z);
  vec3 L = normalize(toLight);
  float facing = clamp(dot(n, L) / max(L.z, 0.2), ${FACING_MIN.toFixed(2)}, ${FACING_MAX.toFixed(2)});
  float relief = 1.0 + (facing - 1.0) * ${RELIEF.toFixed(2)};
  float carry = 1.0 / (1.0 + pow(length(toLight.xy) / (uReach * ${FALLOFF.toFixed(2)}), 2.0));

  // Shadow: walk a little way towards the flame across the rock. Where the
  // rock rises above the line from here to the flame, it stands in the way.
  float here = forms.a;
  vec2 toward = normalize(toLight.xy + vec2(0.0001));
  float climb = uLight.z / max(length(toLight.xy), 1.0);
  float blocked = 0.0;
  for (int i = 1; i <= 6; i++) {
    float s = float(i * i) * 3.0 + 4.0;
    float there = texture2D(uForms, (page + toward * s) / ${FORMS_PX.toFixed(1)}).a;
    blocked = max(blocked, (there - here) * ${DEPTH.toFixed(1)} - s * climb);
  }
  float lit = 1.0 - smoothstep(0.0, 10.0, blocked) * 0.85;

  float height = forms.a * 0.7 + grain.a * 0.3;
  float albedo = mix(${ALBEDO_MIN.toFixed(2)}, ${ALBEDO_MAX.toFixed(2)}, height);
  float light = albedo * (${AMBIENT.toFixed(2)} + ${(1 - AMBIENT).toFixed(2)} * carry * uStrength * relief * lit);

  // A fine speckle in the stone, and hollows a shade cooler than ridges.
  float speck = fract(sin(dot(floor(page), vec2(12.9898, 78.233))) * 43758.5453);
  light *= 0.95 + 0.05 * speck;
  vec3 tint = mix(vec3(0.93, 0.95, 1.0), vec3(1.0, 0.98, 0.93), height);
  gl_FragColor = vec4(uStone * light * tint, 1.0);
}
`;

type Wall = {
  draw: () => void;
  resize: () => void;
};

function hexToRgb(value: string): [number, number, number] {
  const hex = value.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}

/**
 * The relief, made once per page in a worker and kept, so returning to night
 * does not make it again.
 */
let tiles: Promise<{ forms: ReliefTile; grain: ReliefTile } | null> | undefined;
function relief() {
  tiles ??= new Promise((resolve) => {
    try {
      const worker = new Worker(new URL("./rock.worker.ts", import.meta.url));
      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate();
      };
      worker.onerror = () => {
        resolve(null);
        worker.terminate();
      };
    } catch {
      resolve(null);
    }
  });
  return tiles;
}

function build(canvas: HTMLCanvasElement, made: { forms: ReliefTile; grain: ReliefTile }): Wall | null {
  // A browser drawing without a graphics card would light the wall slowly
  // enough to make the whole page stutter; it gets the plain stone instead.
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return null;
  // Not every browser that draws in software says so through the flag above.
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }

  function shader(type: number, source: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, source);
    gl!.compileShader(s);
    return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null;
  }
  const vs = shader(gl.VERTEX_SHADER, VERTEX);
  const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // One triangle that covers the screen.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

  function texture(unit: number, tile: ReliefTile) {
    gl!.activeTexture(gl!.TEXTURE0 + unit);
    gl!.bindTexture(gl!.TEXTURE_2D, gl!.createTexture());
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, tile.size, tile.size, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, tile.data);
    gl!.generateMipmap(gl!.TEXTURE_2D);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.REPEAT);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.REPEAT);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
  }
  texture(0, made.forms);
  texture(1, made.grain);

  const u = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform1i(u("uForms"), 0);
  gl.uniform1i(u("uGrain"), 1);
  const uView = u("uView");
  const uScroll = u("uScroll");
  const uLight = u("uLight");
  const uReach = u("uReach");
  const uStrength = u("uStrength");
  const uStone = u("uStone");

  return {
    resize() {
      canvas.width = Math.ceil(innerWidth * SCALE);
      canvas.height = Math.ceil(innerHeight * SCALE);
      gl!.viewport(0, 0, canvas.width, canvas.height);
    },
    draw() {
      const stone = getComputedStyle(document.documentElement).getPropertyValue("--paper");
      gl!.uniform3fv(uStone, hexToRgb(stone));
      gl!.uniform2f(uView, innerWidth, innerHeight);
      gl!.uniform1f(uScroll, scrollY);
      gl!.uniform3f(uLight, torchLight.x, torchLight.y, torchLight.reach * TORCH_HEIGHT);
      gl!.uniform1f(uReach, torchLight.reach);
      gl!.uniform1f(uStrength, torchLight.strength);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    },
  };
}

/**
 * The cave wall at night: rock in relief, lit by the torch.
 *
 * Laid behind everything, under the stone's grain, and lit every frame from
 * wherever the torch is (lib/torch.ts records that). Faces of the rock turned
 * to the flame catch it, faces turned away fall dark, and ridges throw short
 * shadows away from the flame, longer the further they are from it; the relief
 * itself is generated once (lib/rock.ts), and the wall scrolls with the page.
 *
 * It only adds to what is already there: without WebGL, on a browser drawing
 * without a graphics card, or while the rock is still being made (in a
 * worker, off the main thread), the plain stone shows, and the wall fades in
 * over it once it is ready. Readers who ask for more contrast and high-contrast modes get
 * the plain stone; readers who ask for less motion get a wall that is only
 * redrawn when the light moves.
 */
export function Rock() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const root = document.documentElement;
    const reduced = window.matchMedia(REDUCED_MOTION);
    const moreContrast = window.matchMedia(MORE_CONTRAST);
    let wall: Wall | null | undefined;
    let frame = 0;
    let lastKey = "";

    const wanted = () =>
      root.getAttribute("data-theme") === "night" &&
      !moreContrast.matches &&
      document.visibilityState === "visible";

    function tick() {
      frame = requestAnimationFrame(tick);
      if (!wall || !torchLight.burning) return;
      // With less motion the flame holds still, so the wall only needs
      // drawing again when the light or the page moves.
      const key = `${torchLight.x.toFixed(1)},${torchLight.y.toFixed(1)},${torchLight.reach.toFixed(1)},${torchLight.strength.toFixed(3)},${scrollY},${innerWidth},${innerHeight}`;
      if (reduced.matches && key === lastKey) return;
      lastKey = key;
      wall.draw();
      canvas!.setAttribute("data-ready", "");
    }

    let building = false;
    let gone = false;

    function update() {
      if (wanted() && !frame) {
        if (wall === undefined) {
          if (building) return;
          building = true;
          void relief().then((made) => {
            building = false;
            if (gone) return;
            wall = made ? build(canvas!, made) : null;
            update();
          });
          return;
        }
        if (!wall) return;
        wall.resize();
        lastKey = "";
        frame = requestAnimationFrame(tick);
      } else if (!wanted() && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    const onResize = () => {
      wall?.resize();
      lastKey = "";
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      wall = undefined;
      canvas.removeAttribute("data-ready");
    };

    const theme = new MutationObserver(update);
    theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", update);
    moreContrast.addEventListener("change", update);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", update);
    update();

    return () => {
      gone = true;
      theme.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", update);
      moreContrast.removeEventListener("change", update);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={ref} className={styles.rock} aria-hidden="true" />;
}
