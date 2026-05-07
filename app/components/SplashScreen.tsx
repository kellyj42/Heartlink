"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide navbar while splash is visible
    if (isVisible) {
      document.body.classList.add("splash-active");
    } else {
      document.body.classList.remove("splash-active");
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-red-600/20 blur-3xl animate-pulse" />
      </div>

      {/* ECG Line Animation */}
      <div className="absolute z-[3000] inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-1/3 left-0 w-[900] h-32 -translate-y-1/2 animate-ecg-line"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 L100,50 L110,20 L120,80 L130,50 L200,50 L210,30 L220,70 L230,50 L300,50 L310,40 L320,60 L330,50 L400,50 L410,25 L420,75 L430,50 L500,50 L510,35 L520,65 L530,50 L600,50 L610,45 L620,55 L630,50 L700,50 L710,20 L720,80 L730,50 L800,50 L810,30 L820,70 L830,50 L900,50 L910,40 L920,60 L930,50 L1000,50 L1010,25 L1020,75 L1030,50 L1100,50 L1110,35 L1120,65 L1130,50 L1200,50"
            stroke="white"
            strokeWidth="2"
            fill="none"
            className="animate-ecg-wave"
          />
        </svg>
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="animate-fade-in">
          <img
            src="/logo.png"
            alt="HeartLink Logo"
            className="h-96 w-96 drop-shadow-2xl animate-heart-pulse"
          />
        </div>

        <div className="text-center">
          <h1 className="text-7xl font-bold text-white mb-2">HeartLink</h1>
          <p className="text-slate-300 text-sm tracking-widest uppercase">
            Find Your Connection
          </p>
        </div>
      </div>
    </div>
  );
}
