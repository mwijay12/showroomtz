'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ClipboardList, 
  Phone, 
  MessageSquare, 
  Car as CarIcon, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  Search,
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Inquiry } from '@/lib/types';

const STATUS_CONFIG: Record<Inquiry['status'], { label: string; color: string }> = {
  new: { label: "New Lead", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  contacted: { label: "Contacted", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  negotiating: { label: "Price Offer / Negotiating", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  scheduled: { label: "Test Drive Scheduled", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  closed_won: { label: "Deal Closed (Sold)", color: "bg-emerald-500 text-white border-none" },
  closed_lost: { label: "Closed (Lost)", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

export default function AdminInquiriesPage() {
  const db = useFirestore();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadInquiries() {
      try {
        const snap = await getDocs(collection(db, 'inquiries'));
        if (isMounted) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Inquiry[];
          setInquiries(list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        }
      } catch (e) {
        if (isMounted) setInquiries([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInquiries();

    return () => {
      isMounted = false;
    };
  }, [db]);

  async function updateStatus(id: string, newStatus: Inquiry['status']) {
    await updateDoc(doc(db, 'inquiries', id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  }

  function getWhatsAppUrl(phone: string, carName: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Jambo! Habari gani kutoka Showroom? Regarding your inquiry about the ${carName}...`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  }

  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = 
      i.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.buyerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
            Buyer Leads & Inquiries
          </h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">
            Manage prospective buyer messages, test drive requests & price negotiations
          </p>
        </div>
      </div>

      {/* PIPELINE OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border rounded-3xl p-5 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Leads</span>
          <p className="text-3xl font-black text-blue-500 mt-2">
            {inquiries.filter(i => i.status === 'new').length}
          </p>
        </Card>
        <Card className="bg-card border-border rounded-3xl p-5 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Test Drives Scheduled</span>
          <p className="text-3xl font-black text-emerald-500 mt-2">
            {inquiries.filter(i => i.status === 'scheduled').length}
          </p>
        </Card>
        <Card className="bg-card border-border rounded-3xl p-5 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Negotiating / Offers</span>
          <p className="text-3xl font-black text-amber-500 mt-2">
            {inquiries.filter(i => i.status === 'negotiating').length}
          </p>
        </Card>
        <Card className="bg-card border-border rounded-3xl p-5 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deals Closed</span>
          <p className="text-3xl font-black text-purple-500 mt-2">
            {inquiries.filter(i => i.status === 'closed_won').length}
          </p>
        </Card>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search buyer name, phone, car model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl border-border bg-background text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className="rounded-2xl text-xs font-bold uppercase"
            >
              All ({inquiries.length})
            </Button>
            {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'default' : 'outline'}
                onClick={() => setStatusFilter(st)}
                className="rounded-2xl text-xs font-bold uppercase shrink-0"
              >
                {cfg.label}
              </Button>
            ))}
          </div>
        </div>

        {/* INQUIRIES LIST */}
        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              {loading ? "Loading inquiries..." : "No buyer inquiries found."}
            </div>
          ) : (
            filteredInquiries.map((inq) => (
              <div 
                key={inq.id}
                className="p-6 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge className={`font-black text-[9px] uppercase px-3 py-1 border ${STATUS_CONFIG[inq.status]?.color}`}>
                      {STATUS_CONFIG[inq.status]?.label || inq.status}
                    </Badge>
                    {inq.wantsTestDrive && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] uppercase">
                        Test Drive Requested
                      </Badge>
                    )}
                    {inq.offeredPrice && (
                      <Badge className="bg-amber-500/10 text-amber-500 border-none font-bold text-[9px] uppercase">
                        Offered TSh {inq.offeredPrice.toLocaleString()}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <CarIcon size={16} className="text-primary" />
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{inq.carName}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground bg-background p-3 rounded-xl border border-border/50">
                    "{inq.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium pt-1">
                    <span className="flex items-center gap-1.5 font-bold text-foreground">
                      <User size={14} className="text-muted-foreground" /> {inq.buyerName}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                      <Phone size={14} /> {inq.buyerPhone}
                    </span>
                    {inq.buyerEmail && <span>{inq.buyerEmail}</span>}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                  <a
                    href={getWhatsAppUrl(inq.buyerPhone, inq.carName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                  >
                    <MessageSquare size={14} className="mr-2 fill-current" /> WhatsApp Buyer
                  </a>

                  <select
                    value={inq.status}
                    onChange={(e) => updateStatus(inq.id, e.target.value as Inquiry['status'])}
                    className="rounded-2xl border border-border bg-background p-2.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
                      <option key={st} value={st}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
