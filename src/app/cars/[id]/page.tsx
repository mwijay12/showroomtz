import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CarDetailClient } from "@/components/car-detail-client";
import { SimilarVehicles } from "@/components/similar-vehicles";
import { Car, Review } from '@/lib/types';
import { SEED_CARS } from '@/lib/showroom-seed';
import { serializeDoc } from '@/lib/serialize';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-TZ').format(amount);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let car: Car | null = null;

  try {
    const { db } = initializeFirebase();
    const carDoc = await getDoc(doc(db, 'cars', id));
    if (carDoc.exists()) {
      car = carDoc.data() as Car;
    }
  } catch (e) {
    // Fall back to seed car
  }

  if (!car) {
    car = (SEED_CARS.find(c => c.id === id) as unknown as Car) || null;
  }

  if (!car) {
    return { title: 'Vehicle Not Found | Volta' };
  }

  const priceText = car.discountPrice
    ? `TSh ${formatPrice(car.discountPrice)} (was ${formatPrice(car.price)})`
    : `TSh ${formatPrice(car.price)}`;

  return {
    title: `${car.year || ''} ${car.make || 'Premium'} ${car.model || 'Vehicle'} | Volta Showroom`,
    description: `${car.year} ${car.make} ${car.model} for sale at ${car.showroomName ?? 'our showroom'} in ${car.location ?? 'Tanzania'} — ${priceText}. ${car.mileage?.toLocaleString() ?? '—'} km, ${car.transmission}, ${car.fuelType}.`,
    openGraph: {
      title: `${car.year} ${car.make} ${car.model} — Volta Showroom`,
      description: `Buy at ${priceText} from ${car.showroomName} in ${car.location}`,
      images: car.images && car.images.length > 0 ? [car.images[0]] : ['/og-image.jpg'],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${car.year} ${car.make} ${car.model} — Volta Showroom`,
      description: `Buy at ${priceText} from ${car.showroomName} in ${car.location}`,
      images: car.images && car.images.length > 0 ? [car.images[0]] : ['/og-image.jpg'],
    }
  };
}

export default function CarDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <CarDataWrapper id={id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

async function CarDataWrapper({ id }: { id: string }) {
  let car: Car | null = null;
  let reviews: Review[] = [];

  try {
    const { db } = initializeFirebase();
    const carDoc = await getDoc(doc(db, 'cars', id));
    if (carDoc.exists()) {
      car = serializeDoc({ ...carDoc.data(), id: carDoc.id }) as Car;
    }

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('carId', '==', id),
      limit(20)
    );
    const reviewsSnap = await getDocs(reviewsQuery);
    reviews = reviewsSnap.docs.map(doc => serializeDoc({ ...doc.data(), id: doc.id })) as Review[];
  } catch (e) {
    // Server fetch notice - fall back to seed
  }

  if (!car) {
    const seedCar = SEED_CARS.find(c => c.id === id);
    if (seedCar) {
      car = seedCar as unknown as Car;
    }
  }

  if (!car) {
    notFound();
  }

  return (
    <div className="space-y-32">
      <CarDetailClient car={car} reviews={reviews} />
      <SimilarVehicles category={car.bodyType ?? car.category} currentCarId={car.id} />
    </div>
  );
}
