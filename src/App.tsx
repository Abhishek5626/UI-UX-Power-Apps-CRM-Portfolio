import { HomePage } from './pages/HomePage.tsx'
import { PerfPanel } from './components/PerfPanel.tsx'
import { ThemeProvider } from './theme.tsx'

const showPerfPanel = new URLSearchParams(location.search).has('perf')

export default function App() {
  return (
    <ThemeProvider>
      <HomePage />
      {showPerfPanel ? <PerfPanel /> : null}
    </ThemeProvider>
  )
}
