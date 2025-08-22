export function getOrCreateParticipantId(planKey: string) {
  const key = `bb_pid_${planKey}`
  let id = localStorage.getItem(key)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id) }
  return id
}
