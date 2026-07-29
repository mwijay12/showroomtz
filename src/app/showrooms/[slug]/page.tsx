'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  MessageSquare,
  Globe,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Showroom, Car } from '@/lib/types';
import { getCustomShowroomsFromLocalStorage } from '@/lib/custom-showrooms-store';
import { getCustomCarsFromLocalStorage } from '@/lib/custom-cars-store';
import { SEED_SHOWROOMS, SEED_CARS } from '@/lib/showroom-seed';

export default function ShowroomDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const db = useFirestore();

  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const customShowrooms = getCustomShowroomsFromLocalStorage();
      let found = customShowrooms.find(s => s.slug === slug || s.id === slug);

      if (!found) {
        try {
          const snapShowrooms = await getDocs(collection(db, 'showrooms'));
          found = snapShowrooms.docs.map(d => ({ id: d.id, ...d.data() }) as Showroom)
            .find(s => s.slug === slug || s.id === slug);
        } catch (e) {}
      }

      if (!found) {
        found = (SEED_SHOWROOMS as any[]).find(s => s.slug === slug || s.id === slug) || SEED_SHOWROOMS[0] as any;
      }

      if (isMounted) setShowroom(found || null);

      try {
        const snapCars = await getDocs(query(collection(db, 'cars'), where('status', '==', 'available')));
        if (!snapCars.empty) {
          const list = snapCars.docs.map(d => ({ id: d.id, ...d.data() })) as Car[];
          if (isMounted) setCars(list);
        } else {
          if (isMounted) setCars(SEED_CARS as any);
        }
      } catch (e) {
        if (isMounted) setCars(SEED_CARS as any);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [db, slug]);

  if (!showroom && !loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <Navbar />
        <h1 className="text-2xl font-black uppercase">Showroom Not Found</h1>
        <Link href="/showrooms" className="mt-4 text-primary font-bold">Back to Showrooms</Link>
      </div>
    );
  }

  const showroomCars = cars.filter(c => c.showroomId === showroom?.id || c.showroomName === showroom?.name);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full space-y-12">
        <Link href="/showrooms" className="inline-flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back to Showroom Directory
        </Link>

        {/* SHOWROOM HEADER BANNER */}
        {showroom && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-muted border-2 border-primary/30 flex items-center justify-center font-black text-3xl text-primary shrink-0 overflow-hidden shadow-xl">
                  {showroom.logoUrl ? (
                    <img src={showroom.logoUrl} alt={showroom.name} className="h-full w-full object-cover" />
                  ) : (
                    showroom.name.charAt(0)
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
                      {showroom.name}
                    </h1>
                    {showroom.verified && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[9px] uppercase px-3 py-1">
                        Verified Dealer
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin size={14} className="text-primary" /> {showroom.address || showroom.city}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={`https://wa.me/${showroom.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Jambo! Interested in vehicles listed at ${showroom.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase shadow-lg shadow-emerald-500/20">
                    <MessageSquare size={16} className="mr-2 fill-current" /> WhatsApp Dealer
                  </Button>
                </a>
              </div>
            </div>

            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {showroom.description}
            </p>
          </div>
        )}

        {/* INVENTORY LIST */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase text-foreground">
              Vehicles for Sale <span className="text-primary">({showroomCars.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showroomCars.map((car) => (
              <Card key={car.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-xl hover:border-primary/50 transition-all group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                    <img 
                      src={car.images?.[0] || car.coverImage || "/placeholder-car.jpg"} 
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-background/90 text-foreground font-black text-[9px] uppercase px-3 py-1">
                        {car.condition}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                        {car.make} {car.model} {car.variant}
                      </h3>
                      <p className="text-xs text-muted-foreground font-bold">{car.year} • {car.fuelType} • {car.transmission}</p>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-border pt-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Asking Price</span>
                        <p className="text-xl font-black text-foreground">
                          {car.currency || 'TZS'} {car.price.toLocaleString()}
                        </p>
                      </div>
                      {car.negotiable && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-none font-bold text-[9px] uppercase">
                          Negotiable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link href={`/cars/${car.id}`}>
                    <Button className="w-full rounded-2xl bg-primary text-white font-black text-xs uppercase">
                      View Spec Sheet & Offer
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
