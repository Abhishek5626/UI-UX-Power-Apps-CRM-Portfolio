import type { CSSProperties } from 'react'
import './card-icon.css'

/*
  Card icons from Figma "Portfolio 2026", node 377-1478. Each 14px icon is a
  gradient layer cut by two masks, plus a highlight blended on top with
  overlay, exactly as Figma layers it. The SVG pieces live in /card-icons.
*/
const art = (hash: string) => `url("/card-icons/${hash}.svg")`
const SQUARE = '4df22f6e8b8c5f565cd68984b40e276d11b7d31a'
const SHINE = '8dfd2b656c1b5c9a54b315646764f543cf048b9c'

type IconSpec = {
  /** Gradient layer: its box, its two masks (position / size each) and the art inside. */
  box?: string
  masks: [string, string]
  maskAt?: [string, string]
  maskSize?: [string, string]
  /** Some art overflows its layer; this is that wrapper's inset. */
  artInset?: string
  fill: string
  /** Highlight layer: one mask (the second above) and its own art. */
  shine?: string
  /** Highlight mask position, when it differs from the shape mask's. */
  shineAt?: string
  height?: number
}

const icons = {
  star: { masks: [SQUARE, '89876abd2fb013ed6cc5c2b045cb78973af1996e'], maskAt: ['0 0', '0 0.35px'], maskSize: ['14px 14px', '14px 13.3px'], box: '0 -12% 0 0', artInset: '-32.5% -31.25% -19.5% -31.25%', fill: '2d503e8129354db72da4b38f30e1f461529913a9' },
  heart: { masks: [SQUARE, '0d63b4adeceda9898fa8e226391d9a700e086801'], maskAt: ['0 0', '0 0.56px'], maskSize: ['14px 14px', '14px 12.95px'], fill: 'b6fc2eb101fea7dd3974cfb58ad10b4a0bfafdbb' },
  dots: { masks: [SQUARE, '9734be1f77120aba9afe8e6dbdd60b990474b867'], fill: '66da3e6b4acdcfea3dd930e74a4e9fd4700869fe' },
  twinkle: { masks: [SQUARE, 'e52f7f6fdcf31064ebf5c922964c006236570565'], artInset: '-23.75% -17.75% -19.25% -23.75%', fill: '0111aabca5fcaede6b3c40fa5d65b849bce88ef1' },
  sparkle: { masks: [SQUARE, 'f12a67d72f0cb5a43b1f3d1b9e7bdf91f26a24f2'], maskAt: ['0 0', '0.013px 0.012px'], maskSize: ['14px 14px', '13.976px 13.976px'], fill: '29a0ad28f3961f2da86c0c022921e613344ee240' },
  flower: { masks: [SQUARE, '5cbc5b2bcc15571e7c5011982e46e52ba061eb5f'], maskAt: ['0 0', '0 0.49px'], maskSize: ['14px 14px', '14px 13.02px'], artInset: '-27.5% -25.5% -27.5% -13.51%', fill: '3d57642cbecf15c5a0f89f3eb84cdca83ab7ba0c' },
  pinwheel: { masks: [SQUARE, '77ffb003698ada4be97dc2cdafbcf6226491292b'], maskAt: ['0 0', '0.7px 0'], maskSize: ['14px 14px', '12.6px 14px'], box: '0 -11.75% 0 0', artInset: '-31.25% -27.96% -18.75% -21.14%', fill: 'e097a502966114b66356cff3cb1f826590cc3bce' },
  compass: { masks: ['155a89ff19cb03bb1c525507ce08bf0c894fb752', '6f7280476a569f117c8b4e02cc46b2361c6b8715'], maskAt: ['2.87px 0', '2.87px 0'], maskSize: ['14px 13.993px', '14px 13.993px'], box: '0 0 -5% -20.5%', artInset: '0 -17.42% -28.57% -24.88%', fill: 'd4f28ea74b460dea56a8a86badeb2000a24106a6', shine: 'b46acffe36a4b80a20f21e7776c2c4286f09fcd3', shineAt: '0 0', height: 13.993 },
  ring: { masks: ['2d066bcec52a82ab74f5743cfb6646cf33dea07d', '997187a08c4b45e9f908888d9533cf5cba1e0d62'], box: '0 -19.5% -8.5% 0', artInset: '-17.51% -25.11% -27.65% -18.83%', fill: 'e0ab2e41b55614a1d86e27a2187baf2e9366a8d1', shine: 'bca5c9bbf82c6cd13a070030ab686cdb3e94f7c4' },
} satisfies Record<string, IconSpec>

export type CardIconName = keyof typeof icons

export function CardIcon({ name }: { name: CardIconName }) {
  const spec: IconSpec = icons[name]
  const at = spec.maskAt ?? ['0 0', '0 0']
  const size = spec.maskSize ?? ['14px 14px', '14px 14px']
  const fill = <img className="card-icon-fill" src={`/card-icons/${spec.fill}.svg`} alt="" />
  const shineAt = spec.shineAt ?? at[1]
  return (
    <span className="project-card-icon card-icon-frame" aria-hidden="true">
      <span className="card-icon" style={{ height: spec.height ?? 14 }}>
        <span
          className="card-icon-layer"
          style={{
            inset: spec.box ?? 0,
            maskImage: `${art(spec.masks[0])}, ${art(spec.masks[1])}`,
            maskPosition: `${at[0]}, ${at[1]}`,
            maskSize: `${size[0]}, ${size[1]}`,
          } as CSSProperties}
        >
          {spec.artInset ? <span className="card-icon-art" style={{ inset: spec.artInset }}>{fill}</span> : fill}
        </span>
        <span
          className="card-icon-layer is-shine"
          style={{ maskImage: art(spec.masks[1]), maskPosition: shineAt, maskSize: size[1] } as CSSProperties}
        >
          <img className="card-icon-fill" src={`/card-icons/${spec.shine ?? SHINE}.svg`} alt="" />
        </span>
      </span>
    </span>
  )
}
