import { useEffect, useState } from 'react'
import CreatePlan from './pages/CreatePlan'
import Plan from './pages/Plan'

export default function App() {
  const [route, setRoute] = useState(location.hash || '#/')

  useEffect(() => {
    const onHash = () => setRoute(location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route.startsWith('#/p/')) {
    const [, , planKeyWithQuery] = route.split('/')
    const planKey = (planKeyWithQuery || '').split('?')[0]
    return <Plan planKey={planKey} />
  }

  return <CreatePlan />
}
