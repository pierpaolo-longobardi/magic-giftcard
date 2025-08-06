"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "next-auth/react";
import GiftcardCard from "@/components/GiftcardCard";
import { PlusCircle } from "lucide-react";

type Giftcard = {
  id: string;
  name: string;
  amount: number;
  expires_at: string;
  recipient_name: string;
  created_at: string;
  owner_id: string;
};

type ContribWithGiftcard = {
  giftcards: Giftcard[]; // non un singolo, ma un array
};

export default function MagicGiftcardPage() {
  const { data: session } = useSession();
  const [createdGiftcards, setCreatedGiftcards] = useState<Giftcard[]>([]);
  const [contribGiftcards, setContribGiftcards] = useState<Giftcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiftcards = async () => {
      if (!session?.user?.email) return;

      const userEmail = session.user.email;

      // Giftcard create dall’utente
      const { data: created, error: err1 } = await supabase
        .from("giftcards")
        .select("*")
        .eq("owner_id", userEmail)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (err1) {
        console.error("Errore created:", err1.message);
      }

      // Giftcard a cui ha partecipato
      const { data: contribs, error: err2 } = await supabase
        .from("giftcard_contributions")
        .select(
          "giftcards(id, name, amount, expires_at, recipient_name, created_at, owner_id)"
        )
        .eq("user_email", userEmail);

      if (err2) {
        console.error("Errore contributions:", err2.message);
      }

     // Rimuove duplicati, filtra scadute e ordina
const contribGiftcards = contribs
  ? Array.from(
      new Map(
        (contribs as ContribWithGiftcard[])
          .flatMap((c) => c.giftcards || []) // prendi gli oggetti dall’array
          .map((g) => [g.id, g])
      ).values()
    )
      .filter((g) => new Date(g.expires_at) > new Date())
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
  : [];

      setCreatedGiftcards(created || []);
      setContribGiftcards(contribGiftcards);
      setLoading(false);
    };

    fetchGiftcards();
  }, [session]);

  if (!session) {
    return (
      <main className="p-8">
        <p>Devi fare login per vedere le tue Magic Giftcard.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          {/* Giftcard create */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-purple-700">
                Le mie Magic Giftcard
              </h2>
              <Link href="/dashboard/magic-giftcard/crea">
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white py-2 px-5 rounded-full shadow-lg hover:shadow-purple-400 hover:scale-105 transition-all duration-300">
                  <PlusCircle size={20} />
                  <span className="font-medium">Nuova Giftcard</span>
                </button>
              </Link>
            </div>
            {createdGiftcards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {createdGiftcards.map((giftcard) => (
                  <GiftcardCard key={giftcard.id} giftcard={giftcard} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                Non hai ancora creato nessuna Magic Giftcard.
              </p>
            )}
          </section>

          {/* Giftcard partecipate */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-700 mb-6">
              Magic Giftcard a cui partecipo
            </h2>
            {contribGiftcards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {contribGiftcards.map((giftcard) => (
                  <GiftcardCard key={giftcard.id} giftcard={giftcard} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                Non hai ancora partecipato a nessuna Magic Giftcard.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}