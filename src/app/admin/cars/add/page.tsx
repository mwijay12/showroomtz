'use client';

import { useState } from 'react';
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  X,
  Loader2,
  Plus,
  Camera,
  ShieldCheck,
  Sparkles,
  Building2,
  DollarSign,
  MapPin,
  Star,
  Wrench,
} from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateCarDescription } from '@/ai/flows/generate-car-description';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sanitizeData } from '@/lib/utils';
import { useCollection, useMemoFirebase } from '@/firebase';
import { query } from 'firebase/firestore';
import { Showroom } from '@/lib/types';

const TZ_LOCATIONS = [
  "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Zanzibar", "Mbeya", "Tanga", "Morogoro", "Moshi", "Iringa"
];

const FEATURES = [
  "Air Conditioning", "GPS Navigation", "Bluetooth Audio", "USB Charging",
  "Backup Camera", "Sunroof", "4WD/AWD", "Leather Seats", "Cruise Control",
  "Push Start", "Keyless Entry", "Heated Seats", "Apple CarPlay", "Android Auto",
  "Parking Sensors", "Lane Assist", "Adaptive Cruise", "360° Camera"
];

const BODY_TYPES = [
  "SUV", "Sedan", "Hatchback", "Coupe", "Convertible", "Wagon",
  "Pickup", "Van", "Minivan", "Bus", "Truck", "Luxury"
] as const;

const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"] as const;
const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "Semi-Automatic"] as const;
const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"] as const;
const CONDITIONS = ["Brand New", "Foreign Used", "Locally Used", "Certified Pre-Owned"] as const;
const CURRENCIES = ["TZS", "USD"] as const;
const COLORS = [
  "Pearl White", "Midnight Black", "Silver Metallic", "Graphite Grey",
  "Sapphire Blue", "Phantom Black", "Crystal Red", "Forest Green", "Sand Beige"
];

// Showcase schema — all optional rental fields removed
const carSchema = z.object({
  make: z.string().min(2, "Make required"),
  model: z.string().min(2, "Model required"),
  variant: z.string().optional(),
  year: z.coerce.number().min(1980).max(2027),
  bodyType: z.enum(BODY_TYPES),
  price: z.coerce.number().min(1, "Asking price required"),
  currency: z.enum(CURRENCIES).default("TZS"),
  discountPrice: z.coerce.number().optional().nullable(),
  monthlyEstimate: z.coerce.number().optional().nullable(),
  mileage: z.coerce.number().default(0),
  condition: z.enum(CONDITIONS).default("Foreign Used"),
  showroomId: z.string().min(1, "Select a showroom"),
  showroomName: z.string().min(1, "Showroom name required"),
  location: z.string().min(1, "Location required"),
  description: z.string().min(10, "Provide at least 10 characters description"),
  features: z.array(z.string()).default([]),
  color: z.string().optional(),
  seats: z.coerce.number().default(5),
  transmission: z.enum(TRANSMISSIONS).default("Automatic"),
  fuelType: z.enum(FUEL_TYPES).default("Petrol"),
  drivetrain: z.enum(DRIVETRAINS).default("FWD"),
  engineSize: z.string().optional(),
  vin: z.string().optional(),
  featured: z.boolean().default(false),
});

type CarFormValues = z.infer<typeof carSchema>;

