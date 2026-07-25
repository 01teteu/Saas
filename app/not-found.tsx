"use client";
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-4">Página não encontrada</h2>
      <a href="/" className="text-gold-500 hover:underline">Voltar para o início</a>
    </div>
  );
}
