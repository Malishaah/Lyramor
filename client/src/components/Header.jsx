// src/components/Header.jsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { getSession } from '../api/userClient';
import logo from '../assets/lyramor.svg';

export default function Header() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
  });
  const session = sessionQuery.data;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, { withCredentials: true });
      queryClient.removeQueries({ queryKey: ['session'] });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { to: `/${session?.username || ''}`, label: 'Playlists', show: true },
    {
      to: '/admin/users',
      label: 'User Management',
      show: !!session?.isAdmin,
    },
    { to: '/songs', label: 'Songs', show: !!session },
    { to: '/genres', label: 'Genres', show: !!session },
  ];

  return (
    <header className='sticky top-0 z-50 bg-[#4A2C2C] dark:bg-gray-800 text-white'>
      <div className='max-w-7xl mx-auto flex items-center justify-between px-4 py-1'>
        <div className='flex items-center'>
          <img
            src={logo}
            alt='Lyramor Logo'
            className='h-12 sm:h-12 md:h-14 lg:h-18 w-auto'
          />
        </div>

        {/* Desktop nav */}
        <nav className='hidden md:flex items-center space-x-8'>
          {menuItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `font-bold ${
                    isActive ? 'text-[#FEFEA4]' : 'text-white'
                  } hover:text-[#FFDC76] transform transition-transform duration-150 hover:scale-110`
                }>
                {item.label}
              </NavLink>
            ))}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                handleLogout();
              }
            }}
            className='font-bold text-white hover:text-[#FFDC76] transform transition-transform duration-150 hover:scale-110'>
            Logout
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          className='md:hidden flex flex-col justify-center items-center w-8 h-8 focus:outline-none'
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label='Toggle menu'>
          {mobileOpen ? (
            <span className='text-2xl leading-none'>&times;</span>
          ) : (
            <>
              <span className='block w-full h-0.5 bg-[#FEFEA4] mb-2'></span>
              <span className='block w-full h-0.5 bg-[#FEFEA4] mb-2'></span>
              <span className='block w-full h-0.5 bg-[#FEFEA4]'></span>
            </>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className='md:hidden bg-[#4A2C2C]'>
          <nav className='flex flex-col space-y-2 px-4 py-1'>
            {menuItems
              .filter((item) => item.show)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `block font-bold ${
                      isActive ? 'text-[#FEFEA4]' : 'text-white'
                    } py-2 hover:text-[#FFDC76]`
                  }
                  onClick={() => setMobileOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  handleLogout();
                }
              }}
              className='font-bold text-white hover:text-[#FFDC76] transform transition-transform duration-150 hover:scale-110'>
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
