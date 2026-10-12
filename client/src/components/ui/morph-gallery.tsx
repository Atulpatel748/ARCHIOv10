import * as React from "react"

/**
 * Morph Gallery — a photo gallery whose slides dissolve into each other
 * through noise instead of cutting or cross-fading.
 *
 * The transition is one full-screen shader pass over two textures. An fbm
 * noise field gives every pixel a threshold, and the progress value sweeps
 * past those thresholds, so the outgoing frame tears away in drifting tatters
 * rather than fading uniformly. The threshold is biased by the luminance of
 * the *incoming* frame, which makes its bright areas burn through first — the
 * detail that stops it reading as a generic dissolve filter.
 *
 * Self-contained: raw WebGL, React is the only import. No gallery library and
 * no animation library. Its styles live in src/styles/morph-gallery.css (plain
 * CSS, class names prefixed `mg`), so the project does not need Tailwind.
 * The canvas sizes itself from its own box.
 *
 * Textures need CORS. An image served without `Access-Control-Allow-Origin`
 * cannot be uploaded to WebGL at all, so the component detects that and falls
 * back to a plain DOM cross-fade — the gallery still works, it just stops
 * morphing. That is the difference between "no shader" and "black rectangle".
 */

export type MorphItem = {
  /** Full-size image. Must be served with CORS headers to be morphed. */
  src: string
  alt?: string
}

export type MorphGalleryProps = {
  items: MorphItem[]
  /** **Must be a definite length.** The canvas fills this box. */
  height?: string
  /** Milliseconds of dissolve. */
  duration?: number
  /** fbm frequency. Higher tears into finer shreds. */
  noiseScale?: number
  /** 0 = plain cover (default). Towards 1 shows more of each photo, the leftover edges filled with a blurred copy of it. */
  fit?: number
  /** Width of the dissolve front, in threshold units. 0 is a hard edge. */
  edge?: number
  /** How far the frames slide against each other while dissolving. */
  drift?: number
  /** Wrap past the ends. */
  loop?: boolean
  /** The photo to show. The caller drives the slideshow: the gallery has no controls of its own. */
  index: number
  /** Called once, when the first photo is on screen (or, without WebGL, has loaded). */
  onReady?: () => void
  className?: string
}

// #region gallery
/** Wrap past the ends when looping, clamp at them when not. */
export const wrapIndex = (i: number, n: number, loop: boolean): number => {
  if (n <= 0) return 0
  return loop ? ((i % n) + n) % n : Math.min(Math.max(i, 0), n - 1)
}

/** Quintic in-out: the dissolve starts and ends still, and hurries the middle. */
export const easeInOutQuint = (t: number): number => {
  const x = Math.min(Math.max(t, 0), 1)
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2
}

/**
 * `object-fit: cover` expressed as a UV scale about the centre. Both factors
 * are <= 1: the sampled window shrinks, so the image crops rather than
 * stretching, whichever way the box is out of proportion.
 */
export const coverScale = (
  canvasAspect: number,
  imgAspect: number,
): [number, number] =>
  canvasAspect > imgAspect
    ? [1, imgAspect / canvasAspect]
    : [canvasAspect / imgAspect, 1]
// #endregion

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;
uniform float u_fit;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// The drift below pushes UVs past the edge of the image, and CLAMP_TO_EDGE
// answers that by smearing the last row of pixels into long vertical streaks.
// Reflecting instead keeps real picture there. Done in the shader because
// MIRRORED_REPEAT is illegal on the non-power-of-two textures photos produce.
vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

