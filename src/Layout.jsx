import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import logo from './assets/chmi.png';
const Layout = () => {
  const { isLoggedIn, logout } = useAuth();
  const naviagate = useNavigate();
  const handleLogout = () => {
    logout();
    naviagate('/login', { replace: true });
  }
  return (
      <div className='layout'>
        <header className='site-header'>
          <img src={logo} alt="Christ's heart Logo" />
          <div className='header_div'>
            <h1 className='chm__name'>Christ's Heart Makerere</h1>
            <span className='slogan'><em>A family to Belong</em></span>
            <span><i className="fas fa-location-dot"></i> Namuswa Plaza Level 5, Wandegeya</span>
          </div>
        </header>
        <nav className='nav__container'>
          <NavLink to='/'>Home</NavLink>
          <NavLink to='/admin'>Admin Panel</NavLink>
          {isLoggedIn && <button onClick={handleLogout} className='logout__btn'>Logout</button>}
        </nav>
        <main className='main__box'>
          <Outlet />
        </main>
        <footer className='footer'>
          <p>&copy; {new Date().getFullYear()}</p>
          <div>
            <small className='small'>Built with Love by John Samula</small> <br />
            <small className='small'>Stack: React & Supabase</small>
          </div>
        </footer>
      </div>
    );
}
export default Layout;