// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './views/components/login.jsx';
import Signup from './views/components/signup.jsx';
import Feed from './views/pages/Feed.jsx';
import UserManagement from './views/pages/UserManagement.jsx';
import SongsAdmin from './views/pages/SongsAdmin.jsx';
import GenresAdmin from './views/pages/GenresAdmin.jsx';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path='/:username' element={<Feed />} />
          <Route path='/admin/users' element={<UserManagement />} />
          <Route path='/register' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Login />} /> {/* Default route */}
          <Route path='/songs' element={<SongsAdmin />} />
          <Route path='/genres' element={<GenresAdmin />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
