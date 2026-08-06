import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import AppRoutes from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: '16px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow: '0 12px 40px -8px rgba(15,23,42,0.25)',
                  padding: '12px 16px',
                },
                success: { iconTheme: { primary: '#22C55E', secondary: '#ffffff' } },
                error: { iconTheme: { primary: '#EF4444', secondary: '#ffffff' } },
                duration: 3500,
              }}
            />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
