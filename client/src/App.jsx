
import './App.css'
import AppRoutes from './AppRoute';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <>
      <div>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </div>
    </>
  )
}

export default App