export default function AddCarPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Live showrooms from Firestore
  const showroomsQuery = useMemoFirebase(() => query(collection(db, 'showrooms')), [db]);
  const { data: showrooms } = useCollection(showroomsQuery);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: "",
      model: "",
      variant: "",
      year: 2024,
      bodyType: "SUV",
      price: 0,
      currency: "TZS",
      discountPrice: null,
      monthlyEstimate: null,
      mileage: 0,
      condition: "Foreign Used",
      showroomId: "",
      showroomName: "",
      location: "Dar es Salaam",
      description: "",
      features: [],
      color: "",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Petrol",
      drivetrain: "FWD",
      engineSize: "",
      vin: "",
      featured: false,
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onAiGenerate = async () => {
    const values = form.getValues();
    if (!values.make || !values.model) {
      toast({ variant: "destructive", title: "Specs Needed", description: "Please enter Make and Model first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCarDescription({
        make: values.make,
        model: values.model,
        year: values.year,
        category: values.bodyType,
      });
      form.setValue('description', result.description);
      toast({ title: "Narrative Generated ✨" });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Sync Failed" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShowroomChange = (showroomId: string) => {
    const sr = (showrooms as Showroom[] | null)?.find(s => s.id === showroomId);
    if (sr) {
      form.setValue('showroomId', sr.id);
      form.setValue('showroomName', sr.name);
      if (!form.getValues('location')) form.setValue('location', sr.city);
    }
  };

  const onSubmit = async (values: CarFormValues) => {
    if (imageFiles.length === 0) {
      toast({ variant: "destructive", title: "Visuals Mandatory", description: "At least one asset image is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
        const url = await uploadToCloudinary(imageFiles[i]);
        if (url) imageUrls.push(url);
      }

      const carData = sanitizeData({
        ...values,
        images: imageUrls,
        available: true,
        status: 'available' as const,
        rating: 0,
        ratingCount: 0,
        views: 0,
        inquiries: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        addedBy: user?.uid || 'admin',
      });

      await addDoc(collection(db, "cars"), carData);

      toast({ title: "Listing Published! 🚀" });
      router.push("/admin/cars");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deployment Failed", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-6">
        <Link href="/admin/cars">
          <Button variant="outline" size="icon" className="rounded-xl bg-card border-border"><ArrowLeft size={20} /></Button>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
            <Sparkles size={11} /> New Listing
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Showcase Vehicle</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
            Add a new car to the platform
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-5xl">
          {/* IMAGES */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Camera className="text-primary h-5" /> Visual Registry
              </CardTitle>
              {isSubmitting && <span className="text-[10px] font-black text-primary">{uploadProgress}% SYNC</span>}
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted transition-all">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-[9px] font-black uppercase text-muted-foreground mt-2">Add Image</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                </label>
              </div>
              {isSubmitting && <Progress value={uploadProgress} className="h-1.5" />}
            </CardContent>
          </Card>

          {/* SHOWROOM + LOCATION */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Building2 className="text-primary h-5" /> Showroom & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="showroomId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Partner Showroom</FormLabel>
                  <Select onValueChange={handleShowroomChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold">
                        <SelectValue placeholder="Choose showroom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {(showrooms as Showroom[] | null)?.map((sr) => (
                        <SelectItem key={sr.id} value={sr.id} className="text-xs font-bold">
                          {sr.name} — {sr.city}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="text-xs font-bold">+ Custom (Direct Seller)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="showroomName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. AutoHaus Kariakoo" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1 flex items-center gap-2">
                    <MapPin size={11} /> City / Hub
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {TZ_LOCATIONS.map(l => (
                        <SelectItem key={l} value={l} className="text-[10px] font-black uppercase">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {CONDITIONS.map(c => (
                        <SelectItem key={c} value={c} className="text-[10px] font-black uppercase">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* SPECS */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Wrench className="text-primary h-5" /> Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="make" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Manufacturer</FormLabel>
                  <FormControl>
                    <Input placeholder="Toyota" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Land Cruiser" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="variant" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Trim / Variant</FormLabel>
                  <FormControl>
                    <Input placeholder="V8 ZX" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Year</FormLabel>
                  <FormControl>
                    <Input type="number" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bodyType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Body Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {BODY_TYPES.map(b => (
                        <SelectItem key={b} value={b} className="text-[10px] font-black uppercase">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Exterior Color</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue placeholder="Pick a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {COLORS.map(c => (
                        <SelectItem key={c} value={c} className="text-[10px] font-black uppercase">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="mileage" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Mileage (km)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="35000" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="seats" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Seating</FormLabel>
                  <FormControl>
                    <Input type="number" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="transmission" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Transmission</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {TRANSMISSIONS.map(t => (
                        <SelectItem key={t} value={t} className="text-[10px] font-black uppercase">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="fuelType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Fuel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {FUEL_TYPES.map(t => (
                        <SelectItem key={t} value={t} className="text-[10px] font-black uppercase">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="drivetrain" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Drivetrain</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {DRIVETRAINS.map(t => (
                        <SelectItem key={t} value={t} className="text-[10px] font-black uppercase">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="engineSize" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Engine / Battery</FormLabel>
                  <FormControl>
                    <Input placeholder="4.0L V6 / 75 kWh" className="h-12 bg-muted border-none font-bold" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="vin" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">VIN / Chassis</FormLabel>
                  <FormControl>
                    <Input placeholder="JTMHV05J504123456" className="h-12 bg-muted border-none font-mono font-bold" {...field} />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* PRICING */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <DollarSign className="text-primary h-5" /> Pricing & Finance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Asking Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="285000000" className="h-12 bg-muted border-none font-black text-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="TZS" className="text-[10px] font-black uppercase">TZS — Tanzanian Shilling</SelectItem>
                      <SelectItem value="USD" className="text-[10px] font-black uppercase">USD — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="discountPrice" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Offer / Discount Price (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      placeholder="270000000"
                      className="h-12 bg-muted border-none font-black text-lg"
                    />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="monthlyEstimate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Finance / Monthly Est. (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      placeholder="4500000"
                      className="h-12 bg-muted border-none font-black text-lg"
                    />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* DESCRIPTION */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Sparkles className="text-primary h-5" /> Description
              </CardTitle>
              <Button
                type="button"
                onClick={onAiGenerate}
                disabled={isGenerating}
                size="sm"
                variant="outline"
                className="rounded-xl border-primary/30 text-primary gap-2"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isGenerating ? 'Generating…' : 'AI Assist'}
              </Button>
            </CardHeader>
            <CardContent className="p-10">
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Describe condition, history, options, story…"
                      className="min-h-[160px] bg-muted border-none font-medium leading-relaxed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* FEATURES */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <ShieldCheck className="text-primary h-5" /> Features & Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Select features</FormLabel>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-muted rounded-2xl">
                {FEATURES.map((feature) => (
                  <FormField
                    key={feature}
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(feature)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, feature])
                                : field.onChange(field.value?.filter((v) => v !== feature));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-[11px] font-bold text-foreground cursor-pointer uppercase">
                          {feature}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FEATURED */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardContent className="p-8">
              <FormField control={form.control} name="featured" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-4 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-black uppercase flex items-center gap-2 cursor-pointer">
                      <Star size={14} className="text-primary" /> Feature on Homepage
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">Show this car in the homepage featured carousel.</p>
                  </div>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 sticky bottom-6">
            <Link href="/admin/cars">
              <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-2xl"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
              {isSubmitting ? 'Publishing…' : 'Publish Listing'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
