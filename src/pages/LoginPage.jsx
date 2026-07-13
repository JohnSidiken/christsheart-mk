import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
    setEmail('');
    setPassword('');
  }
  return (
      <div className='login__container'>
        <h1 className='chm__title'>Admin Login</h1>
        <form onSubmit={handleLogin} className='login__form'>
          <input 
            type='email'
            value={email}
            aria-label='Enter email'
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder='Enter email'
            autoFocus
            required
            className='login__input'
          />
          <input
            aria-label='Enter password'
            type='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder='Enter password'
            required
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