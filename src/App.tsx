import { HomePage } from './pages/HomePage.tsx'
import { ThemeProvider } from './theme.tsx'

export default function App() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  )
}
