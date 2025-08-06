"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

type Giftcard = {
  id: string;
  name: string;
  amount: number;
  expires_at: string;
  message: string | null;
  recipient_name: string;
  recipient_email: string;
  created_at: string;
  owner_id: string;
  share_token: string; // ✅ aggiunta
};

type Contribution = {
  id: string;
  user_email: string;
  first_name?: string;
  last_name?: string;
  amount: number;
  created_at: string;
};

export default function GiftcardDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();

  const [giftcard, setGiftcard] = useState<Giftcard | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: gc, error: err1 } = await supabase
        .from("giftcards")
        .select("*")
        .eq("id", id)
        .single();

      const { data: contribs, error: err2 } = await supabase
        .from("giftcard_contributions")
        .select("id, user_email, first_name, last_name, amount, created_at")
        .eq("giftcard_id", id);

      if (err1) console.error("Errore giftcard:", err1.message);
      if (err2) console.error("Errore contributi:", err2.message);

      setGiftcard(gc);
      setContributions(contribs || []);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
  const progress = giftcard ? Math.min((totalCollected / giftcard.amount) * 100, 100) : 0;

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      alert("Devi essere loggato per partecipare!");
      return;
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

      const { data: contribs, error: err2 } = await supabase
        .from("giftcard_contributions")
        .select("id, user_email, first_name, last_name, amount, created_at")
        .eq("giftcard_id", giftcard?.id);

      if (!err2 && contribs) {
        setContributions(contribs);
      }
    }
  };

  const filteredContributions = contributions.filter(
    (c) =>
      c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-8">
        {loading ? (
          <p>Caricamento giftcard...</p>
        ) : !giftcard ? (
          <p className="text-red-600">Giftcard non trovata.</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-purple-700 flex items-center gap-3">
                🎁 {giftcard.name}
              </h1>
              <Link
                href="/dashboard/magic-giftcard"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-transform duration-200 hover:scale-110"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Indietro</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
              {/* Colonna sinistra */}
{/* Colonna sinistra */}
<div>
  <p className="text-gray-600 mb-2">
    Destinatario: <strong>{giftcard.recipient_name}</strong> ({giftcard.recipient_email})
  </p>

  <p className="text-gray-600 mb-2">
    Creatore: <span className="font-semibold text-purple-700">{giftcard.owner_id}</span>
  </p>

  <p className="text-gray-600 mb-2">
    Creata il:{" "}
    <span className="font-medium">
      {new Date(giftcard.created_at).toLocaleDateString()}
    </span>
  </p>

  <p className="text-gray-600 mb-4">
    Stato:{" "}
    <span
      className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
        progress >= 100
          ? "bg-green-600"
          : new Date(giftcard.expires_at) < new Date()
          ? "bg-red-600"
          : "bg-blue-600"
      }`}
    >
      {progress >= 100
        ? "Completata"
        : new Date(giftcard.expires_at) < new Date()
        ? "Scaduta"
        : "In corso"}
    </span>
  </p>

  {giftcard.message && (
    <p className="italic text-gray-700 mb-6 border-l-4 border-purple-300 pl-4">
      “{giftcard.message}”
    </p>
  )}

  <p className="text-lg font-medium mb-4">
    Scadenza:{" "}
    <span className="text-purple-700 font-semibold">
      {new Date(giftcard.expires_at).toLocaleDateString()}
    </span>
  </p>

  {/* Progress bar */}
  <div className="mb-6">
    <div className="w-full bg-gray-200 rounded-full h-5 mb-2">
      <div
        className="bg-purple-700 h-5 rounded-full transition-all duration-700"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <p className="text-sm text-gray-700">
      {totalCollected}€ raccolti su {giftcard.amount}€
    </p>
  </div>
</div>
              {/* Colonna destra */}
              <div>
                {/* Link di condivisione */}
{/* Link di condivisione */}
<div className="mt-10 mb-12 bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-2xl shadow-lg">
  <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
    🔗 Condividi la tua Giftcard
  </h2>
  
  <div className="flex items-center gap-3">
    <input
      type="text"
      readOnly
      value={`${window.location.origin}/share/${giftcard.share_token}`}
      className="flex-1 border-2 border-purple-300 rounded-lg p-3 bg-white text-gray-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
    />
    <button
      onClick={() => {
        navigator.clipboard.writeText(
          `${window.location.origin}/share/${giftcard.share_token}`
        );
        alert("✨ Link copiato con successo!");
      }}
      className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
    >
      Copia
    </button>
  </div>

  <p className="text-sm text-gray-600 mt-3 italic">
    Condividi questo link con i tuoi amici per permettere loro di partecipare.
  </p>
</div>

              </div>
            </div>
                <div className="bg-purple-50 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-purple-800 mb-4">
                    Partecipa alla raccolta
                  </h2>
                  <form onSubmit={handleContribute} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        La tua quota (€)
                      </label>
                      <select
                        value={quota}
                        onChange={(e) => setQuota(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400"
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
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition shadow-md hover:shadow-lg"
                    >
                      Contribuisci
                    </button>
                  </form>
                </div>
            {/* Tabella partecipanti con ricerca */}
            <div className="mt-12 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-purple-700">
                  Partecipanti
                </h2>
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cerca ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
                    <tr>
                      <th className="py-3 px-4 text-left">Nome</th>
                      <th className="py-3 px-4 text-left">Cognome</th>
                      <th className="py-3 px-4 text-left">Quota</th>
                      <th className="py-3 px-4 text-left">Data</th>
                      <th className="py-3 px-4 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContributions.length > 0 ? (
                      filteredContributions.map((c, idx) => (
                        <tr
                          key={c.id}
                          className={`${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-purple-50 transition`}
                        >
                          <td className="py-3 px-4 font-medium">{c.first_name || "-"}</td>
                          <td className="py-3 px-4">{c.last_name || "-"}</td>
                          <td className="py-3 px-4 text-purple-700 font-semibold">
                            {c.amount}€
                          </td>
                          <td className="py-3 px-4">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                        <td className="py-3 px-4 w-28 text-center">
  {c.user_email === giftcard.owner_id ? (
    <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-200 text-yellow-800">
      Owner
    </span>
  ) : (
    <span className="text-xs font-semibold px-2 py-1 rounded bg-green-200 text-green-800">
      Participant
    </span>
  )}
</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 text-center text-gray-500 italic bg-gray-50"
                        >
                          Nessun partecipante trovato
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}