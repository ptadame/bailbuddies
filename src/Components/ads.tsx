import { useEffect, useRef } from 'react'

function useLoadAd(ref: HTMLElement | null) {
  useEffect(() => {
    if (!ref) return
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.warn('AdSense push error', e)
    }
  }, [ref])
}

type AdProps = {
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: boolean
}

export function InlineAd({ slot, style, format = 'auto', responsive = true }: AdProps) {
  const ref = useRef<HTMLDivElement | null>(null)
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
  const ref = useRef<HTMLDivElement | null>(null)
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
