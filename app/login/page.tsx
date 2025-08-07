"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Lato sinistro: immagine */}
      <div className="w-1/2 relative hidden md:block">
        <Image
          src="/login-mondodorto.jpg"
          alt="Mondodorto"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Lato destro: login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-10">
        <div className="max-w-md w-full space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Accedi a Mondodorto
          </h1>
          <p className="text-center text-gray-500">
            Accedi con Google per esplorare la nostra collezione esclusiva.
          </p>
<button onClick={() => signIn("google", { callbackUrl: "/dashboard/profilo" })}>
  Login con Google
</button>
        </div>
      </div>
    </main>
  );
}