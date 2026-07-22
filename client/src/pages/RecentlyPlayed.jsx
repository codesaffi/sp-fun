import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function RecentlyPlayed() {
  const { token } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseResponse = async (res) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return { message: text };
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchTracks = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/player/recently-played`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await parseResponse(res);
        if (!res.ok) {
          throw new Error(data?.message || `Failed to load recently played tracks (${res.status})`);
        }

        setTracks(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load recently played tracks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [token]);

  if (loading) {
    return <div className="py-10 text-center text-[#c7bcc9]">Loading...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-[#ff8c8c]">{error}</div>;
  }

  return (
    <div className="w-full max-w-6xl px-1 py-4 sm:px-2 lg:px-0">
      <div className="mb-6">
        <p className="eyebrow">LISTENING HISTORY</p>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Recently played</h1>
      </div>
      {tracks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#4b4352] bg-[#151219] p-8 text-center text-[#b8b0bb]">
          No recent tracks are available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {tracks.map((track, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-[#16131b] p-4 sm:flex-row sm:items-center">
              <img
                src={track.image || "https://via.placeholder.com/64"}
                alt={track.name || "Recently played track"}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{track.name || "Unknown track"}</p>
                <p className="truncate text-sm text-[#a39ba7]">{track.artist || "Unknown artist"}</p>
                <p className="mt-1 text-xs text-[#7f7883]">
                  {track.playedAt ? new Date(track.playedAt).toLocaleString() : "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
