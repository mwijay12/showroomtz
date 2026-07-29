'use client';

import { useState, useMemo } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Car as CarIcon, 
  Zap, 
  ShieldCheck, 
  Heart,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  Building2,
  Star,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Car, Showroom } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SEED_CARS, SEED_SHOWROOMS } from "@/lib/showroom-seed";
import { getCustomCarsFromLocalStorage } from "@/lib/custom-cars-store";
import { getCustomShowroomsFromLocalStorage } from "@/lib/custom-showrooms-store";

// ── QUIZ CONFIGURATION ───────────────────────────────────────

const MISSIONS = [
  { id: "daily",    label: "Daily Executive Drive", emoji: "🏎️", desc: "VIP Comfort & Fuel Efficiency" },
  { id: "safari",   label: "Safari & Rough Terrain",emoji: "🦁", desc: "4WD / High Clearance SUV" },
  { id: "business", label: "Corporate Business",   emoji: "💼", desc: "Executive Prestige & Style" },
  { id: "family",   label: "Family Travel & Van",   emoji: "👨‍👩‍👧‍👦", desc: "7+ Seater Capacity & Space" },
  { id: "wedding",  label: "Weddings & Ceremonies", emoji: "💍", desc: "Luxury Convoy & Status" },
  { id: "commercial",label: "Commercial / Transport",emoji: "🚐", desc: "Bus, Coaster & Heavy Haul" },
];

const CITIES = [
  { id: "all",           label: "Any Location in TZ",  desc: "Nationwide Showroom Inventory" },
  { id: "dar es salaam", label: "Dar es Salaam Hub",   desc: "Kariakoo, Kinondoni & Mikocheni" },
  { id: "arusha",        label: "Arusha Showrooms",    desc: "Northern Safari Capital" },
  { id: "mwanza",        label: "Mwanza & Lake Zone",  desc: "Lake Victoria Hubs" },
  { id: "dodoma",        label: "Dodoma Capital",      desc: "Central Government Hub" },
];

const PEOPLE_RANGES = [
  { id: 2,  label: "1 - 2 Seats",   desc: "Coupe / Luxury Sedan" },
  { id: 5,  label: "3 - 5 Seats",   desc: "Standard SUV / Sedan" },
  { id: 7,  label: "5 - 7 Seats",   desc: "VIP MPV / 7-Seater SUV" },
  { id: 15, label: "8+ Passengers", desc: "Minibus / Coaster" },
];

const BUDGET_LEVELS = [
  { id: "budget",  label: "Under 50M TZS",   emoji: "🎯", desc: "Great Value Pre-Owned" },
  { id: "mid",     label: "50M - 150M TZS",  emoji: "⭐", desc: "Foreign Used Quality" },
  { id: "premium", label: "150M - 350M TZS", emoji: "💎", desc: "High-End SUV / Land Cruiser" },
  { id: "luxury",  label: "350M+ TZS VIP",   emoji: "👑", desc: "Brand New Executive VIP" },
];

const SPECIAL_NEEDS = [
  { id: "driver",  label: "With Chauffeur Option", icon: UserCheck },
  { id: "test",    label: "Test Drive Eligible", icon: ShieldCheck },
  { id: "4wd",     label: "4WD / All-Wheel Drive", icon: Zap },
  { id: "leather", label: "Leather Captain Seats", icon: Star },
];

// ── MATCHING SCORING LOGIC ───────────────────────────────────────

