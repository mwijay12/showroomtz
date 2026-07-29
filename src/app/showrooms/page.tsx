'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Star, 
  ShieldCheck, 
  Car as CarIcon, 
  ArrowRight,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Showroom, Car } from '@/lib/types';
import { getCustomShowroomsFromLocalStorage } from '@/lib/custom-showrooms-store';
import { SEED_SHOWROOMS } from '@/lib/showroom-seed';

export default function ShowroomsDirectoryPage() {
  const db = useFirestore();
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const customList = getCustomShowroomsFromLocalStorage();
      let fetchedList: Showroom[] = SEED_SHOWROOMS as any;

      try {
        const snapShowrooms = await getDocs(collection(db, 'showrooms'));
        if (!snapShowrooms.empty) {
          fetchedList = snapShowrooms.docs.map(d => ({ id: d.id, ...d.data() })) as Showroom[];
        }
      } catch (e) {
        // Fallback to seed
      }

      const merged = [...fetchedList];
      customList.forEach(c => {
        const idx = merged.findIndex(s => s.id === c.id || s.slug === c.slug);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...c };
        } else {
          merged.unshift(c);
        }
      });

      if (isMounted) setShowrooms(merged);

      try {
        const snapCars = await getDocs(query(collection(db, 'cars'), where('status', '==', 'available')));
        if (isMounted) setCars(snapCars.docs.map(d => ({ id: d.id, ...d.data() })) as Car[]);
      } catch (e) {
        if (isMounted) setCars([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [db]);

  const filteredShowrooms = showrooms.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specialties?.some(sp => sp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = cityFilter === 'all' || s.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full space-y-12">
        {/* HERO SECTION */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Verified Tanzanian Dealers
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-foreground">
            Trusted Car <span className="text-primary">Showrooms</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Discover verified motor vehicle dealerships in Dar es Salaam, Arusha, Mwanza and across Tanzania.
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto w-full">
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by showroom name, city, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 rounded-2xl border-border bg-card text-xs font-medium py-6"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full sm:w-48 rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground"
          >
            <option value="all">All Cities</option>
            <option value="dar es salaam">Dar es Salaam</option>
            <option value="arusha">Arusha</option>
            <option value="mwanza">Mwanza</option>
            <option value="dodoma">Dodoma</option>
          </select>
        </div>

        {/* SHOWROOM CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShowrooms.map((s) => {
            const showroomCars = cars.filter(c => c.showroomId === s.id);
            return (
              <Card key={s.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-xl hover:border-primary/50 transition-all group flex flex-col justify-between">
                <div className="p-6 space-y-6">
                  {/* BRANDING HEADER */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-xl text-primary shrink-0 overflow-hidden">
                        {s.logoUrl ? (
                          <img src={s.logoUrl} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                          s.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                            {s.name}
                          </h3>
                          {s.verified && (
                            <ShieldCheck size={16} className="text-emerald-500 fill-emerald-500/20 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-primary" /> {s.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 font-black text-xs px-2.5 py-1 rounded-xl shrink-0">
                      <Star size={12} className="fill-current" /> {s.rating || 4.8}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {s.description}
                  </p>

                  {/* SPECIALTIES */}
                  {s.specialties && s.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {s.specialties.map(sp => (
                        <Badge key={sp} className="bg-muted text-muted-foreground border-border text-[9px] font-bold uppercase">
                          {sp}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* STOCK COUNTER */}
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                      <CarIcon size={16} className="text-primary" /> Listed Stock
                    </span>
                    <span className="text-sm font-black text-foreground">{showroomCars.length || s.totalListings || 0} Vehicles</span>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link href={`/showrooms/${s.slug || s.id}`}>
                    <Button className="w-full rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-wider group-hover:bg-primary/90">
                      View Showroom Stock <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
