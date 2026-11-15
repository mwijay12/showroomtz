
'use client';

import { Navbar } from "@/components/navbar";
import { PageMasthead } from "@/components/layout/PageMasthead";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Car, 
  MapPin, 
  ShieldCheck, 
  Zap,
  Star,
  Clock,
  TrendingUp
} from "lucide-react";
import { VoltaImage } from "@/components/ui/VoltaImage";
import Link from "next/link";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useBranding } from "@/components/providers/BrandingProvider";

export function AboutClient() {
  const { aboutImageUrl } = useBranding();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 bg-background">
        <PageMasthead
          kicker="The house"
          index="04"
          title="Driving Tanzania"
          outline="forward."
          blurb="ShowroomTZ is a documented marketplace: verified dealers, inspected vehicles and cleared paperwork. We built it because buying a car in Tanzania should not feel like a gamble."
          seal="provenance"
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cars"
              className="inline-flex h-12 items-center rounded-full bg-foreground px-7 text-[9px] font-black uppercase tracking-[0.26em] text-background transition-colors hover:bg-primary hover:text-white"
            >
              Explore collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full border border-border px-7 text-[9px] font-black uppercase tracking-[0.26em] text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Get in touch
            </Link>
          </div>
        </PageMasthead>

        {/* Our Story */}
        <section className="py-32">
          <div className="container mx-auto px-4 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <AnimatedSection direction="left">
                  <div className="space-y-6">
                    <h2 className="text-5xl font-black tracking-tight uppercase text-foreground">OUR STORY</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                      Founded in 2026, ShowroomTZ was established with a singular vision: to redefine motor vehicle showroom and car buying standards in Tanzania. We recognized a gap for transparent, high-fidelity automobile sales and verified dealer services.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                      Whether you are looking for a brand new SUV in Dar es Salaam, a foreign-used luxury sedan, or a reliable 4x4 in Arusha, we provide mechanical excellence, verified pre-purchase inspections, and seamless vehicle transfer.
                    </p>
                  </div>
                </AnimatedSection>
                <StaggerContainer className="grid grid-cols-2 gap-8" staggerDelay={0.1}>
                  {[
                    { label: "Vehicles", value: 50, suffix: "+", icon: <Car className="text-secondary" /> },
                    { label: "Members", value: 500, suffix: "+", icon: <Users className="text-secondary" /> },
                    { label: "Hubs", value: 8, suffix: "", icon: <MapPin className="text-secondary" /> },
                    { label: "Rating", value: 4.8, suffix: "", icon: <Star className="text-secondary" /> },
                  ].map((stat, i) => (
                    <StaggerItem key={i} direction="up">
                      <div className="p-8 bg-card border border-border rounded-[2rem] space-y-4 hover:border-primary/30 transition-colors">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-3xl font-black text-foreground tracking-tight flex items-baseline gap-1">
                             <AnimatedCounter end={stat.value} duration={3} />
                             {stat.suffix}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
              <AnimatedSection direction="scale" delay={0.2} className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl group">
                <VoltaImage 
                  src={aboutImageUrl || "/images/studio/hero-suv.jpg"} 
                  alt="Elite Fleet" 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-32 bg-card/30 backdrop-blur-sm border-y border-border">
          <div className="container mx-auto px-4 lg:px-12">
            <AnimatedSection direction="down" className="text-center max-max-w-2xl mx-auto mb-24">
              <h2 className="text-5xl font-black tracking-tight mb-6 uppercase text-foreground">
                The ShowroomTZ <span className="text-primary italic">Standard</span>
              </h2>
              <p className="text-muted-foreground text-lg font-medium">Built on three pillars: Safety, Transparency, and Service.</p>
            </AnimatedSection>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.1}>
              {[
                { title: "Safety First", icon: <ShieldCheck className="h-6 w-6" />, text: "Every vehicle undergoes a 45-point inspection before every rental start." },
                { title: "Transparent Pricing", icon: <TrendingUp className="h-6 w-6" />, text: "No hidden fees. Your digital contract reflects the final price with zero surprises." },
                { title: "Elite Booking", icon: <Zap className="h-6 w-6" />, text: "Real-time availability and instant confirmation via our 2026 digital terminal." },
                { title: "Local Expertise", icon: <MapPin className="h-6 w-6" />, text: "Chauffeurs with decade-long experience navigating all 8 primary cities." },
                { title: "Premium Maintenance", icon: <Car className="h-6 w-6" />, text: "Manufacturer-approved service schedules for every vehicle in our collection." },
                { title: "24/7 Logistics", icon: <Clock className="h-6 w-6" />, text: "Continuous concierge support for airport transfers and roadside assistance." },
              ].map((v, i) => (
                <StaggerItem key={i}>
                  <Card className="executive-card overflow-hidden group h-full bg-card">
                    <CardContent className="p-12 space-y-6">
                      <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-inner">
                        {v.icon}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{v.title}</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed">{v.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
