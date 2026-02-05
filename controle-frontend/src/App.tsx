
import { Layout } from './components/layout/Layout'
import { AppRoutes } from './routers/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'


function App() {
  return (
    <AuthProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AuthProvider>
  )
}

export default App
