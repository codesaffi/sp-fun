import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const login = () => {
    window.location.href = `${API_URL}/auth/spotify`;
  };

  return (
    <div className="min-h-screen bg-[#09090d] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-[#121018]/90 p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.32em] text-[#d8fa61]">Social listening</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
            Discover the people behind your playlist.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#b5acb9] sm:text-base">
            Sign in with Spotify to connect, compare tastes, and share the music that feels like home.
          </p>
          <button
            onClick={login}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d8fa61] px-6 py-3 text-sm font-semibold text-[#1f2914] transition hover:-translate-y-0.5 hover:bg-[#e2ff84] sm:px-8"
          >
            Sign in with Spotify
          </button>
        </div>
      </div>
    </div>
  );
}
