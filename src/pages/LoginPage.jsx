import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password required!');
      return;
    }
    const success = login(password.trim());
    if (success) {
      navigate('/admin', { replace: true });
    } else {
      setError('Wrong Password! Try Again!');
      setPassword('');
    }
  }
  return (
      <div className='login__container'>
        <h1 className='chm__title'>Admin Login</h1>
        <form onSubmit={handleLogin} className='login__form'>
          <input
            type='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder='Enter password'
            className='login__input'
          />
          <button type='submit' className='login__btn'>Login</button>
          <button type='button' onClick={() => navigate('/', { replace: true })} className='login__exit'>‹‹‹ Back</button>
        </form>
        {error && <div className='error'>{error}</div>}
      </div>
    );
} 
export default Login;