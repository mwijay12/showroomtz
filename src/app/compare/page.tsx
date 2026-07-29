'use client';

import { useCompare } from "@/context/CompareContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  Minus, 
  ArrowLeft, 
  GitCompare,
  Car as CarIcon,
  X,
  Zap,
  ChevronRight,
  Plus,
  Gauge,
  Users,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SEED_CARS } from "@/lib/showroom-seed";
import { Car } from "@/lib/types";

const COMPARE_ROWS = [
  { key: "make",         label: "Make / Manufacturer",   type: "text"   },
  { key: "model",        label: "Model & Variant",       type: "text"   },
  { key: "price",        label: "Asking Price (TZS)",    type: "price"  },
  { key: "year",         label: "Manufacture Year",      type: "number" },
  { key: "condition",    label: "Condition",             type: "text"   },
  { key: "bodyType",     label: "Body Style / Category", type: "text"   },
  { key: "mileage",      label: "Mileage (KM)",          type: "number" },
  { key: "transmission", label: "Transmission",          type: "text"   },
  { key: "fuelType",     label: "Fuel / Energy Type",    type: "text"   },
  { key: "seats",        label: "Seating Capacity",      type: "number" },
  { key: "location",     label: "Location / Hub",        type: "text"   },
  { key: "showroomName", label: "Dealer Showroom",       type: "text"   },
  { key: "status",       label: "Availability",          type: "status" },
];

function CellValue({ 
  value, 
  type,
  isBest,
}: { 
  value: any;
  type: string;
  isBest?: boolean;
}) {
  if (value === undefined || value === null || value === '') {
    return <Minus size={14} className="text-muted-foreground/20 mx-auto" />;
  }

  if (type === "status") {
    const isAvail = String(value).toLowerCase() === 'available';
    return (
      <Badge className={cn("text-[9px] uppercase px-3 py-1 font-black", isAvail ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500")}>
        {value}
      </Badge>
    );
  }

  if (type === "price") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={cn(
          "text-base font-black tracking-tight",
          isBest ? "text-emerald-500" : "text-foreground"
        )}>
          TSh {Number(value).toLocaleString()}
        </span>
        {isBest && (
          <span className="text-[7px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            Best Value Price
          </span>
        )}
      </div>
    );
  }

  if (type === "number" && typeof value === 'number') {
    return (
      <span className="text-sm font-black text-foreground">
        {value.toLocaleString()}
      </span>
    );
  }

  return (
    <span className={cn(
      "text-xs font-black uppercase tracking-tight text-center",
      isBest ? "text-primary" : "text-foreground/90"
    )}>
      {String(value)}
    </span>
  );
}

