import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const ProtectPage = () => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return <div>Authenticating...</div>
  }
  return isLoggedIn ? <Outlet /> : <Navigate to='/login' replace />
};
export default ProtectPage;