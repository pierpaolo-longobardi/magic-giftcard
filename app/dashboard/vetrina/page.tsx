"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price: string;
  image: string;
};

export default function VetrinaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error("Errore prodotti:", error.message);
      else setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50">

      
      <div className="max-w-7xl mx-auto">
<h2 className="text-2xl font-semibold text-purple-700 mb-12">
  Vetrina Prodotti
</h2>

        {loading ? (
          <p className="text-gray-500 text-center">Caricamento prodotti...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-105 flex flex-col"
              >
                {/* Immagine proporzionata */}
                <div className="w-full aspect-square overflow-hidden">
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  className="w-full h-56 object-cover rounded-md mb-4"
/>
                </div>

                {/* Info prodotto */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h2>
                    <p className="text-purple-700 font-semibold text-lg">{product.price} €</p>
                  </div>
                  <Link href="/dashboard/magic-giftcard/crea">
                    <button className="mt-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 w-full">
                      Crea Magic Giftcard
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center">Nessun prodotto disponibile.</p>
        )}
      </div>
    </main>
  );
}