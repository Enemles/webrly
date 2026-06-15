'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * GradualBlur — composant React Bits (variante JS + CSS) porté en TypeScript.
 *
 * Empile plusieurs calques `backdrop-filter: blur()` masqués par un dégradé
 * pour produire un flou *progressif* sur un bord (haut / bas / gauche / droite),
 * à la manière de screen.studio. Utilisé uniquement sur la landing
 * (`src/app/site`).
 *
 * Source d'origine : github.com/ansh-dhanani (React Bits).
 * Adaptations Webrly :
 *  - typage strict (props publiques + config interne) ;
 *  - styles injectés en JS au montage (pas de fichier `.css` séparé, cf. la
 *    convention des composants de la landing comme `Silk.tsx`) ;
 *  - la dépendance « mathjs » annoncée par React Bits n'est PAS installée : le
 *    composant n'utilise que l'objet natif `Math`.
 */

export type GradualBlurPosition = 'top' | 'bottom' | 'left' | 'right'
export type GradualBlurCurve =
  | 'linear'
  | 'bezier'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
export type GradualBlurTarget = 'parent' | 'page'

export interface GradualBlurProps {
  /** Bord auquel le voile de flou est rattaché. */
  position?: GradualBlurPosition
  /** Multiplicateur de force du flou (appliqué à chaque calque). */
  strength?: number
  /** Hauteur du voile (positions haut / bas). */
  height?: string
  /** Largeur personnalisée (positions gauche / droite). */
  width?: string
  /** Nombre de calques empilés (plus = dégradé plus lisse). */
  divCount?: number
  /** Progression exponentielle pour un flou plus marqué en fin de course. */
  exponential?: boolean
  /** z-index de base (la cible « page » ajoute +100). */
  zIndex?: number
  /** Apparition en fondu (`true`) ou révélée au scroll (`'scroll'`). */
  animated?: boolean | 'scroll'
  /** Durée d'animation. */
  duration?: string
  /** Easing de l'animation. */
  easing?: string
  /** Opacité de chaque calque. */
  opacity?: number
  /** Courbe de répartition appliquée à la progression des calques. */
  curve?: GradualBlurCurve
  /** Recalcul responsive interne (expérimental). */
  responsive?: boolean
  /** Positionnement relatif au parent (`absolute`) ou à la page (`fixed`). */
  target?: GradualBlurTarget
  /** Multiplicateur de force appliqué au survol. */
  hoverIntensity?: number
  /** Application d'un bundle de configuration prédéfini. */
  preset?: string
  /** Callback déclenché après la révélation animée. */
  onAnimationComplete?: () => void
  /** Classes additionnelles ajoutées à la racine. */
  className?: string
  /** Surcharges de style fusionnées au conteneur. */
  style?: React.CSSProperties
  // Surcharges responsive optionnelles (utilisées si `responsive`).
  mobileHeight?: string
  tabletHeight?: string
  desktopHeight?: string
  mobileWidth?: string
  tabletWidth?: string
  desktopWidth?: string
}

type GradualBlurConfig = Required<
  Pick<
    GradualBlurProps,
    | 'position'
    | 'strength'
    | 'height'
    | 'divCount'
    | 'exponential'
    | 'zIndex'
    | 'animated'
    | 'duration'
    | 'easing'
    | 'opacity'
    | 'curve'
    | 'responsive'
    | 'target'
    | 'className'
    | 'style'
  >
> &
  GradualBlurProps

const DEFAULT_CONFIG: GradualBlurConfig = {
  position: 'bottom',
  strength: 2,
  height: '6rem',
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  className: '',
  style: {},
}

const PRESETS: Record<string, Partial<GradualBlurConfig>> = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': {
    position: 'bottom',
    height: '10rem',
    target: 'page',
    strength: 3,
  },
}

const CURVE_FUNCTIONS: Record<GradualBlurCurve, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  'ease-in': (p) => p * p,
  'ease-out': (p) => 1 - Math.pow(1 - p, 2),
  'ease-in-out': (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
}

const mergeConfigs = (
  ...configs: Array<Partial<GradualBlurConfig>>
): GradualBlurConfig =>
  configs.reduce<GradualBlurConfig>((acc, c) => ({ ...acc, ...c }), {
    ...DEFAULT_CONFIG,
  })

const getGradientDirection = (position: GradualBlurPosition): string =>
  ({
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right',
  })[position] || 'to bottom'

const debounce = <A extends unknown[]>(fn: (...a: A) => void, wait: number) => {
  let t: ReturnType<typeof setTimeout>
  return (...a: A) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...a), wait)
  }
}

