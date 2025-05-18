// src/components/Signup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/lyramor.svg';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // optional: for cookies if needed
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Signup successful:', data);
        navigate('/login'); // redirect to login or dashboard
      } else {
        console.error('Signup failed:', data);
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-[#4A2C2C] flex items-center justify-center p-8'>
      <div className='text-white w-full text-center'>
        <img
          src={logo}
          alt='Lyramor Logo'
          className='h-24 sm:h-18 md:h-22 lg:h-22 xl:h-24 w-auto mx-auto mb-10'
        />
        <form onSubmit={handleSignup} className='flex flex-col items-center'>
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
            className='w-full sm:w-72 md:w-96 lg:w-[600px] xl:w-[700px] p-3 bg-[#FEFEA4] hover:bg-[#FFDC76] text-black font-bold border-2 border-black rounded-md mt-2'>
            Sign up
          </button>
        </form>
        <p className='mt-4 text-sm'>
          Already have an account?{' '}
          <Link to='/login' className='font-bold hover:underline text-white'>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
