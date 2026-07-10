import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Login from './pages/LoginPage';
import ProtectPage from './pages/ProtectPage';
import PublicPage from './pages/PublicPage';
import AdminPanel from './pages/AdminPanel';
import './App.css';
const App = () => {
  return (
      <div>
        <main>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<PublicPage />} />
              <Route element={<ProtectPage />}>
                <Route path='admin' element={<AdminPanel />} />
              </Route>
            </Route>
            <Route path='/login' element={<Login />} />
          </Routes>
        </main>
      </div>
    );
}
export default App;