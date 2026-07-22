import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdvancedTest() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/advanced/advanced`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await parseResponse(res);
        if (!res.ok) {
          throw new Error(json?.message || `Failed to load advanced Spotify data (${res.status})`);
        }

        setData(json || null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load advanced Spotify insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="py-10 text-center text-[#c7bcc9]">Loading...</div>;
  if (error) return <div className="py-10 text-center text-[#ff8c8c]">{error}</div>;
  if (!data) return <div className="py-10 text-center text-[#c7bcc9]">No advanced data available.</div>;

  return (
    <div className="w-full max-w-6xl space-y-6 px-1 py-4 sm:px-2 lg:px-0">
      <div className="mb-2">
        <p className="eyebrow">ADVANCED SPOTIFY</p>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Advanced Spotify insights</h1>
      </div>
      {data.warnings && (
        <div className="rounded-2xl border border-[#ffcc66]/40 bg-[#221b11] p-4 text-sm text-[#ffd79e]">
          {data.warnings.noTopTracks && <p>Warning: Top tracks were not available.</p>}
          {data.warnings.noTopArtists && <p>Warning: Top artists were not available.</p>}
          {data.warnings.noAudioFeatures && <p>Warning: Audio feature analysis is unavailable.</p>}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-[#16131b] p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">🧪 Taste profile</h2>
        <p className="mb-4 text-sm text-[#a39ba7]">This section infers your music taste using your top artist, top track, genres, and audio features.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#0f0d13] p-4">
            <h3 className="font-semibold text-white">Favorite artist</h3>
            <p className="mt-2 text-[#dfe1e6]">{data.favoriteArtist?.name || "No favorite artist available"}</p>
          </div>
          <div className="rounded-2xl bg-[#0f0d13] p-4">
            <h3 className="font-semibold text-white">Favorite track</h3>
            <p className="mt-2 text-[#dfe1e6]">{data.favoriteTrack?.name || "No favorite track available"}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#0f0d13] p-4">
          <h3 className="font-semibold text-white">Music profile</h3>
          <p className="mt-2 text-[#dfe1e6]">{data.musicProfile || "No profile available"}</p>
        </div>

        <div className="mt-4 rounded-2xl bg-[#0f0d13] p-4">
          <h3 className="font-semibold text-white">Mood</h3>
          <p className="mt-2 text-[#d8fa61]">{data.mood || "Mood analysis unavailable"}</p>
          <p className="mt-2 text-[#dfe1e6]">{data.moodDescription || "We’re still inferring your mood from recent listening patterns."}</p>
        </div>

        {data.topGenres?.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-[#0f0d13] p-4">
            <h3 className="mb-2 font-semibold text-white">Top genres</h3>
            <div className="flex flex-wrap gap-2">
              {data.topGenres.map((genre, index) => (
                <span key={index} className="rounded-full bg-[#d8fa61]/15 px-3 py-1 text-sm text-white">
                  {genre.name} ({genre.count})
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#0f0d13] p-4">
            <h3 className="mb-2 font-semibold text-white">Top genres</h3>
            <p className="text-[#a39ba7]">Top genres are not available for your current Spotify data.</p>
          </div>
        )}

        {data.avgAudioFeatures && Object.keys(data.avgAudioFeatures).length > 0 && (
          <div className="mt-4 rounded-2xl bg-[#0f0d13] p-4">
            <h3 className="mb-3 font-semibold text-white">Average audio features</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.avgAudioFeatures).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-[#16131b] p-3">
                  <p className="text-sm capitalize text-[#a39ba7]">{key}</p>
                  <p className="mt-1 text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl] border border-white/10 bg-[#16131b] p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">🎧 Audio features</h2>
        {data.audioFeatures?.length > 0 ? (
          <div className="grid gap-3">
            {data.audioFeatures.map((f, i) => (
              <div key={i} className="rounded-2xl bg-[#0f0d13] p-4">
                <p className="text-[#dfe1e6]">Energy: {f?.energy ?? "N/A"}</p>
                <p className="text-[#dfe1e6]">Danceability: {f?.danceability ?? "N/A"}</p>
                <p className="text-[#dfe1e6]">Valence: {f?.valence ?? "N/A"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#a39ba7]">Audio feature data is not available yet.</p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#16131b] p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">🤖 Recommendations</h2>
        {data.recommendations?.length > 0 ? (
          <div className="grid gap-2">
            {data.recommendations.map((r, i) => <p key={i} className="text-[#dfe1e6]">{r.name}</p>)}
          </div>
        ) : (
          <p className="text-[#a39ba7]">No recommendations available right now.</p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#16131b] p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">🎤 Artist details</h2>
        <p className="text-[#dfe1e6]">{data.artistDetails?.name}</p>
        <p className="mt-1 text-[#a39ba7]">Followers: {data.artistDetails?.followers?.total}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#16131b] p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">👥 Related artists</h2>
        {data.relatedArtists?.length > 0 ? (
          <div className="grid gap-2">
            {data.relatedArtists.map((a, i) => <p key={i} className="text-[#dfe1e6]">{a.name}</p>)}
          </div>
        ) : (
          <p className="text-[#a39ba7]">Related artists are not available yet.</p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#16131b] p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">💿 Albums</h2>
        {data.albums?.length > 0 ? (
          <div className="grid gap-2">
            {data.albums.slice(0, 5).map((a, i) => <p key={i} className="text-[#dfe1e6]">{a.name}</p>)}
          </div>
        ) : (
          <p className="text-[#a39ba7]">Albums info is not available yet.</p>
        )}
      </div>
    </div>
  );
}
