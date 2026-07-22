import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import React from "react";
import UserProfile from "./UserProfile";

const API_URL = import.meta.env.VITE_API_URL;

export default function OtherUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  if (loading) return <div className="py-10 text-center text-[#c7bcc9]">Loading users...</div>;
  if (error) return <div className="py-10 text-center text-[#ff8c8c]">Error: {error}</div>;

  if (selectedUserId) {
    return <UserProfile userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  }

  return (
    <div className="w-full max-w-6xl px-1 py-4 sm:px-2 lg:px-0">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">DISCOVER LISTENERS</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Other users</h2>
        </div>
        <p className="text-sm text-[#a39ba7]">Tap a profile to see their music story.</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#4b4352] bg-[#151219] p-8 text-center text-[#b8b0bb]">
          No other users found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUserId(user._id)}
              className="cursor-pointer rounded-[22px] border border-white/10 bg-[#16131b] p-5 transition hover:-translate-y-0.5 hover:border-[#d8fa61]/40"
            >
              <div className="mb-4 flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2330] text-sm font-semibold text-[#d8fa61]">
                    {user.name?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-white">{user.name}</p>
                  <p className="truncate text-sm text-[#a39ba7]">{user.email}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0f0d13] p-3">
                {user.stats && user.stats.shortTerm ? (
                  <>
                    <p className="mb-2 text-sm font-semibold text-white">Top artists this month</p>
                    <div className="space-y-1">
                      {user.stats.shortTerm.topArtists.slice(0, 3).map((artist, idx) => (
                        <p key={idx} className="truncate text-xs text-[#b6adb8]">
                          {idx + 1}. {artist.name}
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#b6adb8]">Taste data will appear here soon.</p>
                )}
              </div>

              <p className="mt-4 text-sm font-semibold text-[#d8fa61]">View full profile →</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