const useResponsiveDimension = (
  responsive: boolean,
  config: GradualBlurConfig,
  key: 'height' | 'width',
): string | undefined => {
  const [value, setValue] = useState<string | undefined>(config[key])
  useEffect(() => {
    if (!responsive) return
    const conf = config as unknown as Record<string, string | undefined>
    const cap = key[0].toUpperCase() + key.slice(1)
    const calc = () => {
      const w = window.innerWidth
      let v: string | undefined = config[key]
      if (w <= 480 && conf[`mobile${cap}`]) v = conf[`mobile${cap}`]
      else if (w <= 768 && conf[`tablet${cap}`]) v = conf[`tablet${cap}`]
      else if (w <= 1024 && conf[`desktop${cap}`]) v = conf[`desktop${cap}`]
      setValue(v)
    }
    const debounced = debounce(calc, 100)
    calc()
    window.addEventListener('resize', debounced)
    return () => window.removeEventListener('resize', debounced)
  }, [responsive, config, key])
  return responsive ? value : config[key]
}

const useIntersectionObserver = (
  ref: React.RefObject<HTMLDivElement>,
  shouldObserve = false,
): boolean => {
  const [isVisible, setIsVisible] = useState(!shouldObserve)

  useEffect(() => {
    const el = ref.current
    if (!shouldObserve || !el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, shouldObserve])

  return isVisible
}

function GradualBlur(props: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const config = useMemo<GradualBlurConfig>(() => {
    const presetConfig =
      props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {}
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props)
  }, [props])

  const responsiveHeight = useResponsiveDimension(
    config.responsive,
    config,
    'height',
  )
  const responsiveWidth = useResponsiveDimension(
    config.responsive,
    config,
    'width',
  )

  const isVisible = useIntersectionObserver(
    containerRef,
    config.animated === 'scroll',
  )

  const blurDivs = useMemo(() => {
    const divs: React.ReactNode[] = []
    const increment = 100 / config.divCount
    const currentStrength =
      isHovered && config.hoverIntensity
        ? config.strength * config.hoverIntensity
        : config.strength

    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear

    for (let i = 1; i <= config.divCount; i++) {
      let progress = i / config.divCount
      progress = curveFunc(progress)

      let blurValue: number
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength
      } else {
        blurValue = 0.0625 * (progress * config.divCount + 1) * currentStrength
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10
      const p2 = Math.round(increment * i * 10) / 10
      const p3 = Math.round((increment * i + increment) * 10) / 10
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10

      let gradient = `transparent ${p1}%, black ${p2}%`
      if (p3 <= 100) gradient += `, black ${p3}%`
      if (p4 <= 100) gradient += `, transparent ${p4}%`

      const direction = getGradientDirection(config.position)

      const divStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition:
          config.animated && config.animated !== 'scroll'
            ? `backdrop-filter ${config.duration} ${config.easing}`
            : undefined,
      }

      divs.push(<div key={i} style={divStyle} />)
    }

    return divs
  }, [config, isHovered])

  const containerStyle = useMemo<React.CSSProperties>(() => {
    const isVertical = ['top', 'bottom'].includes(config.position)
    const isHorizontal = ['left', 'right'].includes(config.position)
    const isPageTarget = config.target === 'page'

    const baseStyle: React.CSSProperties = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated
        ? `opacity ${config.duration} ${config.easing}`
        : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      ...config.style,
    }

    if (isVertical) {
      baseStyle.height = responsiveHeight
      baseStyle.width = responsiveWidth || '100%'
      ;(baseStyle as Record<string, string | number>)[config.position] = 0
      baseStyle.left = 0
      baseStyle.right = 0
    } else if (isHorizontal) {
      baseStyle.width = responsiveWidth || responsiveHeight
      baseStyle.height = '100%'
      ;(baseStyle as Record<string, string | number>)[config.position] = 0
      baseStyle.top = 0
      baseStyle.bottom = 0
    }

    return baseStyle
  }, [config, responsiveHeight, responsiveWidth, isVisible])

  const { hoverIntensity, animated, onAnimationComplete, duration } = config

  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const ms = parseFloat(duration) * 1000
      const t = setTimeout(() => onAnimationComplete(), ms)
      return () => clearTimeout(t)
    }
  }, [isVisible, animated, onAnimationComplete, duration])

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${
        config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'
      } ${config.className}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div
        className="gradual-blur-inner"
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {blurDivs}
      </div>
    </div>
  )
}

const GradualBlurMemo = React.memo(GradualBlur)
GradualBlurMemo.displayName = 'GradualBlur'

export default GradualBlurMemo

const injectStyles = () => {
  if (typeof document === 'undefined') return

  const styleId = 'gradual-blur-styles'
  if (document.getElementById(styleId)) return

  const styleElement = document.createElement('style')
  styleElement.id = styleId
  styleElement.textContent = `
  .gradual-blur { pointer-events: none; transition: opacity 0.3s ease-out; isolation: isolate; }
  .gradual-blur-parent { overflow: hidden; }
  .gradual-blur-inner { pointer-events: none; }
  @supports not (backdrop-filter: blur(1px)) {
    .gradual-blur-inner > div { background: rgba(0, 0, 0, 0.3); opacity: 0.5; }
  }`

  document.head.appendChild(styleElement)
}

if (typeof document !== 'undefined') {
  injectStyles()
}
