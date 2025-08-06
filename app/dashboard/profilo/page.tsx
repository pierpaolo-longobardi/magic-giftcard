"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "next-auth/react";

type Giftcard = {
  id: string;
  name: string;
  amount: number;
  created_at: string;
  expires_at: string;
};

type ContributionRow = {
  giftcards: Giftcard | null; // non più array, ma singolo oggetto
};

export default function StoricoGiftcardPage() {
  const { data: session } = useSession();
  const [giftcards, setGiftcards] = useState<Giftcard[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStorico = async () => {
      if (!session?.user?.email) return;
      const userEmail = session.user.email; // ✅ ora typesafe

      // Giftcard create
      const { data: created } = await supabase
        .from("giftcards")
        .select("id, name, amount, created_at, expires_at")
        .eq("owner_id", userEmail);

      // Giftcard partecipate
      const { data: contributions } = await supabase
        .from("giftcard_contributions")
        .select("giftcards(id, name, amount, created_at, expires_at)")
        .eq("user_email", userEmail);

const contribGiftcards: Giftcard[] =
  (contributions as ContributionRow[] | null)?.map((c) => c.giftcards)
    .filter((g): g is Giftcard => !!g) || [];

const all: Giftcard[] = [...(created || []), ...contribGiftcards];

const merged = Array.from(
  new Map(all.map((g) => [g.id, g])).values()
).sort(
  (a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);

setGiftcards(merged);
    };

    fetchStorico();
  }, [session]);

  const filtered = giftcards.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        📚 Storico Magic Giftcard
      </h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cerca per nome giftcard..."
        className="mb-6 w-full max-w-md p-3 border border-gray-300 rounded-lg"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-purple-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-purple-800">Nome</th>
              <th className="text-left px-4 py-3 text-sm text-purple-800">Creata il</th>
              <th className="text-left px-4 py-3 text-sm text-purple-800">Budget</th>
              <th className="text-left px-4 py-3 text-sm text-purple-800">Stato</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => {
              const expired = new Date(g.expires_at) < new Date();
              const stato = expired ? "Scaduta" : "In corso";
              return (
                <tr key={g.id} className="border-t border-gray-200 hover:bg-purple-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-800">{g.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(g.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g.amount}€</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {stato === "Scaduta" ? (
                      <span className="text-red-600">⏳ {stato}</span>
                    ) : (
                      <span className="text-blue-600">🕓 {stato}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}