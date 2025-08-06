"use client";

import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Giftcard = {
  id: string;
  name: string;
  amount: number;
  created_at: string;
  expires_at: string;
  status: string;
};

export default function CercaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [giftcards, setGiftcards] = useState<Giftcard[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      const { data: created } = await supabase
        .from("giftcards")
        .select("id, name, amount, created_at, expires_at, owner_id");

      if (!created) return;

      const withStatus = created.map((g) => {
        const expired = new Date(g.expires_at) < new Date();
        return {
          ...g,
          status: expired ? "Scaduta" : "Attiva",
        };
      });

      setGiftcards(withStatus);
    };

    fetchData();
  }, [session]);

  const filtered = giftcards.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Titolo */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-purple-700 mb-12">
            Cerca Magic Giftcard
          </h1>
          <input
            type="text"
            placeholder="🔍 Cerca giftcard..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-full px-5 py-2 shadow-sm focus:ring-2 focus:ring-purple-400 outline-none w-72"
          />
        </div>

        {/* Tabella elegante */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-purple-100 text-purple-800 uppercase text-sm">
              <tr>
                <th className="py-4 px-6">Nome</th>
                <th className="py-4 px-6">Creata il</th>
                <th className="py-4 px-6">Budget</th>
                <th className="py-4 px-6">Stato</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((g, idx) => (
                  <tr
                    key={g.id}
                    className={`cursor-pointer transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-purple-50`}
                    onClick={() =>
                      router.push(`/dashboard/magic-giftcard/${g.id}`)
                    }
                  >
                    <td className="py-4 px-6 font-medium text-gray-700">
                      {g.name}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(g.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">
                      {g.amount}€
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          g.status === "Attiva"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 px-6 text-center text-gray-500 italic"
                  >
                    Nessuna giftcard trovata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}