function calculateMatchScore(car: Car, answers: any): number {
  let score = 50;

  // 1. Mission Category Match (25 pts)
  if (answers.mission === "safari" && (car.category === "SUV" || car.category === "Pickup")) score += 25;
  if (answers.mission === "wedding" && car.category === "Luxury") score += 25;
  if (answers.mission === "business" && (car.category === "Sedan" || car.category === "Luxury" || car.category === "SUV")) score += 25;
  if (answers.mission === "family" && (car.category === "Van" || car.category === "Minibus" || car.category === "SUV")) score += 25;
  if (answers.mission === "commercial" && (car.category === "Bus" || car.category === "Minibus" || car.category === "Pickup")) score += 25;
  if (answers.mission === "daily" && (car.category === "Sedan" || car.category === "Hatchback" || car.category === "SUV")) score += 20;

  // 2. City Match (15 pts)
  if (answers.city !== "all" && car.location?.toLowerCase().includes(answers.city.toLowerCase())) {
    score += 15;
  } else if (answers.city === "all") {
    score += 10;
  }

  // 3. Seating Capacity (15 pts)
  if (answers.travelers === 15 && (car.seats >= 8 || car.category === "Minibus" || car.category === "Bus")) score += 15;
  else if (car.seats >= answers.travelers) score += 15;

  // 4. Budget Range (20 pts)
  const price = car.price || car.discountPrice || 0;
  if (answers.budget === "budget" && price < 50_000_000) score += 20;
  if (answers.budget === "mid" && price >= 50_000_000 && price <= 150_000_000) score += 20;
  if (answers.budget === "premium" && price >= 150_000_000 && price <= 350_000_000) score += 20;
  if (answers.budget === "luxury" && price >= 350_000_000) score += 20;

  // 5. Features Check (15 pts)
  answers.needs.forEach((need: string) => {
    if (need === "driver" && (car.hasDriver || car.features?.includes("With Driver / Chauffeur Option"))) score += 5;
    if (need === "test" && (car.testDriveAvailable || car.features?.includes("Test Drive Available"))) score += 5;
    if (need === "4wd" && (car.category === "SUV" || car.features?.includes("4WD/AWD"))) score += 5;
    if (need === "leather" && car.features?.includes("Leather Seats")) score += 5;
  });

  return Math.min(Math.max(score, 65), 98);
}

