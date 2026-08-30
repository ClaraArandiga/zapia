import { Hero } from "@/components/landing/Hero";
import { Demo } from "@/components/landing/Demo";
import { Benefits } from "@/components/landing/Benefits";
import { Proof } from "@/components/landing/Proof";
import { Offer } from "@/components/landing/Offer";
import { Objections } from "@/components/landing/Objections";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/ui/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Demo />
      <Benefits />
      <Proof />
      <Offer />
      <Objections />
      <FinalCTA />
      <Footer />
    </main>
  );
}
