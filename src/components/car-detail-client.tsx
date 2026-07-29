'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star, Users, Gauge, CheckCircle2,
  Loader2, Info, ShieldCheck, Heart,
  Award, Clock, MapPin, ArrowLeft, MessageCircle,
  Building2, Phone, Mail, User as UserIcon, CreditCard, GitCompare
} from "lucide-react";
import { Car, Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { motion, useScroll, useSpring } from "framer-motion";
import { ShareButton } from "@/components/sharing/ShareButton";
import { useCompare } from "@/context/CompareContext";
import Link from 'next/link';
import { useUser, useFirestore } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

interface CarDetailClientProps {
  car: Car;
  reviews: Review[];
}

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Verified Showroom", sub: "Business registered" },
  { icon: Award,       label: "Inspected Vehicle", sub: "50-point check"     },
  { icon: Building2,   label: "Showroom Listed",   sub: "Trusted seller"     },
  { icon: MapPin,      label: "TZ Nationwide",     sub: "Dealers everywhere" },
];

function formatPrice(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

import { getCustomCarsFromLocalStorage } from "@/lib/custom-cars-store";

export function CarDetailClient({ car: initialCar, reviews }: CarDetailClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { addToCompare, removeFromCompare, isInCompare, canAdd } = useCompare();

  const car = useMemo(() => {
    if (typeof window === 'undefined') return initialCar;
    const customCars = getCustomCarsFromLocalStorage();
    const customMatch = customCars.find(c => c.id === initialCar.id);
    return customMatch ? { ...initialCar, ...customMatch } : initialCar;
  }, [initialCar]);

  const inCompare = isInCompare(car.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reservation Payment Modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payName, setPayName] = useState(user?.displayName ?? '');
  const [payPhone, setPayPhone] = useState('');
  const [payMethod, setPayMethod] = useState<'mpesa' | 'crdb' | 'nmb'>('mpesa');
  const [payAmountType, setPayAmountType] = useState<'deposit10' | 'deposit20' | 'full'>('deposit10');
  const [payTxRef, setPayTxRef] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [reservationVoucher, setReservationVoucher] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: user?.displayName ?? '',
    email: user?.email ?? '',
    phone: '',
    message: `Hi! I'm interested in the ${car.make} ${car.model}. Is it still available?`,
  });

  // SCROLL PROGRESS
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const images = car.images && car.images.length > 0 ? car.images : [];
  const safeMainSrc = images[activeImageIndex] || null;

  const hasDiscount = !!(car.discountPrice && car.discountPrice < car.price);
  const discountPercent = hasDiscount
    ? Math.round(((car.price - (car.discountPrice ?? 0)) / car.price) * 100)
    : 0;
  const displayPrice = car.discountPrice ?? car.price;
  const savings = hasDiscount ? car.price - (car.discountPrice ?? 0) : 0;

  const inquiryMessage = `Hello! I'm interested in the ${car.year} ${car.make} ${car.model} listed on Volta. Is it still available?`;

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({ variant: 'destructive', title: 'Name and email are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newDocRef = doc(collection(db, 'inquiries'));
      await setDoc(newDocRef, {
        id: newDocRef.id,
        carId: car.id,
        carName: `${car.make} ${car.model}`,
        carYear: car.year,
        carPrice: car.price,
        carDiscountPrice: car.discountPrice ?? null,
        showroomId: car.showroomId ?? null,
        showroomName: car.showroomName ?? null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        userId: user?.uid ?? null,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Inquiry sent! 🚀',
        description: `${car.showroomName ?? 'The seller'} will reach out shortly.`,
      });
      setForm(prev => ({ ...prev, message: '' }));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Could not send inquiry', description: err?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeatureEmoji = (f: string) => {
    const map: any = {
      'Air Conditioning': '❄️', 'GPS Navigation': '🗺️', 'Bluetooth Audio': '🎵',
      'USB Charging': '🔌', 'Backup Camera': '📷', 'Sunroof': '☀️',
      'With Driver Available': '👤', '4WD/AWD': '🔧', 'Leather Seats': '💺'
    };
    return map[f] || '✅';
  };

  return (
    <div className="space-y-16 relative">
      {/* ── SCROLL PROGRESS BAR ── */}
      <motion.div
        className="fixed top-14 left-0 right-0 h-[2px] z-40 origin-left"
        style={{
          scaleX,
          background: "linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))",
          boxShadow: "0 0 10px hsla(var(--primary) / 0.5)"
        }}
      />

      <AnimatedSection direction="down" delay={0.1}>
        <Link href="/cars">
          <Button variant="ghost" className="mb-4 rounded-xl text-muted-foreground hover:text-primary gap-2 p-0">
            <ArrowLeft size={16} /> Back to Vehicles for Sale
          </Button>
        </Link>
      </AnimatedSection>

      {/* SECTION 1 - GALLERY */}
      <AnimatedSection direction="scale" delay={0} className="space-y-4">
        <div className="relative aspect-[16/9] w-full rounded-[1.5rem] overflow-hidden bg-muted flex items-center justify-center border border-border shadow-2xl">
          {safeMainSrc ? (
            <Image src={safeMainSrc} alt={car.model} fill className="object-cover transition-all duration-700" priority unoptimized />
          ) : (
            <span className="text-8xl">🚗</span>
          )}
          {hasDiscount && (
            <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={cn(
                  "relative h-20 w-32 rounded-xl overflow-hidden border-2 shrink-0 transition-all",
                  activeImageIndex === i ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img} alt="Thumb" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* SECTION 2 - HEADER + INQUIRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full px-5 py-1.5 font-black uppercase text-[10px] tracking-[0.2em]">
                  {car.bodyType ?? car.category ?? 'Vehicle'}
                </Badge>
                {car.showroomName && (
                  <Badge variant="outline" className="border-border text-foreground rounded-full px-4 py-1.5 font-black uppercase text-[10px] tracking-widest gap-2">
                    <Building2 size={10} /> {car.showroomName}
                  </Badge>
                )}
                {car.condition && (
                  <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1.5 font-black uppercase text-[10px] tracking-widest">
                    {car.condition}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={inCompare ? "default" : "outline"}
                  onClick={() => inCompare ? removeFromCompare(car.id) : addToCompare(car)}
                  disabled={!canAdd && !inCompare}
                  className={cn(
                    "rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-md h-10 px-4",
                    inCompare ? "bg-primary text-white border-primary" : "border-border hover:border-primary"
                  )}
                >
                  <GitCompare size={14} />
                  {inCompare ? "In Compare Buffer" : "Add to Compare"}
                </Button>
                <ShareButton shareType="car" data={car} variant="icon" />
              </div>
            </div>

            <div className="flex items-start justify-between gap-6">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">
                {car.make} <br/><span className="text-primary italic">{car.model}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-sm font-black uppercase tracking-widest flex-wrap">
              <span>{car.year}</span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span>{car.transmission}</span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span>{car.fuelType}</span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span>{car.seats} Seats</span>
              {car.mileage != null && (
                <>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <span>{car.mileage.toLocaleString()} km</span>
                </>
              )}
            </div>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 text-secondary">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-black text-sm">{car.rating || '5.0'} ({reviews.length} Reviews)</span>
              </div>
            )}
          </div>

          {/* TRUST BADGES */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border min-w-[160px] shadow-sm"
              >
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <badge.icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-foreground">
                    {badge.label}
                  </p>
                  <p className="text-[8px] text-muted-foreground">
                    {badge.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* SPECS GRID */}
          <div className="space-y-6">
            <h3 className="text-xl font-black tracking-tighter uppercase">Vehicle Specifications</h3>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-3" staggerDelay={0.05}>
              <StaggerItem>
                <div className="bg-muted border border-border rounded-[1rem] px-5 py-4 shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Year</p>
                  <p className="text-lg font-black mt-1">{car.year ?? '—'}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="bg-muted border border-border rounded-[1rem] px-5 py-4 shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Mileage</p>
                  <p className="text-lg font-black mt-1">{car.mileage != null ? `${car.mileage.toLocaleString()} km` : '—'}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="bg-muted border border-border rounded-[1rem] px-5 py-4 shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Transmission</p>
                  <p className="text-lg font-black mt-1">{car.transmission ?? '—'}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="bg-muted border border-border rounded-[1rem] px-5 py-4 shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Fuel</p>
                  <p className="text-lg font-black mt-1">{car.fuelType ?? '—'}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="bg-muted border border-border rounded-[1rem] px-5 py-4 shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Seats</p>
                  <p className="text-lg font-black mt-1">{car.seats ?? '—'}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="bg-muted border border-border rounded-[1rem] px-5 py-4 shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Color</p>
                  <p className="text-lg font-black mt-1">{car.color ?? '—'}</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {(car.features?.length ?? 0) > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black tracking-tighter uppercase">Features & Amenities</h3>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-3" staggerDelay={0.05}>
                {(car.features ?? []).map((f: string) => (
                  <StaggerItem key={f}>
                    <div className="bg-muted border border-border rounded-[1rem] px-5 py-3 text-[11px] font-bold text-foreground flex items-center gap-3 shadow-sm">
                      <span>{getFeatureEmoji(f)}</span> {f}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}

          {/* FINANCING CALCULATOR */}
          <AnimatedSection direction="up" delay={0.2} className="executive-card p-8 space-y-6 bg-card border border-border rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tighter uppercase text-foreground">Estimated Monthly Financing</h3>
                <p className="text-xs text-muted-foreground">Calculate estimated monthly installments based on your down payment</p>
              </div>
              <Badge className="bg-primary/10 text-primary font-black text-[9px] uppercase px-3 py-1">
                Dealer Financing Available
              </Badge>
            </div>

            <FinancingCalculator carPrice={displayPrice} />
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.3} className="executive-card p-10 space-y-6">
            <h3 className="text-xl font-black tracking-tighter uppercase">Seller Notes</h3>
            <p className="text-muted-foreground leading-relaxed italic text-lg">
              "{car.description || `Premium ${car.make} ${car.model} listed by ${car.showroomName ?? 'a trusted showroom'}. Inspections welcomed.`}"
            </p>
          </AnimatedSection>
        </div>

        {/* RIGHT COLUMN - PRICE + INQUIRY FORM */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <AnimatedSection direction="left" delay={0.3} className="executive-card p-10 space-y-8">
              {/* Price block */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asking Price</p>
                {hasDiscount ? (
                  <div className="space-y-1">
                    <div className="text-[14px] font-bold text-muted-foreground line-through opacity-60">TSh {car.price?.toLocaleString()}</div>
                    <div className="text-5xl font-black text-primary tracking-tighter">TSh {car.discountPrice?.toLocaleString()}</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Save TSh {savings.toLocaleString()}</p>
                  </div>
                ) : (
                  <div className="text-5xl font-black text-primary tracking-tighter">TSh {displayPrice?.toLocaleString()}</div>
                )}
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest pt-2">~ TSh {formatPrice(displayPrice ?? 0)} · Negotiable</p>
              </div>

              {/* DIRECT SHOWROOM PAYMENT / RESERVATION BUTTON */}
              <Button
                type="button"
                onClick={() => setIsPayModalOpen(true)}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-[0.2em] uppercase text-xs rounded-xl shadow-2xl transition-all active:scale-95 gap-2"
              >
                <CreditCard size={16} /> Reserve & Pay Deposit
              </Button>

                {/* Inquiry form */}
                <form id="inquire" onSubmit={handleSubmitInquiry} className="space-y-4 pt-6 border-t border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Or Send Direct Inquiry</p>

                  <div className="space-y-3">
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-muted border-none text-foreground text-sm font-bold focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-muted border-none text-foreground text-sm font-bold focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-muted border-none text-foreground text-sm font-bold focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Message to seller..."
                      value={form.message}
                      onChange={(e) => setForm({...form, message: e.target.value})}
                      className="w-full p-4 rounded-xl bg-muted border-none text-foreground text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-12 border-border font-black tracking-[0.2em] uppercase text-xs rounded-xl gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                      <>
                        <MessageCircle size={14} /> Send Message
                      </>
                    )}
                  </Button>

                <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest pt-1">
                  Seller typically replies within 24h
                </p>
              </form>
            </AnimatedSection>

            {/* WHATSAPP QUICK INQUIRY */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(inquiryMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500/10 transition-colors shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.405.015 12.044c0 2.123.555 4.194 1.608 6.019L0 24l6.135-1.61a11.77 11.77 0 005.912 1.654h.005c6.632 0 12.028-5.406 12.03-12.046a11.751 11.751 0 00-3.469-8.513z"/>
                </svg>
                Or message via WhatsApp
              </motion.div>
            </a>
          </div>
        </div>
      </div>

      {/* RESERVATION DEPOSIT PAYMENT MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black uppercase text-foreground">Reserve Vehicle & Pay Deposit</h3>
                <p className="text-xs text-muted-foreground">{car.year} {car.make} {car.model} — Stock #{car.id}</p>
              </div>
              <button 
                onClick={() => setIsPayModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            {reservationVoucher ? (
              <div className="space-y-6 text-center py-4">
                <div className="h-16 w-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase text-emerald-400">Reservation Confirmed!</h4>
                  <p className="text-xs text-muted-foreground font-medium">Voucher Code: <span className="text-foreground font-mono font-bold">{reservationVoucher.voucherCode}</span></p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border text-left space-y-2 text-xs">
                  <p className="font-bold text-foreground">Buyer: {reservationVoucher.buyerName}</p>
                  <p className="text-muted-foreground">Phone: {reservationVoucher.buyerPhone}</p>
                  <p className="text-muted-foreground">Vehicle: {car.make} {car.model} ({car.year})</p>
                  <p className="text-emerald-500 font-bold">Deposit Paid/Ref: {reservationVoucher.txRef}</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bring your voucher code or transaction reference to <strong>Volta Motors Showroom</strong> to complete vehicle pickup!
                </p>

                <Button 
                  onClick={() => { setReservationVoucher(null); setIsPayModalOpen(false); }}
                  className="w-full rounded-2xl bg-primary text-white font-black text-xs uppercase"
                >
                  Done & Back to Showroom
                </Button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!payName || !payPhone || !payTxRef) {
                  toast({ variant: 'destructive', title: 'Please fill name, phone, and transaction ref.' });
                  return;
                }
                setIsReserving(true);
                try {
                  const depositAmount = payAmountType === 'deposit10' 
                    ? Math.round(displayPrice * 0.1) 
                    : (payAmountType === 'deposit20' ? Math.round(displayPrice * 0.2) : displayPrice);
                  
                  const voucherCode = `VOLTA-RES-${Math.floor(100000 + Math.random() * 900000)}`;

                  const newDocRef = doc(collection(db, 'inquiries'));
                  await setDoc(newDocRef, {
                    id: newDocRef.id,
                    carId: car.id,
                    carName: `${car.make} ${car.model}`,
                    carYear: car.year,
                    carPrice: displayPrice,
                    showroomId: car.showroomId ?? 'main-showroom',
                    showroomName: car.showroomName ?? 'Volta Motors Tanzania',
                    buyerName: payName,
                    buyerPhone: payPhone,
                    offeredPrice: depositAmount,
                    wantsFinancing: false,
                    wantsTestDrive: false,
                    message: `DEPOSIT RESERVATION: Paid TSh ${depositAmount.toLocaleString()} via ${payMethod.toUpperCase()} (Ref: ${payTxRef}). Voucher: ${voucherCode}`,
                    status: 'scheduled',
                    type: 'reservation_deposit',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });

                  setReservationVoucher({
                    voucherCode,
                    buyerName: payName,
                    buyerPhone: payPhone,
                    txRef: payTxRef,
                    depositAmount
                  });
                  toast({ title: 'Reservation Logged! 🚗', description: 'Showroom team notified.' });
                } catch (err: any) {
                  toast({ variant: 'destructive', title: 'Reservation error', description: err.message });
                } finally {
                  setIsReserving(false);
                }
              }} className="space-y-4">
                
                {/* PAYMENT NUMBERS CARD */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Official Showroom Payment Account Numbers</p>
                  <div className="grid grid-cols-1 gap-2 text-xs text-foreground font-bold">
                    <div className="flex justify-between items-center bg-card/60 p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground">📱 M-Pesa / Tigo / Airtel:</span>
                      <span className="font-mono text-emerald-400 font-black">Lipa Namba: 554433</span>
                    </div>
                    <div className="flex justify-between items-center bg-card/60 p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground">🏦 CRDB Bank:</span>
                      <span className="font-mono font-black">0150299481200 (Volta Motors)</span>
                    </div>
                    <div className="flex justify-between items-center bg-card/60 p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground">🏦 NMB Bank:</span>
                      <span className="font-mono font-black">20110098412 (Volta Motors)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Deposit Option</label>
                  <select 
                    value={payAmountType}
                    onChange={(e) => setPayAmountType(e.target.value as any)}
                    className="w-full p-3 rounded-2xl bg-background border border-border text-xs font-bold text-foreground"
                  >
                    <option value="deposit10">10% Holding Deposit (TSh {Math.round(displayPrice * 0.1).toLocaleString()})</option>
                    <option value="deposit20">20% Down Payment Deposit (TSh {Math.round(displayPrice * 0.2).toLocaleString()})</option>
                    <option value="full">Full Vehicle Purchase Price (TSh {displayPrice.toLocaleString()})</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Buyer Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Salim Hassan" 
                      value={payName} 
                      onChange={(e) => setPayName(e.target.value)} 
                      className="w-full p-3 rounded-2xl bg-background border border-border text-xs font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Phone / WhatsApp *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="+255 7XX XXX XXX" 
                      value={payPhone} 
                      onChange={(e) => setPayPhone(e.target.value)} 
                      className="w-full p-3 rounded-2xl bg-background border border-border text-xs font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">M-Pesa / Bank Reference Code *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 9AB48192X or Transfer Ref #" 
                    value={payTxRef} 
                    onChange={(e) => setPayTxRef(e.target.value)} 
                    className="w-full p-3 rounded-2xl bg-background border border-border text-xs font-bold text-foreground uppercase font-mono"
                  />
                  <p className="text-[9px] text-muted-foreground">Copy & paste your payment confirmation SMS or receipt number here.</p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isReserving} 
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-xl mt-4"
                >
                  {isReserving ? "Confirming Reservation..." : "Submit Deposit & Confirm Vehicle Reservation"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FinancingCalculator({ carPrice }: { carPrice: number }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [interestRate, setInterestRate] = useState(12);

  const downPaymentAmount = Math.round(carPrice * (downPaymentPercent / 100));
  const principal = Math.max(0, carPrice - downPaymentAmount);

  const monthlyRate = (interestRate / 100) / 12;
  const monthlyPayment = monthlyRate > 0 && tenureMonths > 0
    ? Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1))
    : Math.round(principal / (tenureMonths || 1));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-border">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-muted-foreground">Down Payment ({downPaymentPercent}%)</span>
            <span className="text-foreground font-black">TSh {downPaymentAmount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground">Loan Tenure</label>
            <select
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full mt-1 p-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
            >
              <option value={12}>12 Months (1 yr)</option>
              <option value={24}>24 Months (2 yrs)</option>
              <option value={36}>36 Months (3 yrs)</option>
              <option value={48}>48 Months (4 yrs)</option>
              <option value={60}>60 Months (5 yrs)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground">Est. Interest Rate</label>
            <select
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full mt-1 p-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
            >
              <option value={10}>10% p.a.</option>
              <option value={12}>12% p.a.</option>
              <option value={15}>15% p.a.</option>
              <option value={18}>18% p.a.</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-6 bg-card rounded-2xl border border-border text-center space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Installment</span>
        <p className="text-3xl font-black text-primary tracking-tight">
          TSh {monthlyPayment.toLocaleString()} <span className="text-xs text-muted-foreground font-medium">/ month</span>
        </p>
        <p className="text-[9px] text-muted-foreground font-medium">
          Loan Amount: TSh {principal.toLocaleString()} over {tenureMonths} months
        </p>
      </div>
    </div>
  );
}