export default function FindMyCarPage() {
  const db = useFirestore();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    mission: "daily",
    city: "all",
    travelers: 5,
    budget: "mid",
    needs: [] as string[]
  });

  // Fetch live cars & showrooms from Firestore
  const carsQuery = useMemoFirebase(() => query(collection(db, "cars"), where("status", "==", "available")), [db]);
  const { data: rawCars, loading } = useCollection(carsQuery);

  const showroomsQuery = useMemoFirebase(() => query(collection(db, "showrooms")), [db]);
  const { data: rawShowrooms } = useCollection(showroomsQuery);

  // Merged Cars Inventory
  const cars = useMemo(() => {
    const customCars = getCustomCarsFromLocalStorage();
    let baseCars: Car[] = (rawCars && rawCars.length > 0) ? (rawCars as Car[]) : (SEED_CARS as unknown as Car[]);
    const merged = [...baseCars];
    customCars.forEach(c => {
      const idx = merged.findIndex(m => m.id === c.id);
      if (idx >= 0) merged[idx] = { ...merged[idx], ...c };
      else merged.unshift(c as Car);
    });
    return merged;
  }, [rawCars]);

  // Merged Showrooms Directory
  const showrooms = useMemo(() => {
    const customSR = getCustomShowroomsFromLocalStorage();
    let baseSR: Showroom[] = (rawShowrooms && rawShowrooms.length > 0) ? (rawShowrooms as Showroom[]) : (SEED_SHOWROOMS as unknown as Showroom[]);
    const merged = [...baseSR];
    customSR.forEach(s => {
      const idx = merged.findIndex(m => m.id === s.id);
      if (idx >= 0) merged[idx] = { ...merged[idx], ...s };
      else merged.unshift(s);
    });
    return merged;
  }, [rawShowrooms]);

  const recommendations = useMemo(() => {
    if (!cars || step !== 6) return [];
    return cars
      .map(car => {
        const showroom = showrooms.find(s => s.id === car.showroomId || s.slug === car.showroomId) || showrooms[0];
        return {
          ...car,
          showroom,
          score: calculateMatchScore(car, answers)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [cars, showrooms, answers, step]);

  const toggleNeed = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      needs: prev.needs.includes(id) 
        ? prev.needs.filter(n => n !== id) 
        : [...prev.needs, id]
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          
          {/* HEADER NODE */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Vehicle & Showroom Match Protocol</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Find Your <span className="text-primary italic">Perfect Vehicle</span>
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider max-w-xl mx-auto">
              Answer 5 quick questions to match with verified Tanzanian showroom stock in Dar es Salaam, Arusha & Mwanza.
            </p>
          </div>

          {/* PROGRESS BAR */}
          {step < 6 && (
            <div className="mb-12 space-y-3 max-w-2xl mx-auto">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <span>STAGE {step} OF 5</span>
                <span>{Math.round((step / 5) * 100)}% ANALYZED</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 5) * 100}%` }}
                  className="h-full bg-primary shadow-[0_0_15px_hsla(var(--primary)/0.5)]"
                />
              </div>
            </div>
          )}

          {/* WIZARD CONTAINER */}
          <div className="relative min-h-[450px]">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: MISSION */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">What is your primary driving goal?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {MISSIONS.map(m => (
                      <div
                        key={m.id}
                        onClick={() => { setAnswers({...answers, mission: m.id}); nextStep(); }}
                        className={cn(
                          "bg-card border border-border rounded-3xl p-6 text-center space-y-3 cursor-pointer hover:border-primary transition-all duration-300 group shadow-lg",
                          answers.mission === m.id ? "border-primary bg-primary/5 shadow-2xl scale-[1.02]" : ""
                        )}
                      >
                        <span className="text-4xl block group-hover:scale-110 transition-transform">{m.emoji}</span>
                        <div>
                          <p className="text-sm font-black uppercase text-foreground">{m.label}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CITY / SHOWROOM LOCATION */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">Which City Showroom do you prefer?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {CITIES.map(c => (
                      <div
                        key={c.id}
                        onClick={() => { setAnswers({...answers, city: c.id}); nextStep(); }}
                        className={cn(
                          "bg-card border border-border rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:border-primary transition-all duration-300 group shadow-lg",
                          answers.city === c.id ? "border-primary bg-primary/5 shadow-2xl scale-[1.02]" : ""
                        )}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                            <MapPin size={14} className="text-primary" /> {c.label}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase">{c.desc}</p>
                        </div>
                        <Building2 className={cn("h-6 w-6 transition-colors", answers.city === c.id ? "text-primary" : "text-muted-foreground/30")} />
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-4">
                    <Button variant="ghost" onClick={prevStep} className="font-black uppercase text-[10px] tracking-widest gap-2">
                      <ArrowLeft size={14} /> Back to Goal
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CAPACITY */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">Required Seating Capacity</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {PEOPLE_RANGES.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setAnswers({...answers, travelers: p.id}); nextStep(); }}
                        className={cn(
                          "bg-card border border-border rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:border-primary transition-all duration-300 group shadow-lg",
                          answers.travelers === p.id ? "border-primary bg-primary/5 shadow-2xl scale-[1.02]" : ""
                        )}
                      >
                        <div className="space-y-1">
                          <p className="text-base font-black uppercase text-foreground">{p.label}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase">{p.desc}</p>
                        </div>
                        <Users className={cn("h-7 w-7 transition-colors", answers.travelers === p.id ? "text-primary" : "text-muted-foreground/30")} />
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-4">
                    <Button variant="ghost" onClick={prevStep} className="font-black uppercase text-[10px] tracking-widest gap-2">
                      <ArrowLeft size={14} /> Back to City
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: BUDGET */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">Target Investment / Budget</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {BUDGET_LEVELS.map(b => (
                      <div
                        key={b.id}
                        onClick={() => { setAnswers({...answers, budget: b.id}); nextStep(); }}
                        className={cn(
                          "bg-card border border-border rounded-3xl p-6 flex items-center gap-4 cursor-pointer hover:border-primary transition-all duration-300 group shadow-lg",
                          answers.budget === b.id ? "border-primary bg-primary/5 shadow-2xl scale-[1.02]" : ""
                        )}
                      >
                        <span className="text-4xl">{b.emoji}</span>
                        <div>
                          <p className="text-sm font-black uppercase text-foreground">{b.label}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-4">
                    <Button variant="ghost" onClick={prevStep} className="font-black uppercase text-[10px] tracking-widest gap-2">
                      <ArrowLeft size={14} /> Back to Capacity
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: SPECIAL REQUIREMENTS */}
              {step === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8 max-w-3xl mx-auto"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">Buyer Perks & Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SPECIAL_NEEDS.map(n => {
                      const isSelected = answers.needs.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => toggleNeed(n.id)}
                          className={cn(
                            "bg-card border border-border rounded-3xl p-6 flex items-center gap-4 cursor-pointer hover:border-primary transition-all group shadow-lg",
                            isSelected ? "border-primary bg-primary/5" : ""
                          )}
                        >
                          <div className={cn(
                            "h-10 w-10 rounded-2xl flex items-center justify-center border transition-colors shrink-0",
                            isSelected ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border"
                          )}>
                            <n.icon size={18} />
                          </div>
                          <span className="text-xs font-black uppercase text-foreground">{n.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-border">
                    <Button variant="ghost" onClick={prevStep} className="font-black uppercase text-[10px] tracking-widest">
                      <ArrowLeft size={14} className="mr-2" /> Back
                    </Button>
                    <Button onClick={nextStep} className="h-14 px-10 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl gap-2">
                      Show Matched Showrooms & Stock <ArrowRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: MATCHED RESULTS */}
              {step === 6 && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-2">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[9px] uppercase px-3 py-1 mb-2">
                      Match Complete
                    </Badge>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Your Recommended Vehicles & Showrooms</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase">
                      Found {recommendations.length} ideal matches in verified Tanzanian partner showrooms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {loading ? (
                      [1,2].map(i => <div key={i} className="h-[420px] bg-muted animate-pulse rounded-3xl" />)
                    ) : recommendations.map((item: any, i) => (
                      <Card
                        key={item.id}
                        className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-primary/50 transition-all"
                      >
                        <div className="space-y-4">
                          <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                            <img 
                              src={item.images?.[0] || item.coverImage || "/placeholder-car.jpg"} 
                              alt={`${item.make} ${item.model}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                              <Badge className="bg-primary text-white font-black text-[9px] uppercase px-3 py-1.5 shadow-2xl">
                                {item.score}% Match
                              </Badge>
                              {item.condition && (
                                <Badge className="bg-background/90 text-foreground font-black text-[9px] uppercase px-3 py-1.5 shadow-2xl">
                                  {item.condition}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="p-6 space-y-4">
                            {/* SHOWROOM BRANDING BADGE */}
                            {item.showroom && (
                              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/50">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-xl bg-card border border-border flex items-center justify-center font-black text-xs text-primary shrink-0">
                                    {item.showroom.name?.charAt(0) || 'V'}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase text-foreground flex items-center gap-1">
                                      {item.showroom.name} {item.showroom.verified && <ShieldCheck size={12} className="text-emerald-500" />}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                      <MapPin size={10} className="text-primary" /> {item.location || item.showroom.city}
                                    </p>
                                  </div>
                                </div>
                                <Link href={`/showrooms/${item.showroom.slug || item.showroom.id}`}>
                                  <Badge className="bg-primary/10 text-primary hover:bg-primary hover:text-white border-none text-[8px] font-black uppercase cursor-pointer">
                                    Visit Dealership
                                  </Badge>
                                </Link>
                              </div>
                            )}

                            <div>
                              <p className="text-[10px] font-black uppercase text-primary tracking-widest">{item.make}</p>
                              <h3 className="text-2xl font-black text-foreground uppercase tracking-tight leading-snug">
                                {item.model}
                              </h3>
                              <p className="text-2xl font-black text-foreground mt-2">
                                TSh {(item.price || item.discountPrice || item.pricePerDay || 0).toLocaleString()}
                              </p>
                            </div>

                            {/* PERKS BADGES */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {item.hasDriver && (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold uppercase">
                                  Chauffeur Option
                                </Badge>
                              )}
                              {item.testDriveAvailable && (
                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px] font-bold uppercase">
                                  Test Drive Ready
                                </Badge>
                              )}
                              {item.transmission && (
                                <Badge className="bg-muted text-muted-foreground border-border text-[9px] font-bold uppercase">
                                  {item.transmission}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0 flex items-center gap-3">
                          <Link href={`/cars/${item.id}`} className="flex-1">
                            <Button className="w-full rounded-2xl bg-primary text-white font-black text-xs uppercase shadow-xl shadow-primary/20">
                              View Vehicle Specs
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="rounded-2xl h-14 px-10 border-border text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:bg-muted"
                    >
                      Reset Quiz Filters
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
