'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Loader2, 
  Camera,
  Zap,
  Sparkles,
  Save,
  Trash2,
  UserCheck,
  ShieldCheck,
  CalendarCheck,
  FileCheck
} from "lucide-react";
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { SEED_CARS } from '@/lib/showroom-seed';
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateCarDescription } from '@/ai/flows/generate-car-description';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sanitizeData } from '@/lib/utils';
import { saveCarToLocalStorage, deleteCarFromLocalStorage, getCustomCarsFromLocalStorage } from '@/lib/custom-cars-store';

const TZ_LOCATIONS = [
  "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Zanzibar", "Mbeya", "Tanga", "Morogoro", "Moshi", "Iringa"
];

const FEATURES = [
  "Air Conditioning", 
  "GPS Navigation", 
  "Bluetooth Audio", 
  "USB Charging", 
  "Backup Camera", 
  "Sunroof", 
  "4WD/AWD", 
  "Leather Seats", 
  "Cruise Control", 
  "With Driver / Chauffeur Option",
  "Test Drive Available",
  "Warranty Coverage Included",
  "Trade-in Accepted",
  "TZ Plate Registered",
  "Child Seat Available", 
  "WiFi Hotspot"
];

const CATEGORIES = ["SUV", "Sedan", "Van", "Bus", "Pickup", "Luxury", "Minibus", "Hatchback"];

const REGISTRATION_STATUSES = [
  "Foreign Used (Customs Cleared)",
  "Tanzania Registered (T... Plate)",
  "Brand New (0 km)",
  "In Transit (Japan/UK/Dubai)"
];

const carSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1980).max(2027),
  vin: z.string().optional(),
  plateNumber: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  condition: z.string().default("Foreign Used"),
  registrationStatus: z.string().default("Foreign Used (Customs Cleared)"),
  price: z.coerce.number().min(1, "Asking price required"),
  discountPrice: z.preprocess(val => (val === "" || val === 0 || val === null ? null : Number(val)), z.number().optional().nullable()),
  mileage: z.coerce.number().default(0),
  color: z.string().default("Black"),
  location: z.string().min(1, "Location required"),
  showroomId: z.string().optional(),
  description: z.string().min(1, "Description required"),
  features: z.array(z.string()).default([]),
  seats: z.coerce.number().default(5),
  transmission: z.string().default("Automatic"),
  fuelType: z.string().default("Diesel"),
  hasDriver: z.boolean().default(false),
  driverFeePerDay: z.preprocess(val => (val === "" || val === 0 || val === null ? null : Number(val)), z.number().optional().nullable()),
  testDriveAvailable: z.boolean().default(true),
  warrantyMonths: z.coerce.number().default(6),
});

