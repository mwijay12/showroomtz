'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileDown, 
  Building2, 
  Car as CarIcon, 
  PieChart,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, SalesTransaction, ShowroomExpense } from '@/lib/types';
import { convertToCSV } from '@/lib/export';

export default function AdminReportsPage() {
  const db = useFirestore();
  const [cars, setCars] = useState<Car[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [expenses, setExpenses] = useState<ShowroomExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReportsData() {
      try {
        const snap = await getDocs(collection(db, 'cars'));
        if (isMounted) setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Car[]);
      } catch (e) {
        if (isMounted) setCars([]);
      }

      try {
        const snap = await getDocs(collection(db, 'sales_transactions'));
        if (isMounted) setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })) as SalesTransaction[]);
      } catch (e) {
        if (isMounted) setSales([]);
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

    loadReportsData();

    return () => {
      isMounted = false;
    };
  }, [db]);

  // Financial Calculations
  const activeStock = cars.filter(c => c.status === 'available');
  const inventoryValuationCost = activeStock.reduce((acc, c) => acc + (c.costPrice || c.price * 0.75), 0);
  const inventoryValuationAsking = activeStock.reduce((acc, c) => acc + (c.price || 0), 0);

  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
  const totalSalesCost = sales.reduce((acc, s) => acc + (s.costPrice || 0), 0);
  const totalDutyPaid = sales.reduce((acc, s) => acc + (s.importDutyCost || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const grossProfit = totalSalesRevenue - totalSalesCost;
  const netProfit = grossProfit - totalDutyPaid - totalExpenses;

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
            Financial & Inventory Reports
          </h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">
            Executive audit, profit & loss statement & inventory asset valuation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => convertToCSV(sales, 'full_financial_report')}
            className="rounded-2xl bg-primary text-white font-black text-xs uppercase"
          >
            <FileDown className="mr-2 h-4 w-4" /> Download Statement
          </Button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Cost Asset Value</span>
            <CarIcon size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-foreground">
            TSh {inventoryValuationCost.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-muted-foreground">
            Total Purchase Cost of {activeStock.length} Available Vehicles
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asking Stock Market Value</span>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-foreground">
            TSh {inventoryValuationAsking.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-emerald-500">
            Total Potential Asking Price Revenue
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cumulative Net Profit</span>
            <DollarSign size={20} className="text-primary" />
          </div>
          <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            TSh {netProfit.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-muted-foreground">
            Sales Revenue minus COGS, Duty & Operating Expenses
          </p>
        </Card>
      </div>

      {/* P&L BREAKDOWN SHEET */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-8">
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Statement of Profit & Loss (P&L)</h2>
          <p className="text-xs text-muted-foreground font-medium">Showroom financial performance breakdown</p>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex justify-between items-center py-2 text-sm font-bold">
            <span className="text-foreground">Total Sales Revenue (Vehicle Sales)</span>
            <span className="text-emerald-500 font-black">+ TSh {totalSalesRevenue.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-sm font-bold text-muted-foreground border-t border-border/40">
            <span>Cost of Vehicles Sold (COGS)</span>
            <span className="text-rose-400">- TSh {totalSalesCost.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-sm font-black text-foreground bg-muted/30 px-4 rounded-xl">
            <span>GROSS PROFIT</span>
            <span className="text-emerald-400">TSh {grossProfit.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-sm font-bold text-muted-foreground border-t border-border/40">
            <span>Import Customs Duty & TRA Taxes</span>
            <span className="text-rose-400">- TSh {totalDutyPaid.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-sm font-bold text-muted-foreground border-t border-border/40">
            <span>Showroom Operational Expenses (Rent, Salaries, Marketing)</span>
            <span className="text-rose-400">- TSh {totalExpenses.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-4 text-lg font-black text-foreground border-t-2 border-primary bg-primary/10 px-6 rounded-2xl">
            <span>NET SHOWROOM PROFIT / LOSS</span>
            <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}>
              TSh {netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
