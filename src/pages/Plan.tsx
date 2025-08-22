import { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase'
import { onValue, ref, set } from 'firebase/database'
import { getOrCreateParticipantId } from '../lib/id'
import { explode, randomStyle } from '../lib/confetti'
import { pickMeme } from '../lib/memes'
import { InlineAd, StickyBottomAd } from '../Components/ads'

// --- AdSense slot IDs (replace with your real slot IDs when ready) ---
const INLINE_SLOT = '1234567890'
const STICKY_SLOT = '9876543210'

type PlanData = {
  title: string
  createdAt: string
  threshold: number
  date: string
  time: string
  enableMemes: boolean
}

// Parse hash query (?w=..., ?h=...)
const qs = () => new URLSearchParams(location.hash.split('?')[1] || '')

export default function Plan({ planKey }: { planKey: string }) {
  const writeKey = qs().get('w') || '' // voting key if present
  const hostKey  = qs().get('h') || '' // host-only key if present

  const [plan, setPlan] = useState<PlanData | null>(null)

  const [votes, setVotes] = useState<Record<string, { cancelled: boolean, updatedAt: string }>>({})
  const [roster, setRoster] = useState<Record<string, { joined: boolean, updatedAt: string }>>({})
  const [rosterLoaded, setRosterLoaded] = useState(false)
  const [closed, setClosed] = useState(false)

  // Local user preference to mute memes even if the plan allows them
  const [muteMemes, setMuteMemes] = useState<boolean>(() => {
    try { return localStorage.getItem('bb_mute_memes') === '1' } catch { return false }
  })

  const me = useMemo(() => getOrCreateParticipantId(planKey), [planKey])

  useEffect(() => {
    const u1 = onValue(ref(db, `plans/${planKey}`), s => setPlan(s.val()))
    const u2 = onValue(ref(db, `plans/${planKey}/votes/${writeKey}`), s => setVotes(s.val() || {}))
    const u3 = onValue(ref(db, `plans/${planKey}/roster`), s => { setRoster(s.val() || {}); setRosterLoaded(true) })
    const u4 = onValue(ref(db, `plans/${planKey}/close`), s => {
      const v = s.val() || {}
      const anyTrue = !!Object.values(v).find(Boolean)
      setClosed(anyTrue)
    })
    return () => { u1(); u2(); u3(); u4() }
  }, [planKey, writeKey])

  // Prevent double-join; hide action buttons until joined
  useEffect(() => {
    if (!rosterLoaded || closed) return
    const alreadyJoined = !!roster[me]?.joined
    if (!alreadyJoined) {
      set(ref(db, `plans/${planKey}/roster/${me}`), {
        joined: true,
        updatedAt: new Date().toISOString()
      })
    }
  }, [rosterLoaded, roster, me, planKey, closed])

  const joinedCount = Object.keys(roster).length
  const cancelledCount = Object.values(votes).filter(v => v.cancelled).length
  const everyoneCancelled = !closed && joinedCount > 0 && cancelledCount === joinedCount
  const largeGroupPrompt = !closed && joinedCount >= 10 && (cancelledCount / Math.max(1, joinedCount)) >= 0.8

  const myVote = votes[me]?.cancelled ?? false
  const iHaveJoined = !!roster[me]?.joined

  function toggleMuteMemes() {
    const next = !muteMemes
    setMuteMemes(next)
    try { localStorage.setItem('bb_mute_memes', next ? '1' : '0') } catch {}
  }

  // 🎉 Fireworks when everyone bailed; show memes only if plan allows AND not muted
  useEffect(() => {
    if (everyoneCancelled) {
      const style = randomStyle()
      explode(style as any)
      if (style === 'memes' && plan?.enableMemes && !muteMemes) {
        const img = document.getElementById('meme') as HTMLImageElement | null
        if (img) img.src = pickMeme()
      }
    }
  }, [everyoneCancelled, plan?.enableMemes, muteMemes])

  async function setVote(cancelled: boolean) {
    if (closed) return
    if (!writeKey) { alert('Read-only link. Ask the host for the voting link.'); return }
    if (!iHaveJoined) return
    await set(ref(db, `plans/${planKey}/votes/${writeKey}/${me}`), {
      cancelled, updatedAt: new Date().toISOString()
    })
  }

  async function closePlan() {
    if (!hostKey) { alert('Host link required to close this plan.'); return }
    if (closed) return
    await set(ref(db, `plans/${planKey}/close/${hostKey}`), true)
  }

  return (
    <div className="container">
      <h1>🎈 {plan?.title || 'Loading…'}</h1>

      {plan && (
        <p style={{ opacity: 0.9 }}>
          <b>Date:</b> {plan.date || '—'} • <b>Time:</b> {plan.time || '—'}
          {plan.enableMemes && (
            <>
              {' '}• <b>Memes:</b> {muteMemes ? 'Muted locally' : 'Enabled'}
              <button className="secondary" style={{ marginLeft: 8 }} onClick={toggleMuteMemes}>
                {muteMemes ? 'Unmute memes' : 'Mute memes'}
              </button>
            </>
          )}
        </p>
      )}

      <p>
        Status: <b>{closed ? 'Closed by host 🔒' : (everyoneCancelled ? 'Cancelled 🎉' : 'Active')}</b><br />
        Joined: {joinedCount} • Secret cancels: {cancelledCount}
      </p>

      <InlineAd slot={INLINE_SLOT} />

      {!closed && !iHaveJoined && (
        <div className="notice">
          Joining the party… (If this takes more than a second, try refreshing.)
        </div>
      )}

      {!closed && !everyoneCancelled && iHaveJoined && (
        <div className="actions">
          <button className={!myVote ? 'primary' : ''} onClick={() => setVote(false)}>Keep Plans</button>
          <button className={myVote ? 'danger' : ''} onClick={() => setVote(true)}>Cancel (Secret)</button>
        </div>
      )}

      {largeGroupPrompt && !closed && !everyoneCancelled && iHaveJoined && (
        <div className="notice">
          ⚠️ Most people want to cancel ({Math.round((cancelledCount / Math.max(1, joinedCount)) * 100)}%). Continue?
          <div className="actions" style={{ marginTop: 8 }}>
            <button onClick={() => setVote(false)}>Keep Going</button>
            <button onClick={() => setVote(true)}>I’m Out Too</button>
          </div>
        </div>
      )}

      {!closed && hostKey && (
        <div className="card" style={{ marginTop: 16 }}>
          <b>Host tools</b>
          <p style={{ marginTop: 8 }}>You’re using the <i>host link</i>. You can close this plan for everyone.</p>
          <button className="danger" onClick={closePlan}>Close plan for everyone</button>
        </div>
      )}

      <img id="meme" alt="" style={{ maxWidth: 320, display: 'block', marginTop: 16 }} />

      <StickyBottomAd slot={STICKY_SLOT} />
    </div>
  )
}
