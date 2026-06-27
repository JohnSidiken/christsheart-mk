import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const ProtectPage = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Outlet /> : <Navigate to='/login' replace />
};
export default ProtectPage;