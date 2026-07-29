'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CarCard from '@/components/fleet/car-card';
import { formatTSh } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getCustomCarsFromLocalStorage } from '@/lib/custom-cars-store';

import { SEED_CARS } from '@/lib/showroom-seed';

export default function CarsListingPage() {
  const db = useFirestore();
  const [search, setSearch] = useState('');
  const [bodyType, setBodyType] = useState<string>('all');
  const [make, setMake] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
  const [priceMax, setPriceMax] = useState<string>('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const carsQuery = useMemoFirebase(
    () => query(collection(db, 'cars'), where('status', '==', 'available'), limit(60)),
    [db]
  );
  const { data: rawCars, loading } = useCollection<any>(carsQuery as any);

  const cars = useMemo(() => {
    const customCars = getCustomCarsFromLocalStorage();
    let baseCars: any[] = (rawCars && rawCars.length > 0) ? rawCars : SEED_CARS;
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

  const filtered = useMemo(() => {
    if (!cars) return [];
    let list = [...cars];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) =>
        [c.title, c.make, c.model, c.showroomName].join(' ').toLowerCase().includes(s)
      );
    }
    if (bodyType !== 'all') list = list.filter((c) => c.bodyType === bodyType);
    if (make !== 'all') list = list.filter((c) => c.make === make);
    if (priceMax) {
      const max = Number(priceMax);
      list = list.filter((c) => Number(c.price ?? 0) <= max);
    }
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)); break;
      case 'price-desc': list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0)); break;
    }
    return list;
  }, [cars, search, bodyType, make, sortBy, priceMax]);

  const makes = useMemo(() => {
    if (!cars) return [] as string[];
    return Array.from(new Set(cars.map((c: any) => c.make).filter(Boolean))).sort() as string[];
  }, [cars]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-12 border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <Badge variant="outline" className="text-[10px] font-black tracking-[0.3em] uppercase">
              <Sparkles className="w-3 h-3 mr-1" /> Premium Showroom
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              The <span className="text-primary italic">Registry</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Verified vehicles from Tanzania&apos;s most trusted dealers and private showrooms. Browse, compare, inquire.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur border-b border-border/40 py-3 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Filter Bar (Search + Filter Toggle) */}
          <div className="flex md:hidden items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search make, model, showroom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-muted border-border text-xs"
              />
            </div>

            <Button
              variant={mobileFilterOpen || (bodyType !== 'all' || make !== 'all' || priceMax !== '') ? "default" : "outline"}
              size="sm"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="h-10 px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {(bodyType !== 'all' || make !== 'all' || priceMax !== '') && (
                <span className="ml-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[9px] font-black flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Collapsible Panel */}
          {mobileFilterOpen && (
            <div className="md:hidden pt-3 mt-3 border-t border-border/50 grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Body Type</label>
                <Select value={bodyType} onValueChange={setBodyType}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted border-border text-xs font-bold"><SelectValue placeholder="Body" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bodies</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Hatchback">Hatchback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Make</label>
                <Select value={make} onValueChange={setMake}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted border-border text-xs font-bold"><SelectValue placeholder="Make" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Makes</SelectItem>
                    {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Max Price (TSh)</label>
                <Input
                  type="number"
                  placeholder="Max TSh"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-10 rounded-xl bg-muted border-border text-xs"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Sort Order</label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted border-border text-xs font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low → High</SelectItem>
                    <SelectItem value="price-desc">Price: High → Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(search || bodyType !== 'all' || make !== 'all' || priceMax) && (
                <div className="col-span-2 pt-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSearch(''); setBodyType('all'); setMake('all'); setPriceMax(''); }}
                    className="text-[10px] uppercase font-bold text-muted-foreground h-8"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Desktop Filter Bar (Full Row) */}
          <div className="hidden md:grid md:grid-cols-12 gap-3">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search make, model, or showroom…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:col-span-2">
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger><SelectValue placeholder="Body" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bodies</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Luxury">Luxury</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger><SelectValue placeholder="Make" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Input
                type="number"
                placeholder="Max price (TSh)"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger><ArrowUpDown className="w-4 h-4 mr-2" />Sort</SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 sm:px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading…' : `${filtered.length} vehicle${filtered.length === 1 ? '' : 's'} in registry`}
            </p>
            {(search || bodyType !== 'all' || make !== 'all' || priceMax) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(''); setBodyType('all'); setMake('all'); setPriceMax(''); }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-20 text-center space-y-3">
                <p className="text-2xl font-black">No vehicles match your filters</p>
                <p className="text-muted-foreground">Try adjusting your search or browse all available inventory.</p>
                <Button asChild className="mt-4">
                  <Link href="/cars">View Full Showroom</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((car, i) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.4 }}
                >
                  <CarCard car={car} index={i} viewMode="grid" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
