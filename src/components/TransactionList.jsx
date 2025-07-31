import React from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TransactionList({ transactions, loading, role }) {
  const { user } = useAuth();

  const handleDelete = async (transaction) => {
    if (!window.confirm("Anda yakin ingin menghapus transaksi ini?")) return;
    
    const docRef = doc(db, 'users', transaction.author.uid, 'transactions', transaction.id);
    try {
      await deleteDoc(docRef);
      toast.success("Transaksi berhasil dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus transaksi.");
    }
  };

  if (loading) {
    return <div className="text-center p-10">Memuat transaksi...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-center p-10 bg-white rounded-lg shadow-md">Belum ada transaksi.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Riwayat Transaksi</h3>
      <ul className="space-y-3">
        {transactions.map(trans => (
          <li key={trans.id} className="flex justify-between items-center p-3 rounded-lg border hover:shadow-sm transition-shadow">
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{trans.text}</p>
              <p className="text-sm text-gray-500">{trans.category} - {trans.createdAt ? format(trans.createdAt.toDate(), 'dd MMM yyyy') : ''}</p>
            </div>
            <div className={`font-bold text-lg ${trans.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
              {trans.type === 'pemasukan' ? '+' : '-'} Rp {trans.amount.toLocaleString('id-ID')}
            </div>
            {role === 'Bendahara' && (
              <button onClick={() => handleDelete(trans)} className="ml-4 text-gray-400 hover:text-red-600 text-2xl leading-none">&times;</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}