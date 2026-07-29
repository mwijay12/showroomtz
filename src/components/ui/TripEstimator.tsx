'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Car as CarIcon, 
  TrendingUp, 
  Plus,
  Minus,
  Zap,
  ShieldCheck,
  Calculator,
  Building2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import Link from 'next/link';

const TZ_HUBS = [
  "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Mbeya", 
  "Zanzibar", "Tanga", "Morogoro", "Iringa", "Moshi"
];

const REGISTRATION_FEE = 450000; // TSh for plates & registration
const DEALER_PREP_FEE = 250000;   // TSh inspection & detailing
const EXTENDED_WARRANTY_FEE = 500000; // TSh optional 1-yr dealer warranty

export function TripEstimator() {
  const db = useFirestore();
  const [hub, setHub] = useState("Dar es Salaam");
  const [paymentPlan, setPaymentPlan] = useState<"cash" | "financing">("cash");
  const [financeMonths, setFinanceMonths] = useState(12);
  const [includeWarranty, setIncludeWarranty] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState("");

  const carsQuery = useMemoFirebase(
    () => query(collection(db, "cars"), where("status", "==", "available"), limit(20)),
    [db]
  );
  const { data: cars } = useCollection(carsQuery);

  const selectedCar = useMemo(
    () => cars?.find(c => c.id === selectedCarId) || cars?.[0],
    [cars, selectedCarId]
  );

  const estimate = useMemo(() => {
    if (!selectedCar) return null;
    const basePrice = Number(selectedCar.discountPrice || selectedCar.price || 50000000);
    const regFee = REGISTRATION_FEE;
    const prepFee = DEALER_PREP_FEE;
    const warrantyFee = includeWarranty ? EXTENDED_WARRANTY_FEE : 0;
    
    const totalCashPrice = basePrice + regFee + prepFee + warrantyFee;

    // 20% down payment for financing
    const downPayment = Math.round(totalCashPrice * 0.20);
    const financedAmount = totalCashPrice - downPayment;
    const monthlyRate = 0.012; // 1.2% estimated monthly interest for vehicle financing
    const monthlyPayment = Math.round(
      (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, financeMonths))) / 
      (Math.pow(1 + monthlyRate, financeMonths) - 1)
    );

    return {
      basePrice,
      regFee,
      prepFee,
      warrantyFee,
      totalCashPrice,
      downPayment,
      financedAmount,
      monthlyPayment,
    };
  }, [selectedCar, includeWarranty, financeMonths]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* INPUT FORM */}
        <div className="executive-card p-6 md:p-10 space-y-8 md:space-y-10">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
               <Calculator size={10} /> Showroom Financial Intelligence
             </div>
             <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Purchase & Financing Calculator</h2>
             <p className="text-muted-foreground text-xs font-medium">Calculate exact total acquisition costs or monthly payments before contacting showroom.</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Select Showroom Car</label>
                <Select value={selectedCarId || (cars?.[0]?.id || "")} onValueChange={setSelectedCarId}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl bg-muted border-none font-bold text-xs"><SelectValue placeholder="Select Vehicle" /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {cars && cars.length > 0 ? (
                      cars.map(c => <SelectItem key={c.id} value={c.id} className="font-bold text-xs">{c.make} {c.model} ({c.year || '2025'})</SelectItem>)
                    ) : (
                      <SelectItem value="default" className="font-bold text-xs">Toyota Land Cruiser (2026)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Delivery / Showroom Hub</label>
                <Select value={hub} onValueChange={setHub}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl bg-muted border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {TZ_HUBS.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 h-12 md:h-14 p-1 bg-muted rounded-xl">
                  <button
                    onClick={() => setPaymentPlan("cash")}
                    className={cn("rounded-lg text-xs font-black uppercase transition-all", paymentPlan === "cash" ? "bg-primary text-white shadow-md" : "text-muted-foreground")}
                  >
                    Outright
                  </button>
                  <button
                    onClick={() => setPaymentPlan("financing")}
                    className={cn("rounded-lg text-xs font-black uppercase transition-all", paymentPlan === "financing" ? "bg-primary text-white shadow-md" : "text-muted-foreground")}
                  >
                    Financing
                  </button>
                </div>
              </div>

              {paymentPlan === "financing" && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Loan Tenure (Months)</label>
                  <div className="flex items-center gap-4 h-12 md:h-14 px-6 bg-muted rounded-xl">
                    <button onClick={() => setFinanceMonths(Math.max(6, financeMonths - 6))} className="text-primary"><Minus size={18} /></button>
                    <span className="flex-1 text-center font-black text-lg">{financeMonths} Mo</span>
                    <button onClick={() => setFinanceMonths(Math.min(48, financeMonths + 6))} className="text-primary"><Plus size={18} /></button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 md:p-6 bg-primary/5 rounded-2xl border border-primary/10">
               <div>
                 <p className="text-[10px] md:text-[11px] font-black uppercase">Verified Dealer Warranty Package</p>
                 <p className="text-[8px] text-muted-foreground uppercase">TSh 500,000 (1 Year Coverage & Maintenance)</p>
               </div>
               <button 
                 onClick={() => setIncludeWarranty(!includeWarranty)} 
                 className={cn("h-9 md:h-10 px-6 rounded-xl font-black text-[10px] uppercase transition-all", includeWarranty ? "bg-primary text-white shadow-xl" : "bg-muted text-muted-foreground")}
               >
                 {includeWarranty ? "Included" : "None"}
               </button>
            </div>
          </div>
        </div>

        {/* ESTIMATE OUTPUT DISPLAY */}
        <div className="space-y-6 md:space-y-8">
          <AnimatePresence mode="wait">
            {estimate && (
              <motion.div 
                key={`${selectedCarId}-${paymentPlan}-${financeMonths}-${includeWarranty}`} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6 md:space-y-8"
              >
                <div className="executive-card p-8 md:p-10 bg-primary text-white space-y-4 md:space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><TrendingUp size={160} /></div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                     {paymentPlan === "cash" ? "Total Vehicle Acquisition Price" : "Estimated Monthly Financing Installment"}
                   </p>
                   <div className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums">
                     TSh <AnimatedCounter end={paymentPlan === "cash" ? estimate.totalCashPrice : estimate.monthlyPayment} />
                     {paymentPlan === "financing" && <span className="text-base md:text-xl text-white/60 font-bold"> / mo</span>}
                   </div>
                   <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <MapPin size={16} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Showroom Delivery Hub: {hub}</span>
                      </div>
                      <Badge className="bg-white/20 text-white border-none uppercase text-[8px] px-3">
                        {paymentPlan === "cash" ? "Full Purchase" : `${financeMonths} Months Plan`}
                      </Badge>
                   </div>
                </div>

                <div className="executive-card p-6 md:p-10 space-y-6 md:space-y-8">
                   <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-primary border-b border-border pb-4">Acquisition Breakdown</h3>
                   <div className="space-y-4">
                      {[
                        { icon: <CarIcon size={16} />, label: "Showroom Asking Price", val: `TSh ${estimate.basePrice.toLocaleString()}`, sub: selectedCar ? `${selectedCar.make} ${selectedCar.model}` : "Vehicle Base Price" },
                        { icon: <Building2 size={16} />, label: "Registration & Plates", val: `TSh ${estimate.regFee.toLocaleString()}`, sub: "Tanzania Revenue & TRA Plates" },
                        { icon: <ShieldCheck size={16} />, label: "Showroom Dealer Inspection", val: `TSh ${estimate.prepFee.toLocaleString()}`, sub: "Pre-delivery Service & Detailing" },
                        { icon: <Zap size={16} />, label: "1-Yr Dealer Warranty", val: `TSh ${estimate.warrantyFee.toLocaleString()}`, sub: includeWarranty ? "Active Full Coverage" : "Opted Out" },
                        ...(paymentPlan === "financing" ? [
                          { icon: <TrendingUp size={16} />, label: "Estimated Down Payment (20%)", val: `TSh ${estimate.downPayment.toLocaleString()}`, sub: "Initial Showroom Deposit" },
                          { icon: <Calculator size={16} />, label: "Financed Amount", val: `TSh ${estimate.financedAmount.toLocaleString()}`, sub: `Spread over ${financeMonths} Months` },
                        ] : [])
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-muted flex items-center justify-center text-primary">{item.icon}</div>
                            <div>
                              <p className="text-[9px] md:text-[10px] font-black uppercase text-foreground leading-none">{item.label}</p>
                              <p className="text-[7px] md:text-[8px] font-bold text-muted-foreground uppercase mt-1">{item.sub}</p>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm font-black text-foreground">{item.val}</p>
                        </div>
                      ))}
                   </div>

                   <div className="pt-4">
                     <Link href={selectedCar ? `/cars/${selectedCar.id}#inquire` : "/cars"}>
                       <Button className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-primary/90">
                         Inquire Showroom Dealer Now <Zap size={14} className="ml-2 fill-current" />
                       </Button>
                     </Link>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
