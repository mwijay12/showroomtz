'use client';

/**
 * FeaturedFleet — the horizontal flagship rail.
 *
 * Desktop: GSAP ScrollTrigger pins the section and scrubs the track
 * sideways, so the fleet drifts past while the page scrolls — the classic
 * "curated collection" gesture. Mobile: native snap-scroll, because pinning
 * on touch is a tax on the user.
 *
 * Cards use a plain studio photo with a hover zoom — the previous WebGL
 * ripple read as a “water”/chromatic-aberration defect on the paint.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { collection, limit, query, where, getDocs, getCountFromServer } from 'firebase/firestore';

import { useFirestore } from '@/firebase';
import { useBranding } from '@/components/providers/BrandingProvider';
import { SEED_CARS } from '@/lib/showroom-seed';
import { SplitReveal } from '@/components/effects/SplitReveal';
import { CountUp } from '@/components/effects/CountUp';
import { SpotlightCard, MagneticButton } from '@/components/effects/Interactive';
import { Stamp, SpeedLines } from '@/components/effects/Stickers';

type FleetCar = {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  discountPrice?: number;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  category?: string;
  bodyType?: string;
  condition?: string;
  location?: string;
  showroomName?: string;
  images?: string[];
  coverImage?: string;
  featured?: boolean;
};

function priceLabel(n?: number) {
  if (!n) return 'On request';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return new Intl.NumberFormat('en-TZ').format(n);
}

const SEED_AVAILABLE = (SEED_CARS as unknown as FleetCar[]).filter(
  (c) => (c as { status?: string }).status !== 'sold'
).length;

export function FeaturedFleet() {
  const db = useFirestore();
  const { companyName } = useBranding();
  // seed first so the rail is painted on the server, then refine from Firestore
  const [cars, setCars] = useState<FleetCar[]>(
    (SEED_CARS as unknown as FleetCar[]).slice(0, 8)
  );
  const [loading, setLoading] = useState(false);
  // honest count: live Firestore availability when it answers, seed size otherwise
  const [unitCount, setUnitCount] = useState<number>(SEED_AVAILABLE);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* ── data ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const q = query(collection(db, 'cars'), where('status', '==', 'available'), limit(8));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as FleetCar[];
        if (!alive) return;
        if (list.length) {
          list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
          setCars(list);
        }
      } catch {
        /* seed data already on screen */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [db]);

  /* live availability count for the header stat */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getCountFromServer(
          query(collection(db, 'cars'), where('status', '==', 'available'))
        );
        const count = snap.data().count;
        if (alive && count > 0) setUnitCount(count);
      } catch {
        /* keep the seed-based count */
      }
    })();
    return () => {
      alive = false;
    };
  }, [db]);

  /* ── pinned horizontal scrub (desktop only) ───────────────────── */
  useEffect(() => {
    if (loading) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let mm: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const media = gsap.matchMedia();
      media.add('(min-width: 1024px)', () => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const refresh = () => ScrollTrigger.refresh();
        if (document.readyState === 'complete') refresh();
        else window.addEventListener('load', refresh, { once: true });

        return () => {
          window.removeEventListener('load', refresh);
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { clearProps: 'transform' });
        };
      });
      mm = media;
    })();

    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, [loading, cars.length]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border bg-background py-20 lg:h-[100svh] lg:py-0"
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-5 pt-8 sm:px-8">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.42em] text-primary">
                01 / The fleet
              </span>
              <SpeedLines className="text-border" width={80} count={3} />
            </div>
            <SplitReveal
              as="h2"
              type="words"
              text="Handpicked, documented, ready."
              stagger={0.05}
              className="max-w-2xl text-[clamp(2rem,5vw,4rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-2xl font-black tracking-tighter text-foreground">
                <CountUp value={unitCount} duration={1400} />
              </p>
              <p className="text-[8px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                units in stock
              </p>
            </div>
            <MagneticButton strength={0.16}>
              <Link
                href="/cars"
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-[9px] font-black uppercase tracking-[0.26em] text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                All stock
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
          </div>
        </div>

        {/* rail */}
        <div className="relative mt-10 lg:mt-14">
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:snap-none lg:overflow-visible lg:pb-0"
          >
            {cars.map((car, i) => (
              <FleetCard key={car.id} car={car} index={i} />
            ))}

            {/* end card */}
            <Link
              href="/cars"
              className="group relative flex w-[78vw] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[2rem] border border-dashed border-border bg-card/40 p-8 transition-colors hover:border-primary/50 sm:w-[340px] lg:w-[300px]"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.32em] text-muted-foreground">
                The rest of it
              </span>
              <div>
                <p className="text-3xl font-black uppercase leading-[0.95] tracking-tighter text-foreground">
                  Browse
                  <br />
                  <span className="text-primary italic">every unit</span>
                </p>
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  {companyName || 'ShowroomTZ'} showrooms across Tanzania, updated daily.
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border transition-all duration-500 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-primary group-hover:text-white">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>
          </div>

          <p className="mt-4 text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground lg:hidden">
            Swipe the rail →
          </p>
        </div>
      </div>
    </section>
  );
}

function FleetCard({
  car,
  index,
}: {
  car: FleetCar;
  index: number;
}) {
  const image = car.coverImage || car.images?.[0] || '/images/studio/lc300.jpg';
  const name = `${car.make ?? ''} ${car.model ?? ''}`.trim() || 'Showroom unit';
  const price = car.discountPrice || car.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group/card w-[78vw] shrink-0 snap-center transition-transform duration-500 hover:-translate-y-1.5 sm:w-[340px] lg:w-[380px]"
    >
      <SpotlightCard className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-card transition-colors duration-500 hover:border-primary/40">
        <Link href={`/cars/${car.id}`} className="group flex h-full flex-col">
          {/* media */}
          <div className="relative aspect-[16/11] overflow-hidden">
            {/* plain studio photo — no shader, no water ripple */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${car.year ?? ''} ${name}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

            <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-white backdrop-blur-md">
              {car.bodyType ?? car.category ?? 'Vehicle'}
            </span>

            <span className="index-number absolute right-4 top-3 text-4xl font-black text-white/25">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
              <Stamp text={car.condition ?? 'Available'} tone="rgba(255,255,255,0.75)" className="!py-1 !px-2.5 border-white/25" />
              <span className="text-[8px] font-black uppercase tracking-[0.22em] text-white/70">
                {car.location ?? 'Dar es Salaam'}
              </span>
            </div>
          </div>

          {/* body */}
          <div className="flex flex-1 flex-col justify-between gap-5 p-6">
            <div className="space-y-2">
              <p className="text-[8px] font-black uppercase tracking-[0.28em] text-muted-foreground">
                {car.year ?? '2026'} · {car.mileage ? `${Math.round(car.mileage / 1000)}k km` : 'New'} ·{' '}
                {car.transmission ?? 'Automatic'}
              </p>
              <h3 className="text-2xl font-black uppercase leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
                {name}
              </h3>
            </div>

            <div className="flex items-end justify-between border-t border-border pt-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                  Asking
                </p>
                <p className="text-xl font-black tracking-tighter text-foreground">
                  {price ? `TSh ${priceLabel(price)}` : 'On request'}
                </p>
              </div>
              <span className="flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-[8px] font-black uppercase tracking-[0.22em] text-background transition-colors group-hover:bg-primary group-hover:text-white">
                Inspect
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </SpotlightCard>
    </motion.div>
  );
}
