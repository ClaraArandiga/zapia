export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10 text-center text-xs text-white/40">
      <p>
        Ainda com dúvidas? Entre em contato:{" "}
        <a href="mailto:zapia.contato@gmail.com" className="text-brand-400 hover:underline">
          zapia.contato@gmail.com
        </a>
      </p>
      <p className="mt-2">© {new Date().getFullYear()} ZapIA</p>
    </footer>
  );
}
