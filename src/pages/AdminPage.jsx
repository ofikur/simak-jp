import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth as primaryAuth } from '../firebase/config';
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

// Komponen Form untuk menambah user baru
function AddUserForm({ onUserAdded }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Anggota');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const secondaryAppConfig = { ...primaryAuth.app.options, name: 'Secondary' };
    let secondaryApp;
    try {
        secondaryApp = initializeApp(secondaryAppConfig, 'Secondary');
    } catch (error) {
        secondaryApp = initializeApp(secondaryAppConfig);
    }
    
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;

      const userDocRef = doc(db, 'users', newUser.uid);
      await setDoc(userDocRef, {
        name,
        email,
        role,
      });
      
      toast.success(`User ${name} berhasil dibuat!`);
      onUserAdded();
      setEmail('');
      setPassword('');
      setName('');
      setRole('Anggota');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Tambah Pengguna Baru</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Lengkap" required className="w-full p-2 border rounded"/>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 border rounded"/>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password Sementara" required className="w-full p-2 border rounded"/>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded">
          <option value="Anggota">Anggota</option>
          <option value="Bendahara">Bendahara</option>
          <option value="Administrator">Administrator</option>
        </select>
        <button type="submit" disabled={isLoading} className="w-full py-2 px-4 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400">
          {isLoading ? 'Menambahkan...' : 'Tambah Pengguna'}
        </button>
      </form>
    </div>
  );
}

// Komponen untuk menampilkan daftar user
function UserList({ users, onUserDeleted }) {
    const { user: currentUser } = useAuth();
    const handleDelete = async (userToDelete) => {
        if (userToDelete.uid === currentUser.uid) {
            toast.error("Anda tidak bisa menghapus akun Anda sendiri.");
            return;
        }
        if (!window.confirm(`Anda yakin ingin menghapus user ${userToDelete.name}? Tindakan ini tidak bisa dibatalkan.`)) return;

        try {
            await deleteDoc(doc(db, "users", userToDelete.uid));
            toast.success(`User ${userToDelete.name} berhasil dihapus dari daftar.`);
            onUserDeleted();
        } catch (error) {
            toast.error("Gagal menghapus user.");
            console.error("Error deleting user: ", error);
        }
    };
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Daftar Pengguna</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.uid}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                                        user.role === 'Bendahara' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Halaman Admin utama
export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const usersCollectionRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);
    const userList = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center p-10">Memuat data pengguna...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel Admin</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AddUserForm onUserAdded={fetchUsers} />
        </div>
        <div className="lg:col-span-2">
          <UserList users={users} onUserDeleted={fetchUsers} />
        </div>
      </div>
    </div>
  );
}