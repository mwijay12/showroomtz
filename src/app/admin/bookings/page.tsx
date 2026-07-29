'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Inbox, Mail, Phone, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Inquiry = {
  id: string;
  carId: string;
  carName?: string;
  showroomId?: string;
  showroomName?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt?: any;
};

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  closed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function InquiriesPage() {
  const db = useFirestore();
  const router = useRouter();
  const inquiriesQuery = useMemo(() => query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')), [db]);
  const { data: inquiries, loading } = useCollection<Inquiry>(inquiriesQuery as any);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');

  const filtered = useMemo(() => {
    return (inquiries ?? []).filter((i) => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return [i.name, i.email, i.carName, i.showroomName, i.message]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q));
    });
  }, [inquiries, search, statusFilter]);

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error('Failed to update inquiry', e);
    }
  };

  const counts = useMemo(() => {
    const all = inquiries ?? [];
    return {
      all: all.length,
      new: all.filter((i) => i.status === 'new').length,
      contacted: all.filter((i) => i.status === 'contacted').length,
      closed: all.filter((i) => i.status === 'closed').length,
    };
  }, [inquiries]);

  return (
    <div className="space-y-8 p-2">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Buyer Inquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">All buyer messages from your showroom listings.</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'new', 'contacted', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              {s} <span className="opacity-50 ml-1">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by buyer, car, showroom…"
          className="pl-12 h-12 bg-card border-border rounded-2xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={32} /></div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border rounded-3xl">
          <CardContent className="p-20 flex flex-col items-center text-center">
            <Inbox size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-black uppercase mb-2">No inquiries yet</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              When buyers send messages about your vehicles, they'll appear here. Make sure your listings are published and visible.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((inq, idx) => (
            <motion.div
              key={inq.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card className="bg-card border-border rounded-2xl hover:border-primary/30 transition-all group">
                <CardContent className="p-5 flex items-center gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-black text-base truncate">{inq.name}</span>
                      <span className={`px-2 h-5 inline-flex items-center rounded-md text-[8px] font-black uppercase tracking-widest border ${STATUS_STYLES[inq.status] || STATUS_STYLES.new}`}>
                        {inq.status || 'new'}
                      </span>
                      {inq.carName && (
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest">
                          {inq.carName}
                        </Badge>
                      )}
                      {inq.showroomName && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                          via {inq.showroomName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground mb-2">
                      <span className="flex items-center gap-1.5"><Mail size={11} />{inq.email}</span>
                      {inq.phone && <span className="flex items-center gap-1.5"><Phone size={11} />{inq.phone}</span>}
                      {inq.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={11} />
                          {inq.createdAt?.toDate ? inq.createdAt.toDate().toLocaleDateString() : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">{inq.message}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    {inq.status === 'new' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(inq.id, 'contacted')} className="h-8 text-[9px] font-black uppercase">
                        Mark Contacted
                      </Button>
                    )}
                    {inq.status === 'contacted' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(inq.id, 'closed')} className="h-8 text-[9px] font-black uppercase">
                        Close
                      </Button>
                    )}
                    {inq.carId && (
                      <Link href={`/cars/${inq.carId}`}>
                        <Button size="sm" variant="ghost" className="h-8 text-[9px] font-black uppercase gap-1">
                          View Car <ChevronRight size={12} />
                        </Button>
                      </Link>
                    )}
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
