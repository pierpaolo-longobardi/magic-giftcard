"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Sezione sinistra solo immagine */}
      <div className="hidden md:flex w-1/2">

        <Image
  src="/login-mondodorto.jpg"
  alt="Benvenuto"
  width={120}
  height={120}
/>
      </div>

      {/* Sezione destra con animazione */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-10 animate-slideIn">
        <h1 className="text-4xl font-bold mb-6">Accedi a Mondodorto</h1>
        <p className="text-gray-600 mb-8">
          Accedi con Google per esplorare la nostra collezione esclusiva.
        </p>
        <button
  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
  className="shine relative overflow-hidden bg-black text-white py-3 px-6 rounded-lg shadow-md transition-all duration-500 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(128,0,32,0.7)]"
>
  <span className="relative z-10">Login con Google</span>
</button>
      </div>
    </main>
  );
}