vec2 coverScale(float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  return (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
}

// The photo as object-fit cover, or (u_fit > 0) pulled back towards contain. Where the pulled-back photo no longer
// reaches the edge of the frame, a blurred copy of the same photo (taken from the plain cover crop) fills the gap.
vec4 sampleFit(sampler2D tex, vec2 uv, float imgAspect) {
  vec2 c = coverScale(imgAspect);
  vec2 q = (uv - 0.5) * c + 0.5;
  if (u_fit <= 0.0) return texture2D(tex, mirror(q));

  vec2 p = (uv - 0.5) * c * mix(1.0, 1.0 / min(c.x, c.y), u_fit) + 0.5;
  float inside = min(min(p.x, 1.0 - p.x), min(p.y, 1.0 - p.y));
  vec4 photo = texture2D(tex, clamp(p, 0.0, 1.0));
  if (inside >= 0.04) return photo;

  vec4 blur = vec4(0.0);
  for (int i = 0; i < 4; i++) {
    float a = 1.570796 * float(i) + 0.785398;
    vec2 d = vec2(cos(a), sin(a));
    // offsets are in screen proportions (scaled by c), so the blur is round, not smeared along one axis
    blur += texture2D(tex, mirror(q + d * 0.03 * c)) + texture2D(tex, mirror(q + d * 0.08 * c));
  }
  blur *= 0.125;
  return mix(blur * 0.9, photo, smoothstep(0.0, 0.04, inside));
}

void main() {
  // Widen the sweep by one edge at each end, so progress 0 and 1 are fully
  // one image or the other rather than already half-dissolved.
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  float noise = fbm(v_uv * u_scale + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  // Bias the threshold by how bright the incoming frame is here: its lit areas
  // cross the front first, so the new image appears to burn through the old.
  noise = smoothstep(
    0.0,
    2.0,
    length(texture2D(u_to, mirror((v_uv - 0.5) * coverScale(u_toAspect) + 0.5)).rgb) + noise
  );

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  // Both frames slide, by different amounts and in opposite directions, so the
  // tatters have parallax against each other instead of sitting in one plane.
  vec4 fromColor = sampleFit(
    u_from,
    v_uv + vec2(0.0, noise * u_progress * u_drift * u_direction),
    u_fromAspect
  );
  vec4 toColor = sampleFit(
    u_to,
    v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * u_drift * u_direction),
    u_toAspect
  );

  gl_FragColor = mix(fromColor, toColor, mixFactor);
}
`

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const shader = gl.createShader(type)
  if (!shader) throw new Error("could not create shader")
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error("shader compile failed: " + log)
  }
  return shader
}

const link = (gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) => {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc)
  const program = gl.createProgram()
  if (!program) throw new Error("could not create program")
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  // The shaders are owned by the program once attached; drop our references
  // now so they are freed with it rather than leaking per mount.
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error("program link failed: " + log)
  }
  return program
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    // Without this the texture upload throws and the whole gallery goes black.
    // With it, a host that sends no CORS header fails here instead — which we
    // can see, and fall back from. Same-origin photos never taint the canvas,
    // so they are requested normally; that keeps them matching the page's own
    // <img> and preload requests instead of being downloaded a second time.
    if (new URL(src, window.location.href).origin !== window.location.origin) {
      img.crossOrigin = "anonymous"
    }
    img.decoding = "async"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("could not load " + src))
    img.src = src
  })

export default function MorphGallery({
  items,
  height = "100svh",
  duration = 1500,
  noiseScale = 3.5,
  edge = 0.15,
  drift = 0.5,
  fit = 0,
  loop = true,
  index,
  onReady,
  className = "",
}: MorphGalleryProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const active = wrapIndex(index, items.length, loop)

  const [failed, setFailed] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [generation, setGeneration] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)

  // Read through a ref so a new callback each render never rebuilds the GL context.
  const onReadyRef = React.useRef(onReady)
  onReadyRef.current = onReady
  const readyFired = React.useRef(false)
  const fireReady = React.useCallback(() => {
    if (readyFired.current) return
    readyFired.current = true
    onReadyRef.current?.()
  }, [])

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // The render loop reads live values through refs, so retuning the dissolve
  // never tears down the GL context.
  const tuning = React.useRef({ duration, noiseScale, edge, drift, fit, reduced })
  tuning.current = { duration, noiseScale, edge, drift, fit, reduced }

  // A transition is requested by index changes and consumed by the loop.
  const request = React.useRef<{ from: number; to: number } | null>(null)
  const previous = React.useRef(active)
  React.useEffect(() => {
    if (previous.current === active) return
    request.current = { from: previous.current, to: active }
    previous.current = active
  }, [active])

  // Rebuilding on the source list is the point: new images, new textures.
  const sources = items.map((i) => i.src).join("\n")

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return

    // Software-only WebGL (no GPU) runs each morph as a string of 50ms frames that freeze the page, so such
    // devices get the plain cross-fade below instead.
    const options: WebGLContextAttributes = { alpha: false, antialias: false, failIfMajorPerformanceCaveat: true }
    const gl =
      canvas.getContext("webgl", options) ??
      (canvas.getContext("experimental-webgl", options) as WebGLRenderingContext | null)
    if (!gl) {
      setFailed(true)
      return
    }

    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    // Indexed by item, with holes: an image that has not arrived yet — or
    // never will — leaves a null behind rather than shifting its neighbours.
    const textures: (WebGLTexture | null)[] = items.map(() => null)
    const aspects: number[] = items.map(() => 1)
    let raf = 0
    let disposed = false

    // Dissolve state, in the loop rather than in React: it changes every frame.
    let from = active
    let to = active
    let progress = 1
    let startedAt = 0
    let direction = 1
    // The canvas keeps showing the last frame it drew, so a still photo needs no drawing at all. Only a dissolve,
    // a resize (which clears the canvas), a newly arrived photo or a tuning change makes the next frame different.
    // Redrawing the same still 60 times a second cost real phones battery and GPU time for nothing.
    let dirty = true
    let drawnTuning = ""

    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      // Everything below died with the context. Forget it, so the cleanup that runs on restore does not try to delete
      // objects from a context that no longer exists (each attempt logs a WebGL warning).
      textures.fill(null)
      buffer = null
      program = null
    }
    // A restored context has nothing in it — every object above is gone, so
    // the only honest response is to build the whole thing again.
    const onRestored = () => setGeneration((g) => g + 1)
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (w === 0 || h === 0 || (canvas.width === w && canvas.height === h)) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      dirty = true
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    let uniforms: Record<string, WebGLUniformLocation | null> = {}

    // Until every image is in, `from` or `to` can point at a hole. Showing the
    // nearest texture that does exist beats binding null, which draws black.
    const pick = (i: number) => textures[i] ?? textures.find((t) => t) ?? null

    const draw = () => {
      if (disposed) return
      const t = tuning.current

      const pending = request.current
      if (pending) {
        request.current = null
        if (pending.from !== pending.to) {
          from = pending.from
          to = pending.to
          progress = 0
          startedAt = performance.now()
          // Direction follows the shortest way round, so a wrap from the last
          // slide to the first drifts forward like every other step.
          const n = items.length
          const forward = loop
            ? ((pending.to - pending.from + n) % n) * 2 <= n
            : pending.to > pending.from
          direction = forward ? 1 : -1
        }
      }

      const animating = progress < 1
      if (progress < 1) {
        // Reduced motion keeps the gallery but drops the animation: the slide
        // is simply there on the next frame.
        const span = t.reduced ? 0 : Math.max(t.duration, 1)
        const elapsed = performance.now() - startedAt
        progress = span === 0 ? 1 : easeInOutQuint(Math.min(elapsed / span, 1))
      }

      const tuned = `${t.noiseScale}|${t.edge}|${t.drift}|${t.fit}`
      if (tuned !== drawnTuning) dirty = true
      // Nothing moved and nothing changed since the last frame drawn: leave it on screen.
      if (!animating && !dirty) return

      const fromTex = pick(from)
      const toTex = pick(to)
      if (!fromTex || !toTex) return
      dirty = false
      drawnTuning = tuned

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fromTex)
      gl.uniform1i(uniforms.from, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, toTex)
      gl.uniform1i(uniforms.to, 1)

      gl.uniform1f(uniforms.progress, progress)
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.fromAspect, aspects[from] ?? 1)
      gl.uniform1f(uniforms.toAspect, aspects[to] ?? 1)
      gl.uniform1f(uniforms.scale, t.noiseScale)
      gl.uniform1f(uniforms.direction, direction)
      gl.uniform1f(uniforms.edge, Math.max(t.edge, 0.001))
      gl.uniform1f(uniforms.drift, t.drift)
      gl.uniform1f(uniforms.fit, Math.min(Math.max(t.fit, 0), 1))
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const frame = () => {
      draw()
      raf = requestAnimationFrame(frame)
    }

    const start = async () => {
      try {
        program = link(gl, VERT, FRAG)
        gl.useProgram(program)

        buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        )
        const loc = gl.getAttribLocation(program, "a_position")
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

        for (const name of [
          "from", "to", "progress", "resolution",
          "fromAspect", "toAspect", "scale", "direction", "edge", "drift", "fit",
        ]) {
          uniforms[name] = gl.getUniformLocation(program, "u_" + name)
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

        // Each image is uploaded the moment it arrives and the loop starts on
        // the first one. Waiting for all of them means a black rectangle for
        // as long as the slowest image takes, which on a real connection is
        // the whole first impression.
        let running = false
        let refused = 0
        await Promise.all(
          items.map((item, i) =>
            loadImage(item.src).then(
              (img) => {
                if (disposed) return
                const tex = gl.createTexture()
                gl.bindTexture(gl.TEXTURE_2D, tex)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
                // Photos are not powers of two, so mipmaps and repeat are both
                // off the table in WebGL1 — clamp and linear are the only
                // legal pair, and the wrong one renders black with no error.
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                textures[i] = tex
                aspects[i] = img.naturalWidth / Math.max(img.naturalHeight, 1)
                dirty = true // a slide that was standing in for this one can now show the real photo
                if (!running) {
                  running = true
                  resize()
                  setReady(true)
                  fireReady()
                  raf = requestAnimationFrame(frame)
                }
              },
              () => {
                // One broken URL should cost one slide, not the effect. Only
                // when nothing at all loads is there no gallery to shade.
                refused += 1
                if (refused === items.length && !disposed) setFailed(true)
              },
            ),
          ),
        )
      } catch {
        // No WebGL, or a driver that refused the program. Either way: show the
        // pictures without the morph rather than showing nothing.
        if (!disposed) setFailed(true)
      }
    }
    void start()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      for (const tex of textures) if (tex) gl.deleteTexture(tex)
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
      textures.fill(null)
    }
    // `active` is read once to seed the first frame; changes arrive through
    // `request` instead, which is why it is deliberately not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, generation, items.length, loop])

  return (
    <div className={"mg" + (className ? " " + className : "")} style={{ height }}>
      {failed ? (
        // The same gallery without the shader: stacked images, opacity only.
        items.map((item, i) => (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt ?? ""}
            className="mg__img"
            style={{ maxWidth: "none", opacity: i === active ? 1 : 0 }}
            aria-hidden={i !== active}
            onLoad={i === active ? fireReady : undefined}
          />
        ))
      ) : (
        <canvas
          ref={canvasRef}
          className="mg__canvas"
          style={{
            // Nothing is on the canvas until the textures land; fading it in
            // avoids a black flash on a slow connection. Short, because on the
            // home page it runs under the loading screen, which waits for it.
            opacity: ready ? 1 : 0,
            transition: "opacity 150ms ease",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
