'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Filter, 
  PieChart, 
  Calendar, 
  Building2, 
  Receipt,
  FileDown
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
import { ShowroomExpense, ExpenseCategory } from '@/lib/types';
import { convertToCSV } from '@/lib/export';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  showroom_rent: "Showroom Rent",
  salaries: "Staff Salaries & Commissions",
  import_duty: "Import Duty & TRA Taxes",
  vehicle_refurbishment: "Vehicle Servicing & Paintwork",
  marketing: "Advertising & Social Media",
  utilities: "Electricity, Water & Internet",
  maintenance: "Facility Maintenance",
  licenses_permits: "Business Licenses & Permits",
  other: "Miscellaneous Expenses"
};

export default function AdminExpensesPage() {
  const db = useFirestore();
  const [expenses, setExpenses] = useState<ShowroomExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<ExpenseCategory>('showroom_rent');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadExpenses() {
      try {
        const snap = await getDocs(collection(db, 'expenses'));
        if (isMounted) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ShowroomExpense[];
          setExpenses(list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (e) {
        if (isMounted) setExpenses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadExpenses();

    return () => {
      isMounted = false;
    };
  }, [db]);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        showroomId: 'main-showroom',
        title,
        amount,
        currency: 'TZS',
        category,
        date,
        notes,
        recordedBy: 'Admin',
        createdAt: serverTimestamp(),
      });

      setIsAddModalOpen(false);
      setTitle('');
      setAmount(0);
      setNotes('');
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteExpense(id: string) {
    if (confirm("Are you sure you want to delete this expense record?")) {
      await deleteDoc(doc(db, 'expenses', id));
    }
  }

  const filteredExpenses = selectedCategoryFilter === 'all'
    ? expenses
    : expenses.filter(e => e.category === selectedCategoryFilter);

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
            Showroom Expense Tracker
          </h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">
            Monitor operational costs, showroom rent, salaries, import taxes and refurbishments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => convertToCSV(expenses, 'showroom_expenses')}
            variant="outline" 
            className="rounded-2xl border-border font-bold text-xs uppercase"
          >
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Record New Expense
          </Button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Expenses Recorded</span>
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            TSh {totalExpenseAmount.toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-muted-foreground mt-2">
            {filteredExpenses.length} Expense entries
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Expense Category</span>
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <PieChart size={20} />
            </div>
          </div>
          <p className="text-xl font-black text-foreground mt-4 tracking-tight">
            Showroom Rent & Salaries
          </p>
          <p className="text-[9px] font-black uppercase text-blue-500 mt-2">
            Fixed Monthly Operations
          </p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tax & Duty Record</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Receipt size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-4 tracking-tight">
            TSh {expenses.filter(e => e.category === 'import_duty').reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
          <p className="text-[9px] font-black uppercase text-emerald-500 mt-2">
            Customs Clearance Paid
          </p>
        </Card>
      </div>

      {/* EXPENSE TABLE */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Expense Receipts</h2>
            <p className="text-xs text-muted-foreground">Detailed log of all financial disbursements</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="rounded-2xl border border-border bg-background p-2.5 text-xs font-bold text-foreground"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <option key={cat} value={cat}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30">
                <th className="py-4 px-4">Expense Title</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Amount (TSh)</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Notes</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs uppercase font-bold tracking-wider">
                    {loading ? "Loading expenses..." : "No expense items found."}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-black text-foreground uppercase text-xs">
                      {exp.title}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className="bg-muted text-foreground border-border font-bold text-[9px] uppercase">
                        {CATEGORY_LABELS[exp.category] || exp.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-black text-rose-500">
                      -TSh {(exp.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {exp.date}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {exp.notes || "—"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE DIALOG */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-foreground">Record Expense</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter the operational or vehicle expense details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Expense Title *</label>
              <Input
                required
                placeholder="e.g. Showroom Rent - July 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border-border bg-background text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground"
              >
                {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                  <option key={cat} value={cat}>{label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Amount (TSh) *</label>
                <Input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="rounded-2xl border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Date *</label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-2xl border-border bg-background text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Notes / Reference</label>
              <Input
                placeholder="e.g. Receipt #994812"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-2xl border-border bg-background text-xs font-medium"
              />
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-2xl">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase"
              >
                {isSubmitting ? "Saving..." : "Save Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
