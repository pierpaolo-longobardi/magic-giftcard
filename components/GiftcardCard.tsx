"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Giftcard = {
  id: string;
  name: string;
  amount: number;
  expires_at: string;
  recipient_name: string;
};

export default function GiftcardCard({ giftcard }: { giftcard: Giftcard }) {
  const [progress, setProgress] = useState(0);
  const [collected, setCollected] = useState(0);

  useEffect(() => {
    const fetchContributions = async () => {
      const { data, error } = await supabase
        .from("giftcard_contributions")
        .select("amount")
        .eq("giftcard_id", giftcard.id);

      if (!error && data) {
        const total = data.reduce((sum, c) => sum + c.amount, 0);
        setCollected(total);
        setProgress(Math.min((total / giftcard.amount) * 100, 100));
      }
    };
    fetchContributions();
  }, [giftcard.id, giftcard.amount]);

  // Calcolo stato
  const today = new Date();
  const expired = new Date(giftcard.expires_at) < today;
  const completed = collected >= giftcard.amount;

  let status = "In corso";
  let badgeColor = "bg-blue-600";
  if (expired) {
    status = "Scaduta";
    badgeColor = "bg-red-600";
  } else if (completed) {
    status = "Completata";
    badgeColor = "bg-green-600";
  }

  return (
    <Link
      href={`/dashboard/magic-giftcard/${giftcard.id}`}
      className="block relative bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl hover:scale-105 transition-transform duration-300"
    >
      {/* Badge */}
      <span
        className={`absolute top-3 right-3 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full ${badgeColor} animate-[fadeInDown_0.6s_ease-out] shadow-md`}
      >
        {status}
      </span>
  
      <h2 className="text-xl font-semibold mb-2">{giftcard.name}</h2>
      <p className="text-gray-600 mb-2">Destinatario: {giftcard.recipient_name}</p>
      <p className="text-gray-500 mb-4">
        Scade: {new Date(giftcard.expires_at).toLocaleDateString()}
      </p>
  
      <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
        <div
          className="bg-purple-700 h-4 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-700">
        {collected}€ raccolti su {giftcard.amount}€
      </p>
    </Link>
  );
}