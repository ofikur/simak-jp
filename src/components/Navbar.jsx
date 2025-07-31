import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout berhasil!');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal logout.');
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold text-blue-600">AplikasiKas</NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>Dashboard</NavLink>
              {user?.role === 'Administrator' && (
                <NavLink to="/admin" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>Admin</NavLink>
              )}
               <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-red-500 hover:text-white">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}