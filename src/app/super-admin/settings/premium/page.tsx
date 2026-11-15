'use client';

/**
 * Premium Studio — Super Admin control deck for the cinematic layer of the site.
 * Controls the WebGL/GLSL hero shader, film grain, headline copy overrides,
 * CTA labels and the announcement ribbon. Persisted to Firestore
 * `settings/branding` (merged) and picked up site-wide by BrandingProvider.
 */

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles, Save, Loader2, MonitorPlay, Film, Type, Megaphone,
  ExternalLink, Zap, CheckCircle2, MousePointerClick, Droplets, Stars, Wind,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { WebGLShaderBackground, type WebGLStyle } from '@/components/effects/WebGLShaderBackground';
import { GrainOverlay } from '@/components/effects/GrainOverlay';

const WEBGL_STYLES: { id: WebGLStyle; name: string; description: string; icon: any }[] = [
  { id: 'aurora',    name: 'Crimson Aurora', description: 'Signature flowing GLSL aurora — crimson, ember & gold over deep black.', icon: Droplets },
  { id: 'liquid',    name: 'Liquid Chrome',  description: 'Warped liquid-metal specular bands — cold steel with hot-red flashes.',   icon: Wind },
  { id: 'starfield', name: 'Nebula Starfield', description: 'Procedural twinkling starfield drifting through a violet nebula.',      icon: Stars },
];

