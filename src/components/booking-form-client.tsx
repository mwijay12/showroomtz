'use client';

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CheckCircle2, 
  Loader2, 
  Calendar as CalendarIcon,
  Zap,
  Building2,
  ShieldCheck,
  Phone,
  User,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, where, limit } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TZ_CITIES = [
  "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Mbeya", 
  "Zanzibar", "Tanga", "Morogoro", "Iringa", "Moshi"
];

const formSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle selection required"),
  inquiryType: z.string().default("purchase"),
  city: z.string().default("Dar es Salaam"),
  preferredDate: z.date({ required_error: "Preferred visit/test drive date required" }),
  fullName: z.string().min(2, "Full name required"),
  phoneNumber: z.string().min(10, "Valid phone required"),
  email: z.string().email("Valid email required"),
  paymentPreference: z.string().default("cash"),
  notes: z.string().optional(),
});

export function BookingFormClient() {
  const router = useRouter();
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialModelId = searchParams.get("model");

  const { data: profile } = useDoc(user ? doc(db, 'users', user.uid) : null);

  const carsQuery = useMemoFirebase(() => {
    return query(collection(db, "cars"), where("status", "==", "available"), limit(50));
  }, [db]);

  const { data: cars, loading: carsLoading } = useCollection(carsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: initialModelId || "",
      inquiryType: "purchase",
      city: "Dar es Salaam",
      fullName: "",
      phoneNumber: "",
      email: "",
      paymentPreference: "cash",
      notes: "",
      preferredDate: new Date(),
    },
  });

  useEffect(() => {
    if (user) {
      if (user.displayName && !form.getValues('fullName')) {
        form.setValue('fullName', user.displayName);
      }
      if (user.email && !form.getValues('email')) {
        form.setValue('email', user.email);
      }
    }
    if (profile?.phoneNumber && !form.getValues('phoneNumber')) {
      form.setValue('phoneNumber', profile.phoneNumber);
    }
  }, [user, profile, form]);

  const watchVehicleId = form.watch('vehicleId');
  const selectedCar = cars?.find(c => c.id === watchVehicleId);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedCar) {
      toast({ variant: "destructive", title: "Select a Vehicle", description: "Please choose a vehicle from the showroom list." });
      return;
    }
    
    setIsSubmitting(true);
    
    const inquiriesRef = collection(db, "inquiries");
    const newDocRef = doc(inquiriesRef);
    
    const inquiryData = {
      id: newDocRef.id,
      inquiryCode: `VOLTA-INQ-${newDocRef.id.slice(-6).toUpperCase()}`,
      userId: user?.uid || null,
      userEmail: values.email,
      userName: values.fullName,
      userPhone: values.phoneNumber,
      vehicleId: selectedCar.id,
      vehicleName: `${selectedCar.make} ${selectedCar.model}`,
      vehiclePrice: selectedCar.discountPrice || selectedCar.price || 0,
      showroomId: selectedCar.showroomId || '',
      showroomName: selectedCar.showroomName || 'Volta Partner Showroom',
      inquiryType: values.inquiryType,
      paymentPreference: values.paymentPreference,
      city: values.city,
      preferredDate: values.preferredDate.toISOString(),
      notes: values.notes || '',
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(newDocRef, inquiryData);
      
      setSubmittedData({ ...inquiryData, car: selectedCar });
      toast({ 
        title: "Showroom Inquiry Submitted", 
        description: `Reference #${inquiryData.inquiryCode} — The showroom owner will contact you shortly.` 
      });
    } catch (e: any) {
      console.error("Submission Error:", e);
      toast({ variant: "destructive", title: "Submission Error", description: e.message || "Failed to submit inquiry." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedData) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-8">
        <Card className="bg-card border-border rounded-3xl p-8 md:p-12 shadow-2xl text-center space-y-6">
          <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 size={40} />
          </div>
          <div>
            <Badge className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-full mb-3">
              Inquiry Confirmed
            </Badge>
            <h2 className="text-3xl font-black uppercase text-foreground tracking-tight">Showroom Request Sent</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Reference Code: <span className="font-mono text-primary font-bold">{submittedData.inquiryCode}</span>
            </p>
          </div>

          <div className="p-6 bg-muted/40 rounded-2xl border border-border text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground uppercase font-bold">Vehicle:</span>
              <span className="font-black text-foreground">{submittedData.vehicleName}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground uppercase font-bold">Showroom Dealer:</span>
              <span className="font-black text-primary">{submittedData.showroomName}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground uppercase font-bold">Inquiry Type:</span>
              <span className="font-bold text-foreground capitalize">{submittedData.inquiryType} Request</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase font-bold">Contact Phone:</span>
              <span className="font-bold text-foreground">{submittedData.userPhone}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild variant="outline" className="w-full h-12 rounded-xl border-border font-black text-xs uppercase tracking-widest">
              <Link href="/cars">Browse More Vehicles</Link>
            </Button>
            <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl">
              <Link href="/showrooms">Explore Showrooms</Link>
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card border-border rounded-3xl p-6 md:p-10 shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2 border-b border-border pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                <Building2 size={10} /> Verified Showroom Protocol
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Vehicle Purchase & Test Drive Form</h2>
              <p className="text-xs text-muted-foreground">Submit your inquiry directly to the verified showroom owner.</p>
            </div>

            {/* VEHICLE SELECTION */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Target Vehicle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted border-border font-bold text-sm">
                        <SelectValue placeholder={carsLoading ? "Loading vehicles..." : "Select Vehicle from Showroom Catalog"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border rounded-2xl max-h-72">
                      {cars?.map((car: any) => (
                        <SelectItem key={car.id} value={car.id} className="font-bold text-xs">
                          {car.make} {car.model} ({car.year || '2026'}) — TSh {(car.discountPrice || car.price)?.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* INQUIRY DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="inquiryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Inquiry Purpose</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-muted border-border font-bold text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border rounded-xl">
                        <SelectItem value="purchase">Outright Purchase</SelectItem>
                        <SelectItem value="financing">Bank / Dealer Financing</SelectItem>
                        <SelectItem value="test_drive">Schedule Test Drive</SelectItem>
                        <SelectItem value="trade_in">Trade-in Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Showroom City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-muted border-border font-bold text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border rounded-xl">
                        {TZ_CITIES.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Preferred Visit Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("h-12 rounded-xl bg-muted border-border text-left font-bold text-xs", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border rounded-2xl" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* BUYER CONTACT DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Juma Rashid" className="h-12 rounded-xl bg-muted border-border font-medium text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Phone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+255 7XX XXX XXX" className="h-12 rounded-xl bg-muted border-border font-medium text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="buyer@example.com" className="h-12 rounded-xl bg-muted border-border font-medium text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Additional Questions for Dealer (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ask about car history, TRA documentation, license plate status, or custom delivery..." className="rounded-xl bg-muted border-border font-medium text-xs resize-none h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-primary/90">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Submit Showroom Inquiry"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
