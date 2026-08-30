import { Hero } from "@/components/landing/Hero";
import { Dor } from "@/components/landing/Dor";
import { Benefits } from "@/components/landing/Benefits";
import { Demo } from "@/components/landing/Demo";
import { Configuracao } from "@/components/landing/Configuracao";
import { CustoOportunidade } from "@/components/landing/CustoOportunidade";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Offer } from "@/components/landing/Offer";
import { Garantia } from "@/components/landing/Garantia";
import { Objections } from "@/components/landing/Objections";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Contato } from "@/components/landing/Contato";
import { Footer } from "@/components/ui/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Dor />
      <Benefits />
      <Demo />
      <Configuracao />
      <CustoOportunidade />
      <ComoFunciona />
      <Offer />
      <Garantia />
      <Objections />
      <FinalCTA />
      <Contato />
      <Footer />
    </main>
  );
}