export default function PremiumStudioPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    webglEnabled: true,
    webglStyle: 'aurora' as WebGLStyle,
    webglOpacity: 60,
    grainEnabled: true,
    heroKicker: '',
    heroHeadlineLine1: '',
    heroHeadlineLine2: '',
    heroCtaPrimary: '',
    heroCtaSecondary: '',
    announcementText: '',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'branding'));
        if (mounted && snap.exists()) {
          const d = snap.data();
          setForm(prev => ({
            ...prev,
            webglEnabled: d.webglEnabled ?? true,
            webglStyle: (d.webglStyle as WebGLStyle) || 'aurora',
            webglOpacity: typeof d.webglOpacity === 'number' ? d.webglOpacity : 60,
            grainEnabled: d.grainEnabled ?? true,
            heroKicker: d.heroKicker || '',
            heroHeadlineLine1: d.heroHeadlineLine1 || '',
            heroHeadlineLine2: d.heroHeadlineLine2 || '',
            heroCtaPrimary: d.heroCtaPrimary || '',
            heroCtaSecondary: d.heroCtaSecondary || '',
            announcementText: d.announcementText || '',
          }));
        }
      } catch {
        // Defaults stay — admin can still save.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [db]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'branding'), {
        ...form,
        webglOpacity: Math.min(100, Math.max(0, Number(form.webglOpacity) || 0)),
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'system',
      }, { merge: true });
      toast({
        title: '✨ Premium Studio Synced',
        description: 'The cinematic layer is live. Reload the site to see it globally.',
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Sync Failed', description: e?.message || 'Check your connection and Firestore rules.' });
    } finally {
      setSaving(false);
    }
  };

  const set = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-14 pb-32">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Cinematic Layer</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none">Premium<br />Studio</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">WebGL shaders · film grain · hero copy — all live, no redeploy</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="h-12 rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest gap-2">
            <a href="/" target="_blank" rel="noreferrer">View Site <ExternalLink size={14} /></a>
          </Button>
          <Button onClick={handleSave} disabled={saving} className="h-12 bg-primary hover:bg-primary/90 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 px-6">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />} Save & Sync
          </Button>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <Card className="overflow-hidden rounded-[2rem] border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <MonitorPlay className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Live Shader Preview</span>
          </div>
          <Badge variant="outline" className="font-mono text-[9px] uppercase">{form.webglStyle} · {Math.round(form.webglOpacity)}%</Badge>
        </div>
        <div className="relative h-72 sm:h-80 bg-black overflow-hidden">
          {form.webglEnabled ? (
            <WebGLShaderBackground style={form.webglStyle} opacity={Math.min(100, Math.max(0, form.webglOpacity)) / 100} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">WebGL Disabled — Image Hero</span>
            </div>
          )}
          {form.grainEnabled && <GrainOverlay opacity={0.09} />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-400/90">{form.heroKicker || 'Ready 2026'}</p>
            <p className="text-3xl sm:text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white">
              {form.heroHeadlineLine1 || 'Volta'}<br />
              <span className="text-primary italic">{form.heroHeadlineLine2 || 'Showroom'}</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* ── SHADER ENGINE ─────────────────────────────────────────── */}
        <Card className="rounded-[2rem] border-border bg-card p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest">Shader Engine</h2>
            </div>
            <Switch checked={form.webglEnabled} onCheckedChange={(v) => set({ webglEnabled: v })} aria-label="Toggle WebGL hero" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WEBGL_STYLES.map((s) => {
              const Icon = s.icon;
              const active = form.webglStyle === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => set({ webglStyle: s.id })}
                  className={cn(
                    'group rounded-2xl border p-5 text-left transition-all duration-300 space-y-3',
                    active
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-2xl'
                      : 'border-border bg-muted/30 hover:border-primary/40 hover:-translate-y-0.5'
                  )}
                >
                  <Icon className={cn('h-6 w-6 transition-colors', active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                      {s.name} {active && <CheckCircle2 size={12} className="text-primary" />}
                    </p>
                    <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{s.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="webgl-opacity" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Shader Intensity</label>
              <span className="font-mono text-[10px] text-primary">{Math.round(form.webglOpacity)}%</span>
            </div>
            <input
              id="webgl-opacity"
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.webglOpacity}
              onChange={(e) => set({ webglOpacity: Number(e.target.value) })}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <Film className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">35mm Film Grain</p>
                <p className="text-[9px] text-muted-foreground">Animated turbulence overlay — cinematic print texture</p>
              </div>
            </div>
            <Switch checked={form.grainEnabled} onCheckedChange={(v) => set({ grainEnabled: v })} aria-label="Toggle film grain" />
          </div>
        </Card>

        {/* ── HERO COPY ─────────────────────────────────────────────── */}
        <Card className="rounded-[2rem] border-border bg-card p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Type className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest">Hero Copy & CTAs</h2>
          </div>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Leave any field blank to fall back to the default</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Kicker Pill (above headline)</label>
              <Input value={form.heroKicker} onChange={e => set({ heroKicker: e.target.value })} placeholder="Ready 2026" className="h-12 bg-muted border-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Headline — Line 1</label>
              <Input value={form.heroHeadlineLine1} onChange={e => set({ heroHeadlineLine1: e.target.value })} placeholder="Volta" className="h-12 bg-muted border-none font-bold uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Headline — Line 2 (accent)</label>
              <Input value={form.heroHeadlineLine2} onChange={e => set({ heroHeadlineLine2: e.target.value })} placeholder="Showroom" className="h-12 bg-muted border-none font-bold uppercase text-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><MousePointerClick size={10} /> Primary CTA</label>
              <Input value={form.heroCtaPrimary} onChange={e => set({ heroCtaPrimary: e.target.value })} placeholder="Explore Showroom" className="h-12 bg-muted border-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><MousePointerClick size={10} /> Secondary CTA</label>
              <Input value={form.heroCtaSecondary} onChange={e => set({ heroCtaSecondary: e.target.value })} placeholder="Find My Car" className="h-12 bg-muted border-none font-bold" />
            </div>
          </div>

          {/* Announcement ribbon */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><Megaphone size={10} /> Announcement Ribbon</label>
            <Input value={form.announcementText} onChange={e => set({ announcementText: e.target.value })} placeholder="e.g. Free duty-clearing consultation this week — book a viewing" className="h-12 bg-muted border-none font-bold" />
            <p className="text-[8px] uppercase tracking-widest text-muted-foreground/70 ml-1">Empty = ribbon hidden. Shows site-wide above the hero.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
