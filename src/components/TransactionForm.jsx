import React, { useState } from 'react';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function TransactionForm() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('pengeluaran');
  const [category, setCategory] = useState('Makanan');
  const [isLoading, setIsLoading] = useState(false);
  
  const categories = ['Makanan', 'Transportasi', 'Hiburan', 'Tagihan', 'Gaji', 'Lainnya'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !amount) {
      return toast.error("Keterangan dan Jumlah harus diisi.");
    }
    setIsLoading(true);
    try {
      const collectionRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(collectionRef, {
        text,
        amount: Number(amount),
        type,
        category,
        createdAt: serverTimestamp(),
        author: {
          name: user.name,
          uid: user.uid
        }
      });
      
      toast.success("Transaksi berhasil ditambahkan!");
      setText('');
      setAmount('');
    } catch (error) {
      toast.error("Gagal menambahkan transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Tambah Transaksi Baru</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Keterangan" required className="w-full p-2 border rounded"/>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Jumlah (Rp)" required className="w-full p-2 border rounded"/>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded">
          <option value="pengeluaran">Pengeluaran</option>
          <option value="pemasukan">Pemasukan</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button type="submit" disabled={isLoading} className="w-full py-2 px-4 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400">
          {isLoading ? 'Menyimpan...' : 'Tambah Transaksi'}
        </button>
      </form>
    </div>
  );
}