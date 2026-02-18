
import { Layout } from './components/layout/Layout'
import { AppRoutes } from './routers/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'


import { WaiterProvider } from './contexts/WaiterContext'

function App() {
  return (
    <AuthProvider>
      <WaiterProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </WaiterProvider>
    </AuthProvider>
  )
}

export default App
