'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import {
  Car, ChevronRight, Zap, ShieldCheck,
  TrendingUp, Award, Star, Gem,
  Heart, Bell, Search, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { motion } from "framer-motion";

type Inquiry = {
  id: string;
  carId: string;
  carName?: string;
  name: string;
  status: string;
  createdAt?: any;
};

type Favorite = {
  id: string;
  carId: string;
  carName?: string;
  carImage?: string;
  price?: number;
};

export default function CustomerDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    let isMounted = true;
    async function loadProfile() {
      try {
        const snap = await getDoc(doc(db, 'users', user?.uid || ''));
        if (isMounted && snap.exists()) {
          setProfile(snap.data());
        }
      } catch (e) {
        // Fallback
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [db, user]);

  const inquiriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'inquiries'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
  }, [db, user]);
  const { data: inquiries } = useCollection<Inquiry>(inquiriesQuery as any);

  const favoritesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'favorites'), where('userId', '==', user.uid), limit(6));
  }, [db, user]);
  const { data: favorites } = useCollection<Favorite>(favoritesQuery as any);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Car className="text-muted-foreground mb-4" size={48} />
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Sign in to continue</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">Track your inquiries and saved vehicles from your personal showroom dashboard.</p>
        <Link href="/login"><Button className="h-12 px-8 bg-primary text-primary-foreground font-black uppercase text-[9px] tracking-widest rounded-xl">Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-border p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest mb-3">
            <Zap size={10} className="mr-1" /> Welcome back
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic mb-1">
            Hello, {profile?.displayName || user.displayName || 'Buyer'}
          </h1>
          <p className="text-muted-foreground text-sm">Your personal showroom — track inquiries and saved vehicles.</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/cars">
          <Card className="bg-card border-border rounded-2xl p-5 hover:border-primary/40 transition-all group">
            <Search className="text-primary mb-3" size={20} />
            <div className="font-black text-sm uppercase tracking-tight">Browse</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Find a car</div>
          </Card>
        </Link>
        <Link href="/cars?filter=saved">
          <Card className="bg-card border-border rounded-2xl p-5 hover:border-primary/40 transition-all group">
            <Heart className="text-rose-400 mb-3" size={20} />
            <div className="font-black text-sm uppercase tracking-tight">Saved</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{favorites?.length ?? 0} cars</div>
          </Card>
        </Link>
        <Card className="bg-card border-border rounded-2xl p-5">
          <Bell className="text-amber-400 mb-3" size={20} />
          <div className="font-black text-sm uppercase tracking-tight">Inquiries</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{inquiries?.length ?? 0} active</div>
        </Card>
        <Card className="bg-card border-border rounded-2xl p-5">
          <Award className="text-emerald-400 mb-3" size={20} />
          <div className="font-black text-sm uppercase tracking-tight">Verified</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{profile?.verified ? 'Yes' : 'Pending'}</div>
        </Card>
      </div>

      {/* Recent inquiries */}
      {inquiries && inquiries.length > 0 && (
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Recent Inquiries</h2>
          <div className="grid gap-2">
            {inquiries.map((inq) => (
              <Link href={inq.carId ? `/cars/${inq.carId}` : '/cars'} key={inq.id}>
                <Card className="bg-card border-border rounded-2xl p-4 hover:border-primary/30 transition-all flex items-center justify-between">
                  <div>
                    <div className="font-black text-sm">{inq.carName || 'Vehicle'}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{inq.status}</div>
                  </div>
                  <ChevronRight className="text-muted-foreground" size={16} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Saved vehicles */}
      {favorites && favorites.length > 0 && (
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Saved Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => (
              <Link href={fav.carId ? `/cars/${fav.carId}` : '/cars'} key={fav.id}>
                <Card className="bg-card border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                  {fav.carImage && (
                    <div className="aspect-video bg-muted relative">
                      <img src={fav.carImage} alt={fav.carName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="font-black text-sm">{fav.carName}</div>
                    {fav.price && <div className="text-primary font-black text-sm mt-1">TSh {(fav.price / 1_000_000).toFixed(1)}M</div>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state nudge */}
      {(!inquiries || inquiries.length === 0) && (!favorites || favorites.length === 0) && (
        <Card className="bg-card border-border rounded-3xl p-12 text-center">
          <Gem className="mx-auto text-primary mb-4" size={40} />
          <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Start exploring</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Browse our curated inventory of premium vehicles. Save your favorites and reach out to showrooms directly.
          </p>
          <Link href="/cars">
            <Button className="h-12 px-8 bg-primary text-primary-foreground font-black uppercase text-[9px] tracking-widest rounded-xl">
              Browse Showroom
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
