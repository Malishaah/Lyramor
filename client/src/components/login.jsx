// src/components/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/userClient';
import logo from '../assets/lyramor.svg';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(username, password);
      console.log('Login success:', user);
      navigate(user.isAdmin ? '/admin' : `/${user.username}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className='min-h-screen bg-[#9767FF] flex items-center justify-center p-8'>
      <div className='text-white w-full text-center'>
        <div className='text-4xl font-bold mb-6'>
          <img
            src={logo}
            alt='Mimsy Logo'
            className='h-36 sm:h-24 md:h-32 lg:h-40 xl:h-44 w-auto mx-auto mb-6'
          />
        </div>
        <form onSubmit={handleLogin} className='flex flex-col items-center'>
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className='w-full sm:w-72 md:w-96 lg:w-[600px] xl:w-[700px] p-3 mb-4 border-2 border-black rounded-md text-black'
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full sm:w-72 md:w-96 lg:w-[600px] xl:w-[700px] p-3 mb-4 border-2 border-black rounded-md text-black'
          />
          <button
            type='submit'
            className='w-full sm:w-72 md:w-96 lg:w-[600px] xl:w-[700px] p-3 bg-[#ffafcc] hover:bg-[#ffbcd9] text-black font-bold border-2 border-black rounded-md mt-2'>
            Log in
          </button>
        </form>
        <p className='mt-4 text-sm'>
          Don’t have an account?{' '}
          <Link to='/register' className='font-bold hover:underline text-white'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
