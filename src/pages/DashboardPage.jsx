import React, { useState, useEffect } from 'react';
import { collectionGroup, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import DashboardCharts from '../components/DashboardCharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const transactionsQuery = query(collectionGroup(db, 'transactions'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      let results = [];
      snapshot.docs.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id });
      });
      setTransactions(results);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching transactions: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPemasukan = transactions.filter(t => t.type === 'pemasukan').reduce((acc, t) => acc + t.amount, 0);
  const totalPengeluaran = transactions.filter(t => t.type === 'pengeluaran').reduce((acc, t) => acc + t.amount, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-green-100 rounded-xl shadow">
            <h4 className="font-bold text-green-800">Total Pemasukan</h4>
            <p className="text-3xl font-semibold text-green-900">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
          </div>
          <div className="p-6 bg-red-100 rounded-xl shadow">
            <h4 className="font-bold text-red-800">Total Pengeluaran</h4>
            <p className="text-3xl font-semibold text-red-900">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
          </div>
          <div className="p-6 bg-blue-100 rounded-xl shadow">
            <h4 className="font-bold text-blue-800">Saldo Akhir</h4>
            <p className="text-3xl font-semibold text-blue-900">Rp {saldo.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {user?.role === 'Bendahara' && <TransactionForm />}
            <DashboardCharts transactions={transactions} />
          </div>
          <div className="lg:col-span-2">
            <TransactionList transactions={transactions} loading={loading} role={user?.role} />
          </div>
        </div>
      </div>
    </div>
  );
}