/* AdSense helpers for Vite + React.
   Publisher: ca-pub-8384376801975252
   Usage:
     <InlineAd slot="YOUR_INLINE_SLOT" />
     <StickyBottomAd slot="YOUR_STICKY_SLOT" />
*/
import { useEffect, useRef } from 'react'

type AdProps = {
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: boolean
}

function useLoadAd(el: HTMLModElement | null) {
  useEffect(() => {
    if (!el) return
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [el])
}

export function InlineAd({ slot, style, format = 'auto', responsive = true }: AdProps) {
  const ref = useRef<HTMLModElement | null>(null)
  useLoadAd(ref.current)
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', margin: '12px 0', ...(style || {}) }}
      data-ad-client="ca-pub-8384376801975252"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
      ref={(n) => (ref.current = n as any)}
    />
  )
}

export function StickyBottomAd({ slot }: { slot: string }) {
  const ref = useRef<HTMLModElement | null>(null)
  useLoadAd(ref.current)
  return (
    <div className="sticky-ad-wrap">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8384376801975252"
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
        ref={(n) => (ref.current = n as any)}
      />
    </div>
  )
}
