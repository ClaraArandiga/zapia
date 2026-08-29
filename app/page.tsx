import { Hero } from "@/components/landing/Hero";
import { Demo } from "@/components/landing/Demo";
import { Benefits } from "@/components/landing/Benefits";
import { Proof } from "@/components/landing/Proof";
import { Offer } from "@/components/landing/Offer";
import { Objections } from "@/components/landing/Objections";
import { FinalCTA } from "@/components/landing/FinalCTA";

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
      <footer className="border-t border-white/5 px-6 py-10 text-center text-xs text-white/40">
        © {new Date().getFullYear()} ZapIA
      </footer>
    </main>
  );
}
