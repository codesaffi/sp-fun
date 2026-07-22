import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserProfile({ userId, onBack }) {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("shortTerm");

  useEffect(() => {
    if (!token || !userId) return;

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await res.json();
        setUser(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, userId]);

  if (loading) return <div className="py-10 text-center text-[#c7bcc9]">Loading user profile...</div>;
  if (error) return <div className="py-10 text-center text-[#ff8c8c]">Error: {error}</div>;
  if (!user) return <div className="py-10 text-center text-[#c7bcc9]">User not found</div>;

  const stats = user.stats ? user.stats[range] : null;

  return (
    <div className="w-full max-w-6xl px-1 py-4 sm:px-2 lg:px-0">
      <button
        onClick={onBack}
        className="mb-6 inline-flex min-h-11 items-center rounded-full border border-white/10 bg-[#1d1824] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d8fa61]/40"
      >
        ← Back to users
      </button>

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#16131b] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2a2330] text-lg font-semibold text-[#d8fa61] sm:h-24 sm:w-24">
              {user.name?.slice(0, 2).toUpperCase() || "U"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xl font-semibold text-white">{user.name}</p>
            <p className="mt-1 text-sm text-[#a39ba7]">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: "shortTerm", label: "Last month" },
          { id: "mediumTerm", label: "Last 6 months" },
          { id: "longTerm", label: "All time" },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => setRange(option.id)}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
              range === option.id ? "bg-[#d8fa61] text-[#1f2914]" : "bg-[#1d1824] text-[#f8f4f8]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!user.stats ? (
        <p className="text-lg text-[#a39ba7]">No stats data available for this user.</p>
      ) : (
        <>
          <h3 className="mb-4 mt-8 text-2xl font-semibold text-white">Top artists</h3>
          {stats && stats.topArtists && stats.topArtists.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.topArtists.map((artist, index) => (
                <div key={index} className="rounded-[20px] border border-white/10 bg-[#151219] p-4 text-center">
                  <img src={artist.image} alt={artist.name} className="mb-3 h-36 w-full rounded-xl object-cover" />
                  <p className="font-semibold text-white">{artist.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#a39ba7]">No artists data available for this period.</p>
          )}

          <h3 className="mb-4 mt-8 text-2xl font-semibold text-white">Top tracks</h3>
          {stats && stats.topTracks && stats.topTracks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.topTracks.map((track, index) => (
                <div key={index} className="rounded-[20px] border border-white/10 bg-[#151219] p-4 text-center">
                  <img src={track.image} alt={track.name} className="mb-3 h-36 w-full rounded-xl object-cover" />
                  <p className="font-semibold text-white">{track.name}</p>
                  <p className="mt-1 text-sm text-[#a39ba7]">{track.artist}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#a39ba7]">No tracks data available for this period.</p>
          )}
        </>
      )}
    </div>
  );
}
