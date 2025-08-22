import { ref, set, update } from 'firebase/database'
import { db } from '../firebase'
import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'

function rand(n = 12) {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: n }, () => c[Math.floor(Math.random() * c.length)]).join('')
}

// Copy + Share helpers
function copy(text: string) {
  navigator.clipboard?.writeText(text)
  alert('Copied!')
}
function canShare() {
  return typeof navigator !== 'undefined' && !!(navigator as any).share
}
async function shareLink(url: string, title: string) {
  try {
    // @ts-ignore
    await navigator.share({ title: 'Bail Buddies', text: title, url })
  } catch { /* user cancelled */ }
}

// Defaults for Date/Time
function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function CreatePlan() {
  const [title, setTitle] = useState('Dinner Friday 7pm')
  const [date, setDate] = useState(todayISO())         // new field
  const [time, setTime] = useState('19:00')            // new field (24h format)
  const [threshold, setThreshold] = useState(0.8)      // fixed intent: 80% for 10+
  const [created, setCreated] = useState<{
    publicUrl: string, voteUrl: string, hostUrl: string
  } | null>(null)
  const [qr, setQr] = useState<string>('')

  // Generate a QR code for the Voting link when created
  useEffect(() => {
    (async () => {
      if (created?.voteUrl) {
        const data = await QRCode.toDataURL(created.voteUrl)
        setQr(data)
      } else {
        setQr('')
      }
    })()
  }, [created])

  async function create() {
    const planKey = rand(8)
    const writeKey = rand(12)  // used by voters
    const hostKey  = rand(16)  // secret for host-only actions

    // Write plan (public) and hostKey (private) in two locations
    await set(ref(db, `plans/${planKey}`), {
      title,
      createdAt: new Date().toISOString(),
      threshold,   // kept for data completeness, app enforces 80% for >=10
      date,        // new
      time         // new
    })

    // Store hostKey privately
    await set(ref(db, `plans_private/${planKey}`), {
      hostKey
    })

    // Build links
    const base = location.origin
    const publicUrl = `${base}/#/p/${planKey}`
    const voteUrl   = `${base}/#/p/${planKey}?w=${writeKey}`
    const hostUrl   = `${base}/#/p/${planKey}?h=${hostKey}`

    setCreated({ publicUrl, voteUrl, hostUrl })
  }

  return (
    <div className="container">
      <h1>🎈 Bail Buddies</h1>
      <p>Create a plan. If everyone secretly cancels, you’ll all celebrate 🎉</p>

      <label>Plan title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Brunch Sunday 11am"
      />

      {/* New Date + Time fields */}
      <label>Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label>Time</label>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      {/* New message describing the rule; numeric input remains but prefilled at 0.8 */}
      <label>
        If more than 80% of your party of 10 or more people cancel, you will get a notification
        and an option to cancel or stay strong.
        If 9 or less people are in your party, the decision must be unanimous!
      </label>
      <input
        type="number"
        step="0.05"
        min="0.5"
        max="0.9"
        value={threshold}
        onChange={(e) => setThreshold(parseFloat(e.target.value))}
      />

      <button onClick={create}>Generate Invite Link</button>

      {created && (
        <div className="card">
          <p><b>Public link:</b></p>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={created.publicUrl}>{created.publicUrl}</a>
            <button className="secondary" onClick={() => copy(created.publicUrl)}>Copy</button>
            {canShare() && (
              <button className="secondary" onClick={() => shareLink(created.publicUrl, 'Public link')}>Share</button>
            )}
          </p>

          <p style={{ marginTop: 12 }}><b>Voting link (share this):</b></p>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={created.voteUrl}>{created.voteUrl}</a>
            <button className="secondary" onClick={() => copy(created.voteUrl)}>Copy</button>
            {canShare() && (
              <button className="secondary" onClick={() => shareLink(created.voteUrl, 'Voting link')}>Share</button>
            )}
          </p>

          <p style={{ marginTop: 12 }}><b>Host link (do not share):</b></p>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={created.hostUrl}>{created.hostUrl}</a>
            <button className="secondary" onClick={() => copy(created.hostUrl)}>Copy</button>
          </p>

          {/* QR for the voting link */}
          {qr && (
            <>
              <p style={{ marginTop: 12 }}><b>QR (Voting link):</b></p>
              <img src={qr} alt="Voting link QR" style={{ width: 180, height: 180, borderRadius: 12 }} />
            </>
          )}

          <small>Share the <i>Voting link</i> so people can secretly cancel. Keep the <b>Host link</b> private.</small>
        </div>
      )}
    </div>
  )
}
