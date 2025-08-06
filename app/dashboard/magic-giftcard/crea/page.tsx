"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreaGiftcardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [message, setMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      alert("Devi essere loggato per creare una giftcard!");
      return;
    }

    // Genera token unico
    const shareToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from("giftcards")
      .insert([
        {
          owner_id: session.user.email,
          name,
          amount: Number(amount),
          expires_at: expiresAt,
          message,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          share_token: shareToken,
        },
      ])
      .select();

    if (error) {
      console.error("Errore creazione giftcard:", error.message);
      alert("Errore nella creazione. Riprova.");
    } else {
      const newGiftcardId = data?.[0]?.id;
      router.push(`/dashboard/magic-giftcard/${newGiftcardId}`);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        ✨ Crea una nuova Magic Giftcard
      </h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Nome Giftcard</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Destinatario</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Es. Anna Rossi"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Email Destinatario</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="anna@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Importo Totale (€)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Data di scadenza</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Messaggio (opzionale)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 h-24"
            placeholder="Un messaggio speciale..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-purple-700 text-white py-3 px-6 rounded-lg hover:bg-purple-800 transition"
        >
          Crea Giftcard
        </button>
      </form>
    </main>
  );
}