
'use client';

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingFormClient } from "@/components/booking-form-client";
import { Zap, Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

export default function BookPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?redirect=/book");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-accent mb-4">
              <Zap className="h-5 w-5 fill-current" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]">Showroom Direct Inquiry</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-headline mb-6">Inquire & Schedule Test Drive</h1>
            <p className="text-lg text-muted-foreground">
              Select your vehicle and submit your inquiry for purchase options, financing, or showroom visit arrangements.
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <BookingFormClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
