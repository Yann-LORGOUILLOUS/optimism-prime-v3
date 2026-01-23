"use client";

import { ReactNode, useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [backgroundIndex, setBackgroundIndex] = useState<number>(() => {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem("opp_backgroundIndex");
  if (!saved) return 0;

  const parsed = Number.parseInt(saved, 10);
  return Number.isFinite(parsed) ? parsed : 0;
});

  useEffect(() => {
    localStorage.setItem("opp_backgroundIndex", backgroundIndex.toString());
  }, [backgroundIndex]);

  const backgroundStyle = {
    backgroundImage: `url(/banner/indexed/${String(backgroundIndex).padStart(3, "0")}.jpg)`,
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-fixed bg-no-repeat"
      style={backgroundStyle}
    >
      <header className="flex justify-between items-center p-4 bg-linear-to-b from-black">
        <div className="flex items-center gap-2">
          <Image src="/logo_round.png" alt="logo" width={64} height={64} />
          <h1 className="text-3xl font-transformers text-white">
            <span className="italic mr-2">OPTIMISM</span>
            <span>PRIME</span>
          </h1>
        </div>
        <ConnectButton accountStatus="address" label="CONNECT" />
      </header>

      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <main className="flex-1 flex flex-col items-center px-4 md:px-12 py-8">
        {children}
      </main>

      <footer className="flex justify-center items-center gap-2 p-4 bg-black text-gray-500">
        <span>Background:</span>
        <input
          type="number"
          min={0}
          max={44}
          value={backgroundIndex}
          onChange={(e) => setBackgroundIndex(parseInt(e.target.value, 10) || 0)}
          className="w-16 bg-black text-white border border-gray-700 px-2"
        />
      </footer>
    </div>
  );
}