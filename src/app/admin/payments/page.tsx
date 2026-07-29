'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Receipt, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

type Sale = {
  id: string;
  carId: string;
  carName?: string;
  showroomName?: string;
  buyerName?: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: any;
};

export default function SalesLedgerPage() {
  const db = useFirestore();
  const salesQuery = useMemo(() => query(collection(db, 'sales'), orderBy('createdAt', 'desc')), [db]);
  const { data: sales, loading } = useCollection<Sale>(salesQuery as any);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return sales ?? [];
    const q = search.toLowerCase();
    return (sales ?? []).filter((s) =>
      [s.carName, s.buyerName, s.showroomName].filter(Boolean).some((f) => String(f).toLowerCase().includes(q))
    );
  }, [sales, search]);

  const stats = useMemo(() => {
    const all = sales ?? [];
    const total = all.reduce((sum, s) => sum + (s.amount || 0), 0);
    const completed = all.filter((s) => s.status === 'completed').reduce((sum, s) => sum + (s.amount || 0), 0);
    const pending = all.filter((s) => s.status === 'pending').length;
    return { total, completed, pending, count: all.length };
  }, [sales]);

  const formatTSh = (n: number) => `TSh ${(n / 1_000_000).toFixed(1)}M`;

  return (
    <div className="space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Sales & Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">Track completed sales and pending transactions across all showrooms.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="text-primary" size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
            </div>
            <div className="text-xl font-black">{stats.count}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Transactions</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-emerald-400" size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Volume</span>
            </div>
            <div className="text-xl font-black">{formatTSh(stats.total)}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">All-time</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="text-emerald-400" size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Closed</span>
            </div>
            <div className="text-xl font-black">{formatTSh(stats.completed)}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Revenue</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-amber-400" size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Pending</span>
            </div>
            <div className="text-xl font-black">{stats.pending}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">In progress</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sales…"
          className="pl-12 h-12 bg-card border-border rounded-2xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={32} /></div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border rounded-3xl">
          <CardContent className="p-20 flex flex-col items-center text-center">
            <Receipt size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-black uppercase mb-2">No sales yet</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Once a buyer completes a purchase, the sale will be recorded here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((s) => (
            <Card key={s.id} className="bg-card border-border rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-black text-sm">{s.carName || 'Vehicle'}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {s.buyerName && `Buyer: ${s.buyerName}`}
                    {s.showroomName && ` • ${s.showroomName}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-500">{formatTSh(s.amount || 0)}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s.status}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
