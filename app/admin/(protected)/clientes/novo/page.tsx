import Link from "next/link";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default function NovoClientePage() {
  return (
    <div>
      <Link href="/admin/clientes" className="text-sm text-white/50 hover:text-white">
        ← Voltar para clientes
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Novo cliente</h1>
      <div className="mt-8 max-w-2xl">
        <ClienteForm />
      </div>
    </div>
  );
}
