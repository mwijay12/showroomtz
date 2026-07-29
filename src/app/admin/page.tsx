'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { SEED_CARS } from '@/lib/showroom-seed';
import { 
  TrendingUp, 
  Car as CarIcon, 
  DollarSign, 
  ClipboardList, 
  Plus, 
  CreditCard, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  Phone,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Car, SalesTransaction, Inquiry, ShowroomExpense } from '@/lib/types';
import { AdminIntelligenceNode } from '@/components/admin/admin-intelligence-node';

export default function AdminDashboard() {
  const db = useFirestore();
  const [cars, setCars] = useState<Car[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expenses, setExpenses] = useState<ShowroomExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminDashboardData() {
      try {
        const snap = await getDocs(collection(db, 'cars'));
        if (isMounted) {
          if (!snap.empty) {
            setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Car[]);
          } else {
            setCars(SEED_CARS as Car[]);
          }
        }
      } catch (e) {
        if (isMounted) setCars(SEED_CARS as Car[]);
      }

      try {
        const snap = await getDocs(collection(db, 'sales_transactions'));
        if (isMounted) setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })) as SalesTransaction[]);
      } catch (e) {
        if (isMounted) setSales([]);
      }

      try {
        const snap = await getDocs(collection(db, 'inquiries'));
        if (isMounted) setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Inquiry[]);
      } catch (e) {
        if (isMounted) setInquiries([]);
      }

      try {
        const snap = await getDocs(collection(db, 'expenses'));
        if (isMounted) setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ShowroomExpense[]);
      } catch (e) {
        if (isMounted) setExpenses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdminDashboardData();

    return () => {
      isMounted = false;
    };
  }, [db]);

  // Aggregates
  const availableCars = cars.filter(c => c.status === 'available');
  const inventoryValuation = availableCars.reduce((acc, c) => acc + (c.price || 0), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
  const totalNetProfit = sales.reduce((acc, s) => acc + (s.netProfit || 0), 0) - expenses.reduce((a, b) => a + (b.amount || 0), 0);
  const newLeadsCount = inquiries.filter(i => i.status === 'new' || i.status === 'scheduled').length;

  return (
    <div className="space-y-10 pb-20">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
            Showroom Command Center
          </h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">
            Real-time inventory intelligence, sales revenue & profit control
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AdminIntelligenceNode />
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/finances">
          <Button className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase shadow-lg shadow-emerald-500/20">
            <Plus className="mr-2 h-4 w-4" /> Record Vehicle Sale
          </Button>
        </Link>
        <Link href="/admin/cars">
          <Button variant="outline" className="rounded-2xl border-border font-bold text-xs uppercase">
            <CarIcon className="mr-2 h-4 w-4 text-primary" /> Add New Car Stock
          </Button>
        </Link>
        <Link href="/admin/expenses">
          <Button variant="outline" className="rounded-2xl border-border font-bold text-xs uppercase">
            <CreditCard className="mr-2 h-4 w-4 text-rose-500" /> Record Expense
          </Button>
        </Link>
        <Link href="/admin/inquiries">
          <Button variant="outline" className="rounded-2xl border-border font-bold text-xs uppercase">
            <ClipboardList className="mr-2 h-4 w-4 text-amber-500" /> View Buyer Leads ({newLeadsCount})
          </Button>
        </Link>
      </div>

      {/* STATS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Stock</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CarIcon size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            {availableCars.length} Vehicles
          </p>
          <p className="text-[9px] font-black uppercase text-emerald-500 mt-2">
            Market Value: TSh {inventoryValuation.toLocaleString()}
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Sales Revenue</span>
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            TSh {totalSalesRevenue.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-blue-500 mt-2">
            {sales.length} Closed Deals
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Net Showroom Profit</span>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className={`text-3xl font-black mt-4 tracking-tight ${totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            TSh {totalNetProfit.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-muted-foreground mt-2">
            Sales Margin minus Costs & Expenses
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Inquiries</span>
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            {inquiries.length} Leads
          </p>
          <p className="text-[9px] font-black uppercase text-amber-500 mt-2">
            {newLeadsCount} Action Required
          </p>
        </Card>
      </div>

      {/* RECENT SALES & RECENT LEADS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT VEHICLE SALES */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Recent Sales Ledger</h2>
              <p className="text-xs text-muted-foreground">Latest vehicle sales and profit per vehicle</p>
            </div>
            <Link href="/admin/finances">
              <Button size="sm" variant="ghost" className="text-xs font-bold uppercase text-primary">
                View Ledger <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {sales.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center uppercase font-bold">No sales recorded yet</p>
            ) : (
              sales.slice(0, 5).map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-black text-foreground text-xs uppercase">{s.carName}</p>
                    <p className="text-[10px] text-muted-foreground">Buyer: {s.buyerName} ({s.buyerPhone})</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground text-xs">TSh {(s.salePrice || 0).toLocaleString()}</p>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] uppercase mt-1">
                      +TSh {(s.netProfit || 0).toLocaleString()} Profit
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT BUYER LEADS */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Incoming Buyer Leads</h2>
              <p className="text-xs text-muted-foreground">Customer inquiries & test drive requests</p>
            </div>
            <Link href="/admin/inquiries">
              <Button size="sm" variant="ghost" className="text-xs font-bold uppercase text-primary">
                All Leads <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {inquiries.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center uppercase font-bold">No inquiries received yet</p>
            ) : (
              inquiries.slice(0, 5).map((inq) => (
                <div key={inq.id} className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-black text-foreground text-xs uppercase">{inq.carName}</p>
                    <p className="text-[10px] text-muted-foreground">{inq.buyerName} • {inq.buyerPhone}</p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500 border-none font-bold text-[9px] uppercase">
                    {inq.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
