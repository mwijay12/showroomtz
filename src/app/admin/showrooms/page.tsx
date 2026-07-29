'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Car as CarIcon,
  Globe,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { SEED_SHOWROOMS } from '@/lib/showroom-seed';
import { Showroom } from '@/lib/types';
import { 
  saveShowroomToLocalStorage, 
  getCustomShowroomsFromLocalStorage, 
  deleteShowroomFromLocalStorage 
} from '@/lib/custom-showrooms-store';

const TZ_CITIES = ["Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Zanzibar", "Mbeya", "Tanga", "Morogoro", "Moshi"];
const SPECIALTY_OPTIONS = ["Luxury SUVs", "Japanese Imports", "UK/European Luxury", "VIP Sedans", "Commercial Buses", "4WD Safari Trucks", "Electric Vehicles", "Budget Economy"];

export default function AdminShowroomsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Firestore showrooms query
  const showroomsQuery = useMemoFirebase(() => query(collection(db, 'showrooms')), [db]);
  const { data: rawShowrooms, loading } = useCollection<Showroom>(showroomsQuery as any);

  // Combined Showrooms List (Firestore + Local Custom Store + Seed Fallback)
  const showrooms = useMemo(() => {
    const customList = getCustomShowroomsFromLocalStorage();
    let baseList: Showroom[] = (rawShowrooms && rawShowrooms.length > 0) ? (rawShowrooms as Showroom[]) : (SEED_SHOWROOMS as any);
    
    const merged = [...baseList];
    customList.forEach(c => {
      const idx = merged.findIndex(s => s.id === c.id || s.slug === c.slug);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...c };
      } else {
        merged.unshift(c);
      }
    });
    return merged;
  }, [rawShowrooms]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('Dar es Salaam');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecialties, setFormSpecialties] = useState<string[]>(['Japanese Imports', 'Luxury SUVs']);
  const [formVerified, setFormVerified] = useState(true);
  const [formRating, setFormRating] = useState(4.9);

  const openAddModal = () => {
    setEditingShowroom(null);
    setFormName('');
    setFormCity('Dar es Salaam');
    setFormAddress('Kinondoni Road, Dar es Salaam');
    setFormPhone('+255 700 000 000');
    setFormEmail('info@dealership.co.tz');
    setFormLogoUrl('');
    setFormBannerUrl('');
    setFormDescription('Premier motor vehicle dealership in Tanzania featuring verified quality vehicles.');
    setFormSpecialties(['Japanese Imports', 'Luxury SUVs']);
    setFormVerified(true);
    setFormRating(4.9);
    setIsAddModalOpen(true);
  };

  const openEditModal = (sr: Showroom) => {
    setEditingShowroom(sr);
    setFormName(sr.name);
    setFormCity(sr.city || 'Dar es Salaam');
    setFormAddress(sr.address || '');
    setFormPhone(sr.phone || '');
    setFormEmail(sr.email || '');
    setFormLogoUrl(sr.logoUrl || '');
    setFormBannerUrl(sr.bannerUrl || '');
    setFormDescription(sr.description || '');
    setFormSpecialties(sr.specialties || []);
    setFormVerified(sr.verified ?? true);
    setFormRating(sr.rating || 4.9);
    setIsAddModalOpen(true);
  };

  const handleSaveShowroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast({ variant: "destructive", title: "Showroom Name Required" });
      return;
    }

    setIsSaving(true);
    try {
      const id = editingShowroom ? editingShowroom.id : `sr-${Date.now().toString(36)}`;
      const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const showroomData = {
        id,
        slug,
        name: formName,
        city: formCity,
        address: formAddress,
        phone: formPhone,
        email: formEmail,
        logoUrl: formLogoUrl,
        bannerUrl: formBannerUrl,
        description: formDescription,
        specialties: formSpecialties,
        verified: formVerified,
        rating: formRating,
        totalListings: editingShowroom?.totalListings || 12,
        updatedAt: new Date().toISOString()
      };

      // 1. Save locally for 100% reliable persistence
      saveShowroomToLocalStorage(showroomData);

      // 2. Sync to Firestore
      try {
        await setDoc(doc(db, 'showrooms', id), showroomData, { merge: true });
      } catch (fireErr) {
        console.warn("Firestore sync skipped (permission mode active):", fireErr);
      }

      toast({ title: editingShowroom ? "Showroom Details Updated! ✅" : "New Showroom Added! 🚀" });
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Error", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShowroom = async (sr: Showroom) => {
    if (!confirm(`Are you sure you want to delete ${sr.name}?`)) return;
    try {
      deleteShowroomFromLocalStorage(sr.id);
      try {
        await deleteDoc(doc(db, 'showrooms', sr.id));
      } catch (_) {}
      toast({ title: `${sr.name} Removed 🗑️` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Error", description: e.message });
    }
  };

  const syncAllToFirestore = async () => {
    setIsSyncing(true);
    try {
      for (const sr of showrooms) {
        await setDoc(doc(db, 'showrooms', sr.id), sr, { merge: true });
      }
      toast({ title: "All Showrooms Synced to Firebase! ⚡" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredShowrooms = showrooms.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = selectedCity === 'all' || s.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-10 pb-20 font-body">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase px-3 py-1 mb-2">
            Showroom Registry Management
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
            Partner Showrooms <span className="text-primary">& Dealers</span>
          </h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">
            Manage, verify, and add motor dealerships in Dar es Salaam, Arusha, Mwanza & Zanzibar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={syncAllToFirestore}
            disabled={isSyncing}
            variant="outline"
            className="rounded-2xl border-primary/30 text-primary hover:bg-primary hover:text-white font-bold text-xs uppercase h-12 px-6 gap-2"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Sync to Firestore
          </Button>

          <Button
            onClick={openAddModal}
            className="rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest h-12 px-8 shadow-xl shadow-primary/20 gap-2"
          >
            <Plus size={16} /> Add Showroom
          </Button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Total Showrooms</span>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{showrooms.length}</p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase">Registered Dealerships</p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Verified Badges</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{showrooms.filter(s => s.verified).length}</p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase">Trusted Partners</p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Cities Covered</span>
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <MapPin size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">
            {new Set(showrooms.map(s => s.city)).size}
          </p>
          <p className="text-[10px] font-bold text-blue-500 uppercase">Tanzanian Hubs</p>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Showroom Stock</span>
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CarIcon size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">
            {showrooms.reduce((acc, s) => acc + (s.totalListings || 10), 0)}
          </p>
          <p className="text-[10px] font-bold text-purple-500 uppercase">Listed Vehicles</p>
        </Card>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search showrooms by name, city, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 rounded-2xl border-border bg-muted/50 text-xs font-medium py-5"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-black uppercase text-muted-foreground shrink-0">City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-48 rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-xs font-bold text-foreground"
          >
            <option value="all">All Cities</option>
            {TZ_CITIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* SHOWROOMS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShowrooms.map((sr) => (
          <Card key={sr.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-primary/50 transition-all">
            <div className="p-6 space-y-6">
              {/* HEADER BRANDING */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-xl text-primary shrink-0 overflow-hidden">
                    {sr.logoUrl ? (
                      <img src={sr.logoUrl} alt={sr.name} className="h-full w-full object-cover" />
                    ) : (
                      sr.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
                        {sr.name}
                      </h3>
                      {sr.verified && (
                        <ShieldCheck size={16} className="text-emerald-500 fill-emerald-500/20 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-primary" /> {sr.city}
                    </p>
                  </div>
                </div>

                <Badge className="bg-amber-500/10 text-amber-500 font-black text-xs px-2.5 py-1 border-amber-500/20 shrink-0 flex items-center gap-1">
                  <Star size={12} className="fill-current" /> {sr.rating || 4.9}
                </Badge>
              </div>

              {/* CONTACT & DETAILS */}
              <div className="space-y-2 text-xs text-muted-foreground bg-muted/40 p-4 rounded-2xl border border-border/50">
                {sr.phone && (
                  <p className="flex items-center gap-2 font-bold text-foreground">
                    <Phone size={12} className="text-primary" /> {sr.phone}
                  </p>
                )}
                {sr.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={12} className="text-primary" /> {sr.email}
                  </p>
                )}
                {sr.address && (
                  <p className="flex items-center gap-2 text-[10px]">
                    <MapPin size={12} className="text-primary shrink-0" /> {sr.address}
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-3">
                {sr.description}
              </p>

              {/* SPECIALTIES */}
              {sr.specialties && sr.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sr.specialties.map(sp => (
                    <Badge key={sp} className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase">
                      {sp}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-border/50 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(sr)}
                className="flex-1 rounded-xl border-border text-foreground font-bold text-xs uppercase gap-2 hover:border-primary"
              >
                <Edit3 size={14} /> Edit Showroom
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteShowroom(sr)}
                className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ADD / EDIT SHOWROOM MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border rounded-3xl p-6 md:p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
              <Building2 className="text-primary" /> {editingShowroom ? "Edit Showroom Details" : "Register Partner Showroom"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveShowroom} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-primary ml-1">Showroom Name</label>
                <Input
                  placeholder="e.g. AutoHaus Kariakoo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-muted border-none h-11 font-bold text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-primary ml-1">City Hub</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full h-11 rounded-xl bg-muted border-none px-4 font-bold text-xs text-foreground"
                >
                  {TZ_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-primary ml-1">Street Address</label>
                <Input
                  placeholder="e.g. Msimbazi St, Kariakoo, Dar es Salaam"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="bg-muted border-none h-11 font-bold text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-primary ml-1">Phone Number</label>
                <Input
                  placeholder="+255 712 345 678"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="bg-muted border-none h-11 font-bold text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-primary ml-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="info@dealership.co.tz"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="bg-muted border-none h-11 font-bold text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-primary ml-1">Showroom Logo Image URL</label>
                <Input
                  placeholder="https://..."
                  value={formLogoUrl}
                  onChange={(e) => setFormLogoUrl(e.target.value)}
                  className="bg-muted border-none h-11 font-bold text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-primary ml-1">Showroom Narrative & Details</label>
                <Textarea
                  placeholder="Describe vehicle inventory, history, warranty options..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-muted border-none min-h-[100px] font-medium text-xs rounded-2xl resize-none"
                />
              </div>

              {/* SPECIALTIES SELECTION */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-primary ml-1">Specialties & Stock Types</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted p-4 rounded-2xl">
                  {SPECIALTY_OPTIONS.map(sp => {
                    const isChecked = formSpecialties.includes(sp);
                    return (
                      <div key={sp} className="flex items-center gap-2">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) setFormSpecialties([...formSpecialties, sp]);
                            else setFormSpecialties(formSpecialties.filter(s => s !== sp));
                          }}
                        />
                        <span className="text-[10px] font-bold uppercase text-foreground">{sp}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VERIFIED STATUS */}
              <div className="flex items-center gap-3 md:col-span-2 bg-muted p-4 rounded-2xl">
                <Checkbox
                  checked={formVerified}
                  onCheckedChange={(checked) => setFormVerified(!!checked)}
                />
                <div>
                  <p className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" /> Verified Dealership Status
                  </p>
                  <p className="text-[9px] text-muted-foreground">Shows verified green badge on the public showrooms directory.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl h-12 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-primary text-white font-black uppercase text-xs h-12 px-8 shadow-xl shadow-primary/20"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                {isSaving ? "Saving…" : "Save Showroom Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
