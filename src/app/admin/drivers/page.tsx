'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Building2, MapPin, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

type Showroom = {
  id: string;
  name: string;
  location: string;
  phone?: string;
  email?: string;
  vehicleCount?: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt?: any;
};

export default function ShowroomsPage() {
  const db = useFirestore();
  const showroomsQuery = useMemo(() => query(collection(db, 'showrooms'), orderBy('createdAt', 'desc')), [db]);
  const { data: showrooms, loading } = useCollection<Showroom>(showroomsQuery as any);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return showrooms ?? [];
    const q = search.toLowerCase();
    return (showrooms ?? []).filter((s) =>
      [s.name, s.location].filter(Boolean).some((f) => String(f).toLowerCase().includes(q))
    );
  }, [showrooms, search]);

  return (
    <div className="space-y-8 p-2">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Showroom Network</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all car dealers and showrooms on your platform.</p>
        </div>
        <Button className="h-11 px-5 bg-primary text-primary-foreground font-black uppercase text-[9px] tracking-widest rounded-xl">
          <Plus size={14} className="mr-2" /> Onboard Showroom
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search showrooms…"
          className="pl-12 h-12 bg-card border-border rounded-2xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={32} /></div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border rounded-3xl">
          <CardContent className="p-20 flex flex-col items-center text-center">
            <Building2 size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-black uppercase mb-2">No showrooms yet</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Onboard car dealers and showroom partners to start listing inventory on the platform.
            </p>
            <Button className="mt-6 h-11 px-6 bg-primary text-primary-foreground font-black uppercase text-[9px] tracking-widest rounded-xl">
              <Plus size={14} className="mr-2" /> Onboard First Showroom
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="bg-card border-border rounded-2xl hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="text-primary" size={22} />
                    </div>
                    <Badge className={`border-none text-[8px] font-black uppercase tracking-widest ${
                      s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400'
                        : s.status === 'pending' ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {s.status || 'active'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mb-1">{s.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
                    <MapPin size={11} /> {s.location}
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {s.vehicleCount ?? 0} vehicles
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black uppercase">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
