'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  Printer, ChevronRight, ShieldCheck, Zap, Car, CreditCard, 
  AlertTriangle, Scale, Clock, MapPin, UserCheck, Wrench, FileText, Phone
} from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      icon: <FileText className="h-5 w-5 text-primary" />,
      title: "Acceptance of Terms",
      content: `By purchasing, reserving, or inquiring about a vehicle through VoltaShowroom Tanzania — whether via our website, mobile platform, WhatsApp, or directly at our showroom locations — you ("the Buyer") unconditionally accept and agree to be legally bound by these Terms and Conditions in their entirety.

These Terms constitute a binding legal agreement governed by the laws of the United Republic of Tanzania. VoltaShowroom reserves the right to update these Terms at any time, with updated versions taking effect immediately upon publication. Continued use of our services implies acceptance of any amendments.

If you do not agree with any part of these Terms, you must immediately cease use of all VoltaShowroom services.`
    },
    {
      id: "eligibility",
      icon: <UserCheck className="h-5 w-5 text-primary" />,
      title: "Buyer Eligibility & Registration Requirements",
      content: `To purchase or reserve a vehicle from VoltaShowroom, the Buyer must satisfy all of the following conditions:

• Minimum age: 18 years old with full legal capacity to enter into vehicle transfer contracts in Tanzania.
• Valid National ID (NIDA), Passport, or registered Business Registration Certificate (BRELA) for corporate buyers.
• Valid Tax Identification Number (TIN) for vehicle ownership transfer registered with the Tanzania Revenue Authority (TRA).
• For test drive requests: A valid Tanzanian or recognized international driver's license for the relevant vehicle class.
• Physical verification of identity documents at vehicle handover or contract signing.`
    },
    {
      id: "booking",
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Vehicle Reservation, Deposits & Holding Protocol",
      content: `All listed vehicles are subject to prior sale unless a formal Vehicle Reservation Agreement is executed and a non-refundable deposit is paid.

A vehicle reservation is confirmed only upon:
• Receipt of a minimum reservation deposit (typically 10% to 20% of the vehicle asking price, or as agreed in writing), AND
• Issuance of an official VoltaShowroom EFD receipt / reservation confirmation.

Reserved vehicles will be held exclusively for the Buyer for a maximum period of 7 business days unless otherwise agreed in writing. If final payment is not completed within the agreed period, VoltaShowroom reserves the right to cancel the reservation and re-list the vehicle for sale.`
    },
    {
      id: "payment",
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      title: "Pricing, Payment Methods & TRA Tax Compliance",
      content: `All vehicle asking prices are listed in Tanzanian Shillings (TZS) or United States Dollars (USD), inclusive of applicable TRA import duties and registration costs unless explicitly stated as "In-Bond".

Accepted payment methods include:
• Direct Bank Transfer (CRDB Bank, NMB Bank, NBC, DTB Tanzania) to our official Showroom corporate account.
• Lipa kwa M-Pesa / TigoPesa / Airtel Money for deposit payments.
• Certified Bank Draft / Manager's Cheque.

An official TRA Electronic Fiscal Device (EFD) receipt will be issued for all payments. Full vehicle transfer documents (Logbook / Card, TRA Transfer Form) will be initiated upon 100% settlement of the purchase price.`
    },
    {
      id: "inspection",
      icon: <Wrench className="h-5 w-5 text-primary" />,
      title: "Pre-Purchase Inspection & Dealer Warranty",
      content: `VoltaShowroom encourages independent pre-purchase inspections. Buyers are welcome to bring a certified mechanic or third-party vehicle inspector to examine any car on our showroom floor.

• Foreign Used Imports: Covered by our standard 6-month or 12-month Dealer Powertrain Warranty (Engine & Transmission) as specified on the vehicle spec sheet.
• Locally Used Vehicles: Sold "As-Is, Where-Is" unless accompanied by a written warranty statement.
• Brand New Vehicles: Covered by original manufacturer's warranty.`
    },
    {
      id: "liability",
      icon: <Scale className="h-5 w-5 text-primary" />,
      title: "Limitation of Liability & Dispute Resolution",
      content: `VoltaShowroom's total liability for any claim arising from a vehicle sale or reservation shall not exceed the actual deposit or purchase amount paid by the Buyer for the specific vehicle transaction.

In the event of any dispute, the parties agree to first seek resolution through good-faith negotiation. If unresolved within 14 days, disputes shall be submitted to arbitration in Dar es Salaam under the laws of Tanzania.`
    }
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <AnimatedSection direction="down" className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Official Terms of Business
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
            Showroom Terms & Conditions
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Legal terms governing vehicle sales, reservations, deposits, warranty, and showroom services.
          </p>
        </AnimatedSection>

        <div className="space-y-8">
          {sections.map((sec) => (
            <AnimatedSection key={sec.id} direction="up" className="bg-card border border-border rounded-3xl p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  {sec.icon}
                </div>
                <h2 className="text-xl font-black uppercase text-foreground tracking-tight">{sec.title}</h2>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-medium pl-14">
                {sec.content}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
