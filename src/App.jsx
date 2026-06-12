import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import GlobalHeader from './components/GlobalHeader'
import TourOverlay from './components/TourOverlay'
import Home from './pages/Home'
import Handbook from './pages/Handbook'
import HandbookDetail from './pages/HandbookDetail'
import Tools from './pages/Tools'
import Onboarding from './pages/Onboarding'
import OnboardingTeamSelect from './pages/OnboardingTeamSelect'

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/handbook/')) return
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function MainShell() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  return (
    <>
      <GlobalHeader />
      <div style={{ display: onHome ? 'block' : 'none' }} aria-hidden={!onHome}>
        <Home />
      </div>
      <div style={{ display: onHome ? 'none' : 'block' }} aria-hidden={onHome}>
        <Outlet />
      </div>
    </>
  )
}

function BareShell() {
  return <Outlet />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <TourOverlay />
      <Routes>
        <Route element={<MainShell />}>
          <Route path="/" element={null} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/handbook" element={<Handbook />} />
          <Route path="/handbook/:chapterId" element={<HandbookDetail />} />
          <Route path="/handbook/:chapterId/:articleId" element={<HandbookDetail />} />
          <Route path="/tools" element={<Tools />} />
        </Route>
        <Route element={<BareShell />}>
          <Route path="/onboarding/team" element={<OnboardingTeamSelect />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
