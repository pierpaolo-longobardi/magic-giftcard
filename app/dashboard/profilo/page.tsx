"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Stats = {
  createdCount: number;
  contributedCount: number;
  totalContributed: number;
};

type Notification = {
  id: string;
  first_name?: string;
  last_name?: string;
  amount: number;
  created_at: string;
  giftcards?: {
    name: string;
  } | null;
};

export default function ProfiloPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      // Statistiche
const userEmail = session.user.email;

const { count: createdCount } = await supabase
  .from("giftcards")
  .select("*", { count: "exact", head: true })
  .eq("owner_id", userEmail);

      const { data: contribs } = await supabase
        .from("giftcard_contributions")
        .select("amount")
        .eq("user_email", session.user.email);

      const contributedCount = contribs?.length || 0;
      const totalContributed =
        contribs?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

      setStats({ createdCount: createdCount || 0, contributedCount, totalContributed });

      // Notifiche: join con giftcards
      const { data: notifData, error } = await supabase
        .from("giftcard_contributions")
        .select("id, first_name, last_name, amount, created_at, giftcards(name, owner_id)")
        .eq("giftcards.owner_id", session.user.email)
        .order("created_at", { ascending: false });

      if (!error && notifData) {
        setNotifications(notifData);
      } else if (error) {
        console.error("Errore notifiche:", error.message);
      }
    };

    fetchData();
  }, [session]);

  if (!session) {
    return (
      <main className="p-8">
        <p>Devi effettuare il login per vedere il tuo profilo.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        {/* Header profilo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <Image
              src={session.user?.image || "/default-avatar.png"}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border-2 border-purple-500"
            />
            <div>
              <h1 className="text-3xl font-bold text-purple-700">
                {session.user?.name || "Utente"}
              </h1>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-purple-50 p-6 rounded-lg shadow hover:shadow-md transition">
            <p className="text-sm text-gray-600">Giftcard create</p>
            <p className="text-2xl font-bold text-purple-700">
              {stats?.createdCount ?? 0}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow hover:shadow-md transition">
            <p className="text-sm text-gray-600">Giftcard a cui hai partecipato</p>
            <p className="text-2xl font-bold text-purple-700">
              {stats?.contributedCount ?? 0}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow hover:shadow-md transition">
            <p className="text-sm text-gray-600">Totale contributi</p>
            <p className="text-2xl font-bold text-purple-700">
              {stats?.totalContributed ?? 0}€
            </p>
          </div>
        </div>

        {/* Notifiche */}
        <div>
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            🔔 Notifiche
          </h2>
          {notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold">{n.first_name} {n.last_name}</span>{" "}
                    ha contribuito con{" "}
                    <span className="font-semibold">{n.amount}€</span>{" "}
                    alla giftcard{" "}
                    <span className="font-semibold">“{n.giftcards?.name || "Sconosciuta"}”</span>.
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nessuna notifica disponibile.</p>
          )}
        </div>
      </div>
    </main>
  );
}