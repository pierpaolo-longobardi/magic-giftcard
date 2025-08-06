"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession, signIn } from "next-auth/react";

type Giftcard = {
  id: string;
  name: string;
  amount: number;
  expires_at: string;
  message: string | null;
  recipient_name: string;
  recipient_email: string;
  created_at: string;
};

type Contribution = {
  id: string;
  first_name: string;
  last_name: string;
  amount: number;
  created_at: string;
  // user_email?: string;  ← Rimuovi o rendilo opzionale
};

export default function SharedGiftcardPage() {
  const { token } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [giftcard, setGiftcard] = useState<Giftcard | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchGiftcard = async () => {
      const { data, error } = await supabase
        .from("giftcards")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error) {
        console.error("Errore fetch giftcard:", error.message);
      } else {
        setGiftcard(data);

        const { data: contribs, error: contribError } = await supabase
          .from("giftcard_contributions")
          .select("id, first_name, last_name, amount, created_at")
          .eq("giftcard_id", data.id);

        if (!contribError && contribs) {
          setContributions(contribs);
        }
      }
      setLoading(false);
    };

    fetchGiftcard();
  }, [token]);

  const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
  const progress = giftcard ? Math.min((totalCollected / giftcard.amount) * 100, 100) : 0;

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      alert("Devi accedere per partecipare!");
      return router.push("/login"); 
    }

    const { error } = await supabase.from("giftcard_contributions").insert([
      {
        giftcard_id: giftcard?.id,
        user_email: session.user.email,
        first_name: session.user?.name?.split(" ")[0] || "Nome",
        last_name: session.user?.name?.split(" ")[1] || "Cognome",
        amount: Number(quota),
      },
    ]);

    if (error) {
      console.error("Errore contributo:", error.message);
      alert("Errore nell'invio della quota.");
    } else {
      alert("Quota inviata con successo!");
      setQuota("");
      const { data: contribs } = await supabase
        .from("giftcard_contributions")
        .select("id, first_name, last_name, amount, created_at")
        .eq("giftcard_id", giftcard?.id);
      if (contribs) setContributions(contribs);
    }
  };

  if (loading) return <p className="p-8">Caricamento giftcard...</p>;
  if (!giftcard) return <p className="p-8 text-red-600">Giftcard non trovata.</p>;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          🎁 {giftcard.name}
        </h1>
        <p className="text-gray-600 mb-4">
          Destinatario: <strong>{giftcard.recipient_name}</strong> ({giftcard.recipient_email})
        </p>
        {giftcard.message && (
          <p className="italic text-gray-700 mb-6 border-l-4 border-purple-300 pl-4">
            “{giftcard.message}”
          </p>
        )}

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-purple-700 h-4 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>{totalCollected}€ raccolti su {giftcard.amount}€</p>
        </div>

        {!session ? (
          <button
onClick={() => signIn("google", { callbackUrl: `/dashboard/magic-giftcard/${giftcard?.id}` })}            className="w-full bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition shadow-md"
          >
            Accedi con Google per partecipare
          </button>
        ) : (
          <form onSubmit={handleContribute} className="space-y-4">
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            >
              <option value="">Seleziona un importo</option>
              {[...Array(19)].map((_, i) => {
                const val = 10 + i * 5;
                return (
                  <option key={val} value={val}>
                    {val} €
                  </option>
                );
              })}
            </select>
            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition shadow-md"
            >
              Contribuisci
            </button>
          </form>
        )}
      </div>
    </main>
  );
}