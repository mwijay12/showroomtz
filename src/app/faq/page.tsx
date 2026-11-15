'use client';

import { useState } from 'react';
import { Navbar } from "@/components/navbar";
import { PageMasthead } from "@/components/layout/PageMasthead";
import { Footer } from "@/components/footer";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, HelpCircle, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";

const FAQ_DATA = [
  {
    category: "Booking & Reservations",
    items: [
      { q: "How do I make a booking?", a: "Browse our fleet, select your vehicle, choose your dates and submit your request online. You will receive a confirmation email and booking code (SHOWROOMTZ-XXXXXX) immediately." },
      { q: "Can I modify my booking after confirmation?", a: "Yes. Contact us via WhatsApp or phone at least 24 hours before your rental start date." },
      { q: "How far in advance should I book?", a: "We recommend booking at least 3 days in advance, especially during weekends and public holidays." },
      { q: "Is my booking confirmed immediately?", a: "Your booking request is submitted instantly. An admin will confirm it within 2-4 hours during business hours." }
    ]
  },
  {
    category: "Payments",
    items: [
      { q: "What payment methods do you accept?", a: "We accept M-Pesa, Tigo Pesa, Airtel Money, bank transfer and cash. All prices are in Tanzanian Shillings (TZS)." },
      { q: "When do I pay?", a: "Payment is required after your booking is confirmed by our team." },
      { q: "Is a deposit required?", a: "Yes. A refundable security deposit may be required for some vehicles." },
      { q: "Can I get a refund if I cancel?", a: "Cancellations made 48+ hours before pickup receive a full refund. Cancellations within 24 hours are non-refundable." }
    ]
  },
  {
    category: "Vehicles & Drivers",
    items: [
      { q: "Are your vehicles insured?", a: "Yes. All our vehicles carry comprehensive insurance coverage." },
      { q: "Can I hire a driver?", a: "Yes! We offer professional driver services for an additional daily fee. Select this option when booking." },
      { q: "What documents do I need to rent?", a: "You need a valid national ID or passport and a valid driver's license for self-drive rentals." },
      { q: "Can I take the vehicle outside Tanzania?", a: "No. Our vehicles must remain within Tanzania unless written permission is obtained." }
    ]
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = FAQ_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(i => 
      i.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <PageMasthead
          kicker="Answers"
          index="07"
          title="No small print."
          outline="Just answers."
          blurb="Duty, financing, paperwork, delivery — the questions buyers actually ask, answered in plain language."
          seal="none"
        >
          <div className="relative max-w-xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              className="h-14 pl-12 pr-6 rounded-full bg-card border-border font-bold"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </PageMasthead>

        <section className="py-32">
          <div className="container mx-auto max-w-4xl px-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-20 bg-primary/5 rounded-[3rem] border border-dashed border-primary/10">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No answers match your search</p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-primary font-black uppercase text-[10px]">Clear Search</Button>
              </div>
            ) : (
              <div className="space-y-16">
                {filteredFaqs.map((cat, i) => (
                  <div key={i} className="space-y-8">
                    <AnimatedSection direction="right">
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-secondary bg-secondary/10 w-fit px-4 py-1.5 rounded-full">{cat.category}</h2>
                    </AnimatedSection>
                    <StaggerContainer staggerDelay={0.06} delayChildren={0.2}>
                      <Accordion type="single" collapsible className="space-y-4">
                        {cat.items.map((item, j) => (
                          <StaggerItem key={j} direction="up">
                            <AccordionItem value={`item-${i}-${j}`} className="border-none bg-card rounded-[2rem] px-8 shadow-sm hover:shadow-xl transition-all overflow-hidden group border border-border/50">
                              <AccordionTrigger className="text-lg font-black text-foreground text-left hover:no-underline py-6">
                                {item.q}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground text-sm font-medium leading-relaxed pb-8">
                                {item.a}
                              </AccordionContent>
                            </AccordionItem>
                          </StaggerItem>
                        ))}
                      </Accordion>
                    </StaggerContainer>
                  </div>
                ))}
              </div>
            )}

            <AnimatedSection direction="up" delay={0.4}>
              <div className="mt-32 p-12 bg-primary rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform"><MessageCircle size={100} /></div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-3xl font-black tracking-tight">STILL HAVE QUESTIONS?</h3>
                  <p className="text-blue-50/60 font-medium">Our elite support team is ready to assist you 24/7.</p>
                </div>
                <div className="flex gap-4">
                  <Button asChild className="h-14 px-8 bg-secondary text-primary font-black rounded-xl gap-2">
                    <Link href="https://wa.me/255700000000" target="_blank"><MessageCircle size={18} /> WhatsApp</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-14 px-8 border-white/20 text-white font-black rounded-xl gap-2 hover:bg-white/10">
                    <Link href="/contact">Contact Terminal <ArrowRight size={18} /></Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
