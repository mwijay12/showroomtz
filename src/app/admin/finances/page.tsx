'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  FileDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Car as CarIcon,
  User,
  Phone,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { convertToCSV } from '@/lib/export';
import { Car, SalesTransaction, ShowroomExpense } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminFinancesPage() {
  const db = useFirestore();
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [expenses, setExpenses] = useState<ShowroomExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);

  // New Sale Form state
  const [selectedCarId, setSelectedCarId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerNIN, setBuyerNIN] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<SalesTransaction['paymentMethod']>('Bank Transfer');
  const [paymentStatus, setPaymentStatus] = useState<SalesTransaction['paymentStatus']>('paid');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFinancesData() {
      try {
        const snap = await getDocs(collection(db, 'sales_transactions'));
        if (isMounted) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SalesTransaction[];
          setSales(list.sort((a: any, b: any) => (b.saleDate?.seconds || 0) - (a.saleDate?.seconds || 0)));
        }
      } catch (e) {
        if (isMounted) setSales([]);
      }

      try {
        const snap = await getDocs(query(collection(db, 'cars'), where('status', '==', 'available')));
        if (isMounted) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Car[];
          setAvailableCars(list);
        }
      } catch (e) {
        if (isMounted) setAvailableCars([]);
      }

      try {
        const snap = await getDocs(collection(db, 'expenses'));
        if (isMounted) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ShowroomExpense[];
          setExpenses(list);
        }
      } catch (e) {
        if (isMounted) setExpenses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFinancesData();

    return () => {
      isMounted = false;
    };
  }, [db]);

  // Financial aggregates
  const totalRevenue = sales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
  const totalCOGS = sales.reduce((acc, s) => acc + (s.costPrice || 0), 0);
  const totalImportDuties = sales.reduce((acc, s) => acc + (s.importDutyCost || 0), 0);
  const totalRepairs = sales.reduce((acc, s) => acc + (s.repairCost || 0), 0);
  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  
  const totalNetProfit = sales.reduce((acc, s) => acc + (s.netProfit || 0), 0) - totalOperatingExpenses;
  const avgProfitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

  // Selected Car in Sale Modal calculation preview
  const selectedCar = availableCars.find(c => c.id === selectedCarId);
  const calculatedGrossProfit = selectedCar ? (salePrice || 0) - (selectedCar.costPrice || selectedCar.price * 0.75) : 0;
  const estimatedDuty = selectedCar?.importDutyCost || 0;
  const estimatedRepair = selectedCar?.repairCost || 0;
  const calculatedNetProfit = calculatedGrossProfit - estimatedDuty - estimatedRepair;

  async function handleRecordSale(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCar) return;

    setIsSubmitting(true);
    try {
      const costPrice = selectedCar.costPrice || Math.round(selectedCar.price * 0.75);
      const dutyCost = selectedCar.importDutyCost || 0;
      const repairCost = selectedCar.repairCost || 0;
      const grossProfit = salePrice - costPrice;
      const netProfit = grossProfit - dutyCost - repairCost;
      const balanceDue = Math.max(0, salePrice - amountPaid);

      const saleData: Omit<SalesTransaction, 'id'> = {
        carId: selectedCar.id,
        carName: `${selectedCar.make} ${selectedCar.model} (${selectedCar.year})`,
        make: selectedCar.make,
        model: selectedCar.model,
        year: selectedCar.year,
        vin: selectedCar.vin || '',
        showroomId: selectedCar.showroomId || 'default-showroom',
        showroomName: selectedCar.showroomName || 'Main Showroom',
        buyerName,
        buyerPhone,
        buyerEmail,
        buyerNIN,
        salePrice,
        costPrice,
        importDutyCost: dutyCost,
        repairCost: repairCost,
        otherExpenses: 0,
        grossProfit,
        netProfit,
        currency: selectedCar.currency || 'TZS',
        paymentStatus: balanceDue === 0 ? 'paid' : (amountPaid > 0 ? 'installment' : 'deposit_only'),
        amountPaid,
        balanceDue,
        paymentMethod,
        notes,
        saleDate: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      // 1. Add to sales_transactions
      await addDoc(collection(db, 'sales_transactions'), saleData);

      // 2. Mark car status as sold
      await updateDoc(doc(db, 'cars', selectedCar.id), {
        status: 'sold',
        available: false,
        soldAt: serverTimestamp(),
        soldPrice: salePrice,
        updatedAt: serverTimestamp(),
      });

      setIsRecordSaleOpen(false);
      // Reset form
      setSelectedCarId('');
      setBuyerName('');
      setBuyerPhone('');
      setBuyerEmail('');
      setBuyerNIN('');
      setSalePrice(0);
      setAmountPaid(0);
    } catch (err) {
      console.error("Error recording vehicle sale:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredSales = sales.filter(s => 
    s.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.buyerPhone.includes(searchTerm) ||
    s.vin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
            Sales & Financial Ledger
          </h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">
            Vehicle sales, profit margins, cost of goods sold & payment tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => convertToCSV(sales, 'showroom_sales_ledger')}
            variant="outline" 
            className="rounded-2xl border-border font-bold text-xs uppercase"
          >
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button 
            onClick={() => setIsRecordSaleOpen(true)}
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Record Vehicle Sale
          </Button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gross Sales Revenue</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            TSh {totalRevenue.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-emerald-500 mt-2 flex items-center gap-1">
            <Zap size={12} /> {sales.length} Vehicles Sold
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Cost (COGS)</span>
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CarIcon size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            TSh {totalCOGS.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-muted-foreground mt-2">
            Purchase + Import Duty Total
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Net Showroom Profit</span>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className={`text-3xl font-black mt-4 tracking-tight ${totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            TSh {totalNetProfit.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-emerald-500 mt-2">
            Margin: {avgProfitMargin.toFixed(1)}%
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operating Expenses</span>
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            TSh {totalOperatingExpenses.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-rose-500 mt-2">
            Rent, Salaries & Refurbishment
          </p>
        </Card>
      </div>

      {/* SALES TRANSACTIONS TABLE */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Vehicle Sales Ledger</h2>
            <p className="text-xs text-muted-foreground">Recorded car transactions and individual profit margin audit</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicle, buyer, VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl border-border bg-background/50 text-xs font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30">
                <th className="py-4 px-4">Vehicle Details</th>
                <th className="py-4 px-4">Buyer Info</th>
                <th className="py-4 px-4">Sale Price</th>
                <th className="py-4 px-4">Cost & Duty</th>
                <th className="py-4 px-4">Net Profit</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground text-xs uppercase font-bold tracking-wider">
                    {loading ? "Loading transactions..." : "No vehicle sales transactions recorded yet."}
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-black text-foreground uppercase text-xs">{s.carName}</p>
                      {s.vin && <p className="text-[10px] text-muted-foreground font-mono">VIN: {s.vin}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-foreground text-xs">{s.buyerName}</p>
                      <p className="text-[10px] text-muted-foreground">{s.buyerPhone}</p>
                    </td>
                    <td className="py-4 px-4 font-black text-foreground">
                      TSh {(s.salePrice || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      <p>Cost: TSh {(s.costPrice || 0).toLocaleString()}</p>
                      {(s.importDutyCost || 0) > 0 && <p className="text-[10px] text-amber-500">Duty: TSh {s.importDutyCost?.toLocaleString()}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`font-black text-[10px] px-2.5 py-0.5 border-none uppercase ${
                        (s.netProfit || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        +TSh {(s.netProfit || 0).toLocaleString()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`font-bold text-[9px] uppercase border-none ${
                        s.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                        s.paymentStatus === 'installment' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {s.paymentStatus === 'paid' ? 'Paid in Full' : s.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground font-medium">
                      {s.paymentMethod}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {s.saleDate?.seconds ? format(new Date(s.saleDate.seconds * 1000), 'MMM dd, yyyy') : 'Recently'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD SALE DIALOG */}
      <Dialog open={isRecordSaleOpen} onOpenChange={setIsRecordSaleOpen}>
        <DialogContent className="max-w-2xl bg-card border-border rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-foreground">Record Vehicle Sale</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an available car from inventory, enter buyer details, agreed sale price, and payment terms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordSale} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Select Vehicle from Available Stock *
              </label>
              <select
                required
                value={selectedCarId}
                onChange={(e) => {
                  setSelectedCarId(e.target.value);
                  const car = availableCars.find(c => c.id === e.target.value);
                  if (car) {
                    setSalePrice(car.price);
                    setAmountPaid(car.price);
                  }
                }}
                className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose Vehicle --</option>
                {availableCars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.make} {c.model} ({c.year}) - Asking: TSh {c.price.toLocaleString()} [{c.condition}]
                  </option>
                ))}
              </select>
            </div>

            {selectedCar && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Vehicle Stock Cost:</span>
                  <span>TSh {(selectedCar.costPrice || selectedCar.price * 0.75).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Import Duty / Tax:</span>
                  <span>TSh {(selectedCar.importDutyCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-black border-t border-border pt-2 text-emerald-500">
                  <span>Est. Net Profit Margin:</span>
                  <span>+TSh {calculatedNetProfit.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Buyer Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Salim Said Hassan"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="rounded-2xl border-border bg-background text-xs font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Buyer Phone / WhatsApp *</label>
                <Input
                  required
                  placeholder="e.g. +255 754 000 111"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="rounded-2xl border-border bg-background text-xs font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Buyer Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="buyer@example.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="rounded-2xl border-border bg-background text-xs font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">National ID / NIN / Passport</label>
                <Input
                  placeholder="e.g. 19901234-56789-00001"
                  value={buyerNIN}
                  onChange={(e) => setBuyerNIN(e.target.value)}
                  className="rounded-2xl border-border bg-background text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Final Agreed Sale Price (TSh) *</label>
                <Input
                  type="number"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="rounded-2xl border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Amount Paid Today (TSh) *</label>
                <Input
                  type="number"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="rounded-2xl border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground"
                >
                  <option value="Bank Transfer">Bank Transfer (CRDB/NMB)</option>
                  <option value="Lipa kwa M-Pesa">Lipa kwa M-Pesa</option>
                  <option value="TigoPesa">TigoPesa / Airtel Money</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={() => setIsRecordSaleOpen(false)} className="rounded-2xl">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedCarId}
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase"
              >
                {isSubmitting ? "Recording..." : "Finalize & Mark Car Sold"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