export default function ComparePage() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  const availableSeedCars = SEED_CARS.filter(c => !compareList.some(item => item.id === c.id));

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <Navbar />

      <main className="flex-1 pt-24 pb-32">
        {/* HEADER BAR */}
        <div className="border-b border-border bg-card/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase px-3 py-1">
                  Vehicle Intelligence Tool
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Side-By-Side Comparison
              </h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Compare price, specifications, condition & dealer details for up to 3 vehicles
              </p>
            </div>

            {compareList.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCompare}
                className="rounded-2xl border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-xs uppercase self-start md:self-auto"
              >
                Clear Selected ({compareList.length})
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-16">
          
          {/* CAR SELECTION QUICK PICKER IF LESS THAN 3 SELECTED */}
          {compareList.length < 3 && (
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" /> 
                    {compareList.length === 0 ? "Select 2 Vehicles to Compare" : "Add Another Vehicle to Compare"}
                  </h3>
                  <p className="text-xs text-muted-foreground">Click any showroom car below to add it to your comparison matrix.</p>
                </div>
                <Badge className="bg-primary text-white font-black text-[9px] uppercase px-3 py-1">
                  {compareList.length} / 3 Selected
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableSeedCars.slice(0, 4).map((car) => (
                  <div
                    key={car.id}
                    onClick={() => addToCompare(car as unknown as Car)}
                    className="group bg-background border border-border hover:border-primary rounded-2xl p-4 cursor-pointer transition-all duration-300 flex items-center gap-4 hover:shadow-lg"
                  >
                    <div className="h-14 w-20 rounded-xl bg-muted overflow-hidden relative shrink-0">
                      <img src={car.images?.[0] || '/placeholder-car.jpg'} alt={car.model} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-primary uppercase">{car.make}</p>
                      <h4 className="text-xs font-black uppercase truncate text-foreground">{car.model}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground">TSh {(car.price || 0).toLocaleString()}</p>
                    </div>
                    <Button size="icon" className="h-8 w-8 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white shrink-0">
                      <Plus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY COMPARISON PROMPT */}
          {compareList.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl p-12 space-y-6 shadow-2xl">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xl">
                <GitCompare size={36} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-black uppercase text-foreground">No Vehicles Added Yet</h2>
                <p className="text-xs text-muted-foreground">
                  Browse our showroom inventory and click the comparison icon (⚖️) on any vehicle card to compare side-by-side.
                </p>
              </div>
              <Link href="/cars">
                <Button className="rounded-2xl bg-primary text-white font-black text-xs uppercase px-8 py-6 shadow-lg shadow-primary/20">
                  Browse Showroom Inventory
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* COMPARISON CARDS HEADER ROW */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
                <div className="hidden md:flex flex-col justify-end p-6 bg-card border border-border rounded-3xl space-y-3">
                  <Badge className="bg-primary/10 text-primary border-none w-fit font-black text-[9px] uppercase px-3 py-1">
                    Matrix Legend
                  </Badge>
                  <h3 className="text-lg font-black uppercase text-foreground">Vehicle Spec Comparison</h3>
                  <p className="text-xs text-muted-foreground">Detailed technical and financial audit of your selected vehicles.</p>
                </div>

                {compareList.map((car) => (
                  <Card key={car.id} className="relative bg-card border-border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCompare(car.id)}
                      className="absolute top-3 right-3 z-20 h-8 w-8 rounded-xl bg-background/80 backdrop-blur-md border border-border hover:bg-rose-500 hover:text-white transition-all shadow-md"
                    >
                      <X size={14} />
                    </Button>

                    <div className="space-y-4">
                      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                        <img 
                          src={car.images?.[0] || car.coverImage || "/placeholder-car.jpg"} 
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-background/90 text-foreground font-black text-[9px] uppercase px-3 py-1">
                            {car.year || '2024'}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{car.make}</span>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-snug">
                          {car.model}
                        </h3>
                        <p className="text-2xl font-black text-foreground">
                          TSh {(car.price || car.discountPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <Link href={`/cars/${car.id}`}>
                        <Button className="w-full rounded-2xl bg-primary text-white font-black text-xs uppercase shadow-lg shadow-primary/20">
                          View Full Specs & Reserve
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              {/* COMPARISON MATRIX TABLE */}
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="divide-y divide-border">
                  {COMPARE_ROWS.map((row, rowIndex) => {
                    const values = compareList.map(car => car[row.key as keyof typeof car]);
                    
                    // Find lowest price
                    let bestIndex = -1;
                    if (row.type === "price") {
                      const nums = values.map(v => Number(v) || Infinity);
                      const min = Math.min(...nums);
                      if (min !== Infinity) bestIndex = nums.indexOf(min);
                    }

                    return (
                      <div
                        key={row.key}
                        className={cn(
                          "grid grid-cols-1 md:grid-cols-4 items-center p-4 md:p-6 transition-colors",
                          rowIndex % 2 === 0 ? "bg-card" : "bg-muted/30"
                        )}
                      >
                        <div className="font-black text-xs uppercase text-muted-foreground tracking-wider mb-2 md:mb-0">
                          {row.label}
                        </div>

                        {values.map((val, colIdx) => (
                          <div key={colIdx} className="py-2 md:py-0 text-center">
                            <CellValue value={val} type={row.type} isBest={bestIndex === colIdx} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
