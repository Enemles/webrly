'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'

// Fond "Silk" de React Bits en version ogl (légère, sans react-reconciler),
// adapté à l'identité Webrly : le shader mélange (mix) un vert FONCÉ et un
// vert CLAIR selon le motif de soie -> dégradé vivant vert.

const vertexShader = /* glsl */ `
precision highp float;
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec3  uColorDark;
uniform vec3  uColorLight;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  // Mélange vert foncé -> vert clair selon le motif de soie.
  vec3 silk = mix(uColorDark, uColorLight, clamp(pattern, 0.0, 1.0));
  silk -= rnd / 15.0 * uNoiseIntensity;

  gl_FragColor = vec4(silk, 1.0);
}
`

type RGB = [number, number, number]

const hexToRgb = (hex: string): RGB => {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ]
}

export interface SilkProps {
  speed?: number
  scale?: number
  /** Vert clair (crêtes du motif). Défaut = --gradient Webrly. */
  colorLight?: string
  /** Vert foncé (creux du motif). Défaut = --background dark Webrly. */
  colorDark?: string
  noiseIntensity?: number
  rotation?: number
}

const Silk = ({
  speed = 5,
  scale = 1,
  colorLight = '#00df7a',
  colorDark = '#02160f',
  noiseIntensity = 1.3,
  rotation = 0,
}: SilkProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      alpha: false,
      dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 1)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorDark: { value: new Color(...hexToRgb(colorDark)) },
        uColorLight: { value: new Color(...hexToRgb(colorLight)) },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uRotation: { value: rotation },
        uNoiseIntensity: { value: noiseIntensity },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', resize)
    resize()
    container.appendChild(canvas)

    let raf = 0
    let last = performance.now()
    const update = (t: number) => {
      raf = requestAnimationFrame(update)
      const dt = (t - last) / 1000
      last = t
      program.uniforms.uTime.value += 0.1 * dt
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
      const loseCtx = gl.getExtension('WEBGL_lose_context')
      loseCtx?.loseContext()
    }
  }, [speed, scale, colorLight, colorDark, noiseIntensity, rotation])

  return <div ref={containerRef} className="h-full w-full" />
}

export default Silk