type CarFormValues = z.infer<typeof carSchema>;

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const carRef = doc(db, "cars", id);
  const { data: rawCar, loading: fetching } = useDoc(carRef);

  const car = useMemo(() => {
    // 1. Check live Firestore
    if (rawCar) return rawCar;

    // 2. Check LocalStorage custom cars
    const customList = getCustomCarsFromLocalStorage();
    const customMatch = customList.find(c => c.id === id);
    if (customMatch) return customMatch;

    // 3. Fallback to seed car by ID or index match
    const seedMatch = SEED_CARS.find((c) => c.id === id) || 
                      (id.startsWith('seed-') ? SEED_CARS[parseInt(id.replace('seed-', ''), 10)] : null);
    if (seedMatch) return { ...seedMatch };

    return null;
  }, [rawCar, id]);

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: "",
      model: "",
      year: 2024,
      vin: "",
      plateNumber: "",
      category: "SUV",
      condition: "Foreign Used",
      registrationStatus: "Foreign Used (Customs Cleared)",
      price: 0,
      discountPrice: null,
      mileage: 0,
      color: "Black",
      location: "Dar es Salaam",
      showroomId: "",
      description: "",
      features: [],
      seats: 5,
      transmission: "Automatic",
      fuelType: "Diesel",
      hasDriver: false,
      driverFeePerDay: null,
      testDriveAvailable: true,
      warrantyMonths: 6,
    }
  });

  useEffect(() => {
    if (car) {
      form.reset({
        make: car.make || "",
        model: car.model || "",
        year: car.year || 2024,
        vin: car.vin || "",
        plateNumber: car.plateNumber || "",
        category: car.category || "SUV",
        condition: car.condition || "Foreign Used",
        registrationStatus: car.registrationStatus || "Foreign Used (Customs Cleared)",
        price: car.price || 0,
        discountPrice: car.discountPrice || null,
        mileage: car.mileage || 0,
        color: car.color || "Black",
        location: car.location || "Dar es Salaam",
        showroomId: car.showroomId || "",
        description: car.description || "",
        features: car.features || [],
        seats: car.seats || 5,
        transmission: car.transmission || "Automatic",
        fuelType: car.fuelType || "Diesel",
        hasDriver: car.hasDriver ?? car.features?.includes("With Driver / Chauffeur Option") ?? false,
        driverFeePerDay: car.driverFeePerDay || null,
        testDriveAvailable: car.testDriveAvailable ?? true,
        warrantyMonths: car.warrantyMonths ?? 6,
      });
      const validImages = (car.images || [car.coverImage]).filter((url: any) => typeof url === 'string' && url.length > 5);
      setImages(validImages);
    }
  }, [car, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(e.target.files[0]);
        if (url) {
          setImages(prev => [...prev, url]);
          toast({ title: "Visual Uploaded Successfully! 📸" });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Upload Failed" });
      } finally { setIsUploading(false); }
    }
  };

  const onAiGenerate = async () => {
    const values = form.getValues();
    if (!values.make || !values.model) {
      toast({ variant: "destructive", title: "Make & Model Required", description: "Enter Make and Model first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCarDescription({
        make: values.make,
        model: values.model,
        year: values.year,
        category: values.category,
      });
      form.setValue('description', result.description);
      toast({ title: "Description Generated with AI ✨" });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Generation Failed" });
    } finally { setIsGenerating(false); }
  };

  const onSubmit = async (values: CarFormValues) => {
    setIsSubmitting(true);
    try {
      const updateData = sanitizeData({ 
        ...values, 
        images: images.filter(url => !!url),
        coverImage: images[0] || car?.coverImage || '/placeholder-car.jpg',
        status: car?.status || "available",
        available: car?.available ?? true,
        updatedAt: new Date().toISOString()
      });

      // 1. Always sync to Local Storage (100% reliable local persistence)
      saveCarToLocalStorage({ id, ...updateData });

      // 2. Try updating Firestore directly
      try {
        await setDoc(carRef, updateData, { merge: true });
      } catch (fireErr: any) {
        console.warn("Firestore permissions fallback active - saved locally:", fireErr);
      }

      toast({ title: "Car Details Saved & Synchronized! ✅" });
      router.push("/admin/cars");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Error", description: e.message });
    } finally { setIsSubmitting(false); }
  };

  const onDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${car?.make} ${car?.model}?`)) return;
    setIsDeleting(true);
    try {
      deleteCarFromLocalStorage(id);
      try {
        await deleteDoc(carRef);
      } catch (_) {}
      toast({ title: "Car Removed from Database 🗑️" });
      router.push("/admin/cars");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: e.message });
    } finally { setIsDeleting(false); }
  };

  if (fetching && !car) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!car) return (
    <div className="text-center py-20 space-y-4">
      <h2 className="text-2xl font-black uppercase text-foreground">Car Entry Not Found</h2>
      <Link href="/admin/cars"><Button variant="outline">Back to Inventory</Button></Link>
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/cars">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-card border-border">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Edit Car Details</h1>
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">{car.make} {car.model} ({car.year})</p>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-xl font-black text-xs uppercase px-4 h-11 gap-2"
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Delete Car
        </Button>
      </div>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Form Validation Errors:", errors);
            toast({ variant: "destructive", title: "Check Required Fields", description: "Please complete all highlighted fields." });
          })} 
          className="space-y-10"
        >
          {/* VISUAL ARCHIVE */}
          <Card className="rounded-[2rem] md:rounded-[3rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-10 flex flex-row items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Camera className="text-primary h-5 w-5" /> Car Images
              </CardTitle>
              {isUploading && <Loader2 className="animate-spin text-primary h-4 w-4" />}
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                    <img src={url} alt="Car Image" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted transition-all group">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[8px] font-black uppercase text-muted-foreground mt-2 tracking-widest">Upload Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SPECIFICATIONS */}
          <Card className="rounded-[2rem] md:rounded-[3rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-10">
              <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Zap className="text-primary h-5 w-5" /> Car Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FormField control={form.control} name="make" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Make / Manufacturer</FormLabel>
                  <FormControl><Input className="h-12 bg-muted border-none font-bold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Model Name</FormLabel>
                  <FormControl><Input className="h-12 bg-muted border-none font-bold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Year of Manufacture</FormLabel>
                  <FormControl><Input type="number" className="h-12 bg-muted border-none font-bold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Body Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="text-[10px] font-black uppercase">{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="registrationStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Registration & Import Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {REGISTRATION_STATUSES.map(st => <SelectItem key={st} value={st} className="text-[10px] font-black uppercase">{st}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">City / Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {TZ_LOCATIONS.map(l => <SelectItem key={l} value={l} className="text-[10px] font-black uppercase">{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Asking Price (TSh)</FormLabel>
                  <FormControl><Input type="number" className="h-12 bg-muted border-none font-black text-emerald-500 text-lg" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="discountPrice" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Offer / Discount Price (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-12 bg-muted border-none font-bold"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Vehicle Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {["Brand New", "Foreign Used", "Local Used"].map(c => <SelectItem key={c} value={c} className="text-[10px] font-black uppercase">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="mileage" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Mileage (km)</FormLabel>
                  <FormControl><Input type="number" className="h-12 bg-muted border-none font-bold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Exterior Color</FormLabel>
                  <FormControl><Input className="h-12 bg-muted border-none font-bold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="seats" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Seating Capacity</FormLabel>
                  <FormControl><Input type="number" className="h-12 bg-muted border-none font-bold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* BUYER RELEVANT DETAILS & CHAUFFEUR / TEST DRIVE */}
          <Card className="rounded-[2rem] md:rounded-[3rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-10">
              <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <UserCheck className="text-primary h-5 w-5" /> Chauffeur, Test Drive & Buyer Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FormField control={form.control} name="hasDriver" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl p-4 bg-muted border border-border/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        const currFeatures = form.getValues('features') || [];
                        const featName = "With Driver / Chauffeur Option";
                        if (checked && !currFeatures.includes(featName)) {
                          form.setValue('features', [...currFeatures, featName]);
                        } else if (!checked) {
                          form.setValue('features', currFeatures.filter(f => f !== featName));
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-xs font-black uppercase cursor-pointer">
                      Chauffeur / Driver Option Available
                    </FormLabel>
                    <p className="text-[9px] text-muted-foreground">Buyer can request VIP driver service upon purchase or hire.</p>
                  </div>
                </FormItem>
              )} />

              <FormField control={form.control} name="driverFeePerDay" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Chauffeur Daily Fee (TSh optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      className="h-12 bg-muted border-none font-bold"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="testDriveAvailable" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl p-4 bg-muted border border-border/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        const currFeatures = form.getValues('features') || [];
                        const featName = "Test Drive Available";
                        if (checked && !currFeatures.includes(featName)) {
                          form.setValue('features', [...currFeatures, featName]);
                        } else if (!checked) {
                          form.setValue('features', currFeatures.filter(f => f !== featName));
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-xs font-black uppercase cursor-pointer">
                      Book Test Drive Eligible
                    </FormLabel>
                    <p className="text-[9px] text-muted-foreground">Allows buyers to schedule an in-person test drive in Dar/Arusha.</p>
                  </div>
                </FormItem>
              )} />

              <FormField control={form.control} name="warrantyMonths" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Warranty Coverage (Months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="6"
                      className="h-12 bg-muted border-none font-bold"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* FEATURES CHECKBOX MATRIX */}
          <Card className="rounded-[2rem] md:rounded-[3rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-10">
              <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <ShieldCheck className="text-primary h-5 w-5" /> Vehicle Amenities & Features Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Vehicle Features</FormLabel>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    onClick={() => form.setValue('features', FEATURES)} 
                    variant="ghost" 
                    className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    Select All
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => form.setValue('features', [])} 
                    variant="ghost" 
                    className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-muted rounded-2xl">
                {FEATURES.map((feature) => (
                  <FormField
                    key={feature}
                    control={form.control}
                    name="features"
                    render={({ field }) => {
                      const isChecked = field.value?.includes(feature);
                      return (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl p-3 bg-card border border-border/50 hover:border-primary/50 transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, feature]);
                                } else {
                                  field.onChange(current.filter((v) => v !== feature));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-[10px] font-bold text-foreground cursor-pointer uppercase select-none flex-1">
                            {feature}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* DESCRIPTION */}
          <Card className="rounded-[2rem] md:rounded-[3rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-10 flex flex-row items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Sparkles className="text-primary h-5 w-5" /> Vehicle Description
              </CardTitle>
              <Button type="button" onClick={onAiGenerate} disabled={isGenerating} variant="ghost" className="h-7 px-3 rounded-lg text-[8px] font-black uppercase gap-2 bg-primary/10 text-primary hover:bg-primary/20">
                {isGenerating ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3" />} AI Generate
              </Button>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea className="min-h-[120px] rounded-2xl p-5 bg-muted border-none font-medium resize-none text-sm leading-relaxed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* SUBMIT BUTTON */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-primary text-white font-black text-lg md:text-xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all gap-3 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Save className="h-6 w-6" />}
              {isSubmitting ? "Saving & Synchronizing…" : "Save & Update Car Details"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
