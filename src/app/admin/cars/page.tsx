'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Car as CarIcon,
  TrendingDown,
  Star,
  Eye,
  Building2,
  CheckCircle2,
  PauseCircle,
  Archive,
  Trash2,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Car, ListingStatus } from '@/lib/types';
import { formatTSh } from '@/lib/utils';
import { SEED_CARS } from '@/lib/showroom-seed';
import { Sparkles, RefreshCw } from 'lucide-react';

import { getCustomCarsFromLocalStorage } from '@/lib/custom-cars-store';

const STATUS_META: Record<ListingStatus, { label: string; icon: any; color: string }> = {
  available: { label: 'Available', icon: CheckCircle2, color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  reserved:  { label: 'Reserved',  icon: PauseCircle,   color: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  sold:      { label: 'Sold',      icon: Archive,       color: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30' },
  draft:     { label: 'Draft',     icon: PauseCircle,   color: 'bg-slate-500/15 text-slate-500 border-slate-500/30' },
};

const CONDITION_STYLES: Record<string, string> = {
  'Brand New': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  'Foreign Used': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  'Locally Used': 'bg-violet-500/15 text-violet-500 border-violet-500/30',
  'Certified Pre-Owned': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
};

export default function AdminCarsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeDiscountCar, setActiveDiscountCar] = useState<Car | null>(null);
  const [newDiscountPrice, setNewDiscountPrice] = useState('');

  const carsQuery = useMemoFirebase(() => query(collection(db, 'cars'), limit(200)), [db]);
  const { data: rawCars, loading } = useCollection(carsQuery);

  const displayCars = useMemo(() => {
    const customCars = getCustomCarsFromLocalStorage();
    let baseCars: Car[] = (rawCars && rawCars.length > 0) ? (rawCars as Car[]) : (SEED_CARS as Car[]);
    const merged = [...baseCars];
    customCars.forEach(c => {
      const idx = merged.findIndex(m => m.id === c.id);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...c };
      } else {
        merged.unshift(c);
      }
    });
    return merged;
  }, [rawCars]);

  const filteredCars = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return displayCars
      .filter((c) =>
        statusFilter === 'all' ? true : c.status === statusFilter
      )
      .filter((c) =>
        term
          ? `${c.make} ${c.model} ${c.variant ?? ''} ${c.showroomName ?? ''}`
              .toLowerCase()
              .includes(term)
          : true
      )
      .sort((a, b) => {
        const aSec = a.createdAt?.seconds ?? 0;
        const bSec = b.createdAt?.seconds ?? 0;
        return bSec - aSec;
      });
  }, [displayCars, searchTerm, statusFilter]);

  const syncSeedCarsToFirebase = async () => {
    setIsSyncing(true);
    try {
      for (const car of SEED_CARS) {
        const ref = doc(db, 'cars', car.id);
        await setDoc(ref, {
          ...car,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      toast({
        title: "✨ Fleet Pushed to Firebase!",
        description: "All 9 vehicle listings uploaded to Firestore. You can now edit any car live.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Sync Protocol Error",
        description: e.message || "Failed to push seed cars to Firebase.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const stats = useMemo(() => {
    const all = displayCars;
    return {
      total: all.length,
      available: all.filter((c) => c.status === 'available').length,
      reserved: all.filter((c) => c.status === 'reserved').length,
      sold: all.filter((c) => c.status === 'sold').length,
      featured: all.filter((c) => c.featured).length,
      totalViews: all.reduce((sum, c) => sum + (c.views ?? 0), 0),
    };
  }, [displayCars]);

  const handleApplyDiscount = async () => {
    if (!activeDiscountCar || !newDiscountPrice) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'cars', activeDiscountCar.id), {
        discountPrice: Number(newDiscountPrice),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Offer price updated 🏷️' });
      setActiveDiscountCar(null);
      setNewDiscountPrice('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Sync failed' });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeDiscount = async (id: string) => {
    try {
      await updateDoc(doc(db, 'cars', id), {
        discountPrice: null,
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Offer revoked.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not clear offer' });
    }
  };

  const toggleStatus = async (car: Car) => {
    const next: ListingStatus = car.status === 'available' ? 'reserved' : 'available';
    try {
      await updateDoc(doc(db, 'cars', car.id), {
        status: next,
        available: next === 'available',
        updatedAt: serverTimestamp(),
      });
      toast({ title: `Status: ${STATUS_META[next].label}` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not update status' });
    }
  };

  const toggleFeatured = async (car: Car) => {
    try {
      await updateDoc(doc(db, 'cars', car.id), {
        featured: !car.featured,
        updatedAt: serverTimestamp(),
      });
      toast({ title: car.featured ? 'Removed from featured' : '⭐ Featured' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not update' });
    }
  };

  const deleteCar = async (car: Car) => {
    if (!confirm(`Delete ${car.make} ${car.model} (${car.year})? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'cars', car.id));
      toast({ title: 'Car deleted' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not delete' });
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
            <CarIcon size={11} /> Inventory Console
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
            Showroom Listings
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] mt-2">
            Manage cars across all partner showrooms
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={syncSeedCarsToFirebase}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-6 rounded-2xl shadow-2xl gap-2 font-black uppercase text-[10px] tracking-widest"
          >
            {isSyncing ? <RefreshCw className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {isSyncing ? 'Syncing...' : 'Sync Fleet to Firebase'}
          </Button>
          <Link href="/admin/showrooms">
            <Button variant="outline" className="h-14 px-6 rounded-2xl border-primary/20 text-primary gap-2 font-black uppercase text-[10px] tracking-widest">
              <Building2 size={16} /> Showrooms
            </Button>
          </Link>
          <Link href="/admin/cars/add">
            <Button className="bg-primary hover:bg-primary/90 text-white h-14 px-6 rounded-2xl shadow-2xl gap-2 font-black uppercase text-[10px] tracking-widest">
              <Plus size={20} /> Add Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, accent: 'text-foreground' },
          { label: 'Available', value: stats.available, accent: 'text-emerald-500' },
          { label: 'Reserved', value: stats.reserved, accent: 'text-amber-500' },
          { label: 'Sold', value: stats.sold, accent: 'text-zinc-500' },
          { label: 'Featured', value: stats.featured, accent: 'text-primary' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), accent: 'text-foreground' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className={cn('text-2xl font-black mt-1 tabular-nums', s.accent)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center gap-4 bg-muted/20">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by make, model, or showroom..."
              className="pl-14 h-12 rounded-2xl bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'available', 'reserved', 'sold', 'draft'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-4 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32 pl-8 py-5 uppercase text-[9px] font-black text-muted-foreground">Car</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground">Details</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground">Showroom</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground">Price</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground">Status</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="p-6">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-16 text-center">
                    <CarIcon size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No cars match your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCars.map((car) => {
                  const status = STATUS_META[car.status ?? 'available'];
                  const StatusIcon = status.icon;
                  const condClass = CONDITION_STYLES[car.condition] ?? 'bg-muted text-muted-foreground border-border';
                  return (
                    <TableRow key={car.id} className="group hover:bg-primary/5 transition-all border-border">
                      <TableCell className="pl-8 py-5">
                        <div className="relative h-16 w-24 rounded-2xl overflow-hidden bg-muted border border-border">
                          <Image
                            src={car.images?.[0] ?? 'https://picsum.photos/seed/car/200/150'}
                            alt={`${car.make} ${car.model}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-black text-foreground text-sm tracking-tight leading-tight">
                          {car.make} {car.model}
                          {car.variant && <span className="text-muted-foreground font-medium"> · {car.variant}</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className={cn('text-[9px] font-black uppercase border', condClass)}>
                            {car.condition}
                          </Badge>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            {car.year} · {car.mileage?.toLocaleString() ?? 0} km
                          </span>
                          {car.featured && (
                            <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] font-black uppercase">
                              ⭐ Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye size={10} />{car.views ?? 0}</span>
                          <span className="flex items-center gap-1"><Star size={10} className="fill-amber-500 text-amber-500" />{car.rating?.toFixed(1) ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold text-foreground">{car.showroomName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{car.location}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p
                            className={cn(
                              'text-sm font-black tabular-nums',
                              car.discountPrice ? 'line-through opacity-40' : 'text-foreground'
                            )}
                          >
                            {formatTSh(car.price ?? 0, car.currency ?? 'TZS')}
                          </p>
                          {car.discountPrice && (
                            <p className="text-sm font-black text-emerald-500 tabular-nums">
                              {formatTSh(car.discountPrice, car.currency ?? 'TZS')}
                            </p>
                          )}
                          {car.monthlyEstimate && (
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                              ~{formatTSh(car.monthlyEstimate, 'TZS')}/mo
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-[9px] font-black uppercase border gap-1', status.color)}>
                          <StatusIcon size={10} /> {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFeatured(car)}
                            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary"
                            title={car.featured ? 'Unfeature' : 'Feature'}
                          >
                            <Star size={14} className={car.featured ? 'fill-primary text-primary' : ''} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStatus(car)}
                            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary"
                            title="Toggle status"
                          >
                            <StatusIcon size={14} />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => {
                                  setActiveDiscountCar(car);
                                  setNewDiscountPrice(car.discountPrice?.toString() ?? '');
                                }}
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl text-emerald-500 hover:bg-emerald-500/10"
                                title="Set offer"
                              >
                                <TrendingDown size={14} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border rounded-3xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase">Set Offer Price</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-5 py-4">
                                <p className="text-sm text-muted-foreground">
                                  {car.make} {car.model} {car.year} · Current:{' '}
                                  <span className="font-black text-foreground">
                                    {formatTSh(car.price ?? 0, car.currency ?? 'TZS')}
                                  </span>
                                </p>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-primary tracking-widest">
                                    New Asking Price ({car.currency})
                                  </label>
                                  <Input
                                    type="number"
                                    value={newDiscountPrice}
                                    onChange={(e) => setNewDiscountPrice(e.target.value)}
                                    placeholder="e.g. 270000000"
                                    className="h-14 bg-muted border-none font-black text-xl"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    onClick={handleApplyDiscount}
                                    disabled={isUpdating}
                                    className="flex-1 h-14 bg-primary text-white font-black uppercase text-[10px] tracking-widest"
                                  >
                                    Commit Offer
                                  </Button>
                                  {car.discountPrice && (
                                    <Button
                                      onClick={() => removeDiscount(car.id)}
                                      variant="ghost"
                                      className="text-red-500 text-[10px] font-black uppercase"
                                    >
                                      Clear
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Link href={`/admin/cars/edit/${car.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCar(car)}
                            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
