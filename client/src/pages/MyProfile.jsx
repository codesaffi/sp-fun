import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Radio,
  BookOpen,
  Users,
  BarChart2,
  History,
  Disc,
  Music,
  Zap,
  Award,
  Settings,
  Edit3,
  Share2,
  Sparkles,
  Check,
  Star,
  Flame,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import DiaryEntryCard from "../components/DiaryEntryCard";
import JoinedCommunities from "../components/JoinedCommunities";
import { ProfileSkeleton, ButtonLoader } from "../components/Loading";

const API = `${import.meta.env.VITE_API_URL}/api`;
const tabs = [
  "Overview",
  "Posts",
  "Music Diary",
  "Communities",
  "Stats",
  "Recently Played",
  "Top Artists",
  "Top Songs",
  "Music DNA",
  "Achievements",
  "Settings",
];

const tabIcons = {
  Overview: <Sparkles className="w-4 h-4" />,
  Posts: <Radio className="w-4 h-4" />,
  "Music Diary": <BookOpen className="w-4 h-4" />,
  Communities: <Users className="w-4 h-4" />,
  Stats: <BarChart2 className="w-4 h-4" />,
  "Recently Played": <History className="w-4 h-4" />,
  "Top Artists": <User className="w-4 h-4" />,
  "Top Songs": <Music className="w-4 h-4" />,
  "Music DNA": <Zap className="w-4 h-4" />,
  Achievements: <Award className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
};

const initials = (name = "You") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

const Avatar = ({ user, large = false }) =>
  user?.avatar ? (
    <img
      className={large ? "profile-avatar large border-4 border-[#0e0c12] shadow-2xl" : "profile-avatar"}
      src={user.avatar}
      alt=""
    />
  ) : (
    <span className={large ? "profile-avatar large border-4 border-[#0e0c12] shadow-2xl" : "profile-avatar"}>
      {initials(user?.name)}
    </span>
  );

export default function MyProfile() {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [insights, setInsights] = useState(null);
  const [posts, setPosts] = useState([]);
  const [diary, setDiary] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [bio, setBio] = useState("");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const load = async () => {
    setLoading(true);
    try {
      const [me, data, feed, board, diaryResponse, communitiesResponse] = await Promise.all([
        fetch(`${API}/user/me`, { headers }),
        fetch(`${API}/social/insights?refresh=true`, { headers }),
        fetch(`${API}/posts`, { headers }),
        fetch(`${API}/social/leaderboard`, { headers }),
        fetch(`${API}/diary/me`, { headers }),
        fetch(`${API}/communities/mine`, { headers }),
      ]);
      const meJson = me.ok ? await me.json() : null;
      setUser(meJson);
      setBio(meJson?.bio || "Music keeps the memories we forget to save.");
      setInsights(data.ok ? await data.json() : null);
      const postData = feed.ok ? await feed.json() : [];
      setPosts(postData.filter((post) => post.user?._id === meJson?._id));
      setDiary(diaryResponse.ok ? await diaryResponse.json() : []);
      setCommunities(communitiesResponse.ok ? await communitiesResponse.json() : []);
      setMatches(board.ok ? await board.json() : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
    const refreshDiary = () => {
      if (token) load();
    };
    window.addEventListener("diary-updated", refreshDiary);
    return () => window.removeEventListener("diary-updated", refreshDiary);
  }, [token]);

  const saveBio = async () => {
    if (savingBio) return;
    setSavingBio(true);
    try {
      const response = await fetch(`${API}/social/profile`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (response.ok) {
        setUser((current) => ({ ...current, bio }));
        setEditing(false);
        toast.success("Bio updated successfully");
      }
    } catch {
      toast.error("Failed to update bio");
    } finally {
      setSavingBio(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  const topArtists = user?.stats?.shortTerm?.topArtists || [];
  const topTracks = user?.stats?.shortTerm?.topTracks || [];
  const recent = user?.recentlyPlayed || [];
  const dna = insights?.musicDna || {};
  const genres = insights?.topGenres || [];
  const personality = insights?.personality || "The Explorer";
  const mood = insights?.mood || "Curious";

  const statistics = [
    {
      label: "Top artist",
      value: insights?.favoriteArtist?.name || topArtists[0]?.name || "—",
    },
    {
      label: "Top song",
      value: insights?.favoriteTrack?.name || topTracks[0]?.name || "—",
    },
    { label: "Favorite genre", value: genres[0] || "Discovering" },
    { label: "Current mood", value: mood },
    { label: "Music personality", value: personality },
    { label: "Posts", value: posts.length },
    {
      label: "Total likes",
      value: posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0),
    },
    { label: "Recently played", value: recent.length },
  ];

  if (loading) return <ProfileSkeleton />;

  if (!user)
    return (
      <div className="profile-empty p-8 text-center glass-panel rounded-2xl">
        <Disc className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">We couldn’t load your profile.</h2>
        <button onClick={load} className="mt-4 px-4 py-2 bg-[#d8fa61] text-[#0e0c12] rounded-xl font-semibold text-xs cursor-pointer">Try again</button>
      </div>
    );

  const panel = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.2 },
  };

  const updatePost = (updated) =>
    setPosts((current) =>
      updated?.deleted
        ? current.filter((post) => post._id !== updated._id)
        : updated
          ? current.map((post) => (post._id === updated._id ? updated : post))
          : current,
    );

  return (
    <section className="profile-premium">
      <motion.div
        className="profile-cover relative h-56 rounded-3xl overflow-hidden border border-white/10"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <i className="cover-orb one" />
        <i className="cover-orb two" />
        <i className="cover-grid" />
      </motion.div>

      <div className="profile-intro relative px-6 flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 z-10">
        <div className="flex items-end gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="avatar-glow"
          >
            <Avatar user={user} large />
          </motion.div>
          <div className="profile-name space-y-1">
            <p className="eyebrow text-xs text-[#d8fa61] font-bold">
              LISTENING SINCE {new Date(user.createdAt).getFullYear()}
            </p>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="handle text-xs text-white/50">
              @{user.name?.toLowerCase().replace(/\s+/g, ".")}
            </p>
            <div className="badge-row flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">🎧 Indie Lover</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">🌙 Night Listener</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">⭐ Top Listener</span>
            </div>
          </div>
        </div>

        <div className="profile-actions flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5 border border-white/10"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit profile
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copyShareLink}
            className="px-4 py-2 bg-[#d8fa61] text-[#0e0c12] text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </motion.button>
        </div>
      </div>

      <div className="profile-bio glass-panel p-4 rounded-2xl my-4 flex items-start gap-3">
        <span className="text-2xl text-[#d8fa61] font-serif leading-none">“</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 italic">{user.bio || bio}</p>
          <small className="text-xs text-white/40 block mt-1">{personality} · ranked among your closest listeners</small>
        </div>
      </div>

      <div className="profile-tabs flex gap-2 overflow-x-auto pb-2 border-b border-white/10 my-4" role="tablist">
        {tabs.map((item) => (
          <button
            role="tab"
            aria-selected={tab === item}
            key={item}
            onClick={() => setTab(item)}
            className={tab === item ? "active cursor-pointer px-3 py-1.5 text-xs font-medium rounded-xl bg-[#d8fa61] text-[#0e0c12] inline-flex items-center gap-1.5 shrink-0" : "cursor-pointer px-3 py-1.5 text-xs font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/5 inline-flex items-center gap-1.5 shrink-0"}
          >
            {tabIcons[item]}
            <span>{item}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} {...panel}>
          {tab === "Overview" && (
            <div className="space-y-6">
              <div className="profile-summary grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {statistics.slice(0, 6).map((stat) => (
                  <motion.article
                    whileHover={{ y: -3 }}
                    key={stat.label}
                    className="glass-panel p-3.5 rounded-2xl border border-white/10"
                  >
                    <p className="text-[10px] font-bold text-white/40 uppercase">{stat.label}</p>
                    <h3 className="text-sm font-bold text-white truncate mt-1">{stat.value}</h3>
                  </motion.article>
                ))}
              </div>

              <div className="profile-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                  <p className="eyebrow text-xs text-[#d8fa61] font-bold">YOUR SOUND</p>
                  <h2 className="text-xl font-bold text-white">{personality}</h2>
                  <p className="text-xs text-white/70">
                    {insights?.description ||
                      "A listening identity built from the music you return to."}
                  </p>
                  <div className="genre-pills flex flex-wrap gap-1.5 pt-2">
                    {genres.map((genre) => (
                      <span key={genre} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/80 border border-white/10">{genre}</span>
                    ))}
                  </div>
                </section>

                <section className="glass-panel p-5 rounded-2xl border border-white/10">
                  <p className="eyebrow text-xs text-[#d8fa61] font-bold">MUSIC TWIN</p>
                  {matches[0] ? (
                    <div className="flex items-center gap-3 mt-3">
                      <Avatar user={matches[0]} />
                      <div>
                        <h2 className="text-base font-bold text-white">
                          {matches[0].name}{" "}
                          <b className="text-[#d8fa61]">{matches[0].compatibility.score}%</b>
                        </h2>
                        <p className="text-xs text-white/60">
                          {matches[0].compatibility.sharedArtists
                            ?.slice(0, 2)
                            .join(" · ") || matches[0].personality}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-white/40 p-4">
                      We’re finding your music twin.
                    </div>
                  )}
                </section>
              </div>

              <MusicDna dna={dna} />
            </div>
          )}

          {tab === "Posts" && (
            <ProfilePosts
              posts={posts}
              user={user}
              token={token}
              onChange={updatePost}
            />
          )}

          {tab === "Stats" && (
            <div className="space-y-6">
              <div className="profile-summary grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statistics.map((stat) => (
                  <article key={stat.label} className="glass-panel p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-white/40 uppercase">{stat.label}</p>
                    <h3 className="text-base font-bold text-white truncate mt-1">{stat.value}</h3>
                  </article>
                ))}
              </div>

              <div className="glass-panel p-6 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Audio Feature Spectrum</h3>
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(dna).map(([k, v]) => ({ name: k, value: v }))}>
                      <XAxis dataKey="name" stroke="#a39ba7" fontSize={12} />
                      <YAxis stroke="#a39ba7" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#16131b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="value" fill="#d8fa61" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === "Music Diary" && (
            <DiaryEntries
              entries={diary}
              token={token}
              user={user}
              editable
              onChange={(updated) =>
                setDiary((current) =>
                  updated?.deleted
                    ? current.filter((entry) => entry._id !== updated._id)
                    : current.map((entry) => (entry._id === updated._id ? updated : entry)),
                )
              }
            />
          )}

          {tab === "Communities" && <JoinedCommunities communities={communities} />}

          {tab === "Recently Played" && (
            <div className="space-y-3">
              {recent.length ? (
                recent.map((item, index) => (
                  <div key={index} className="glass-panel p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.image ? <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt="" /> : <Disc className="w-6 h-6 text-[#d8fa61]" />}
                      <div>
                        <b className="text-sm text-white block">{item.name}</b>
                        <small className="text-xs text-white/60">{item.artist}</small>
                      </div>
                    </div>
                    <span className="text-[11px] text-white/40">{new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/50 text-center p-6">No recent tracks synced yet.</p>
              )}
            </div>
          )}

          {tab === "Top Artists" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topArtists.map((artist, index) => (
                <div key={index} className="glass-panel p-4 rounded-2xl text-center space-y-2">
                  {artist.image ? <img src={artist.image} className="w-16 h-16 rounded-full mx-auto object-cover" alt="" /> : <User className="w-10 h-10 mx-auto text-[#d8fa61]" />}
                  <b className="text-sm text-white block truncate">{artist.name}</b>
                  <span className="text-[10px] text-white/50 block">{artist.genres?.slice(0, 2).join(", ")}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "Top Songs" && (
            <div className="space-y-2">
              {topTracks.map((track, index) => (
                <div key={index} className="glass-panel p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#d8fa61] w-4">#{index + 1}</span>
                    {track.image ? <img src={track.image} className="w-10 h-10 rounded-lg object-cover" alt="" /> : <Music className="w-6 h-6 text-white/40" />}
                    <div>
                      <b className="text-sm text-white block">{track.name}</b>
                      <small className="text-xs text-white/60">{track.artist}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Music DNA" && <MusicDna dna={dna} full />}

          {tab === "Achievements" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "First Note", desc: "Joined MusicMatch social platform.", icon: <Award className="w-5 h-5 text-[#d8fa61]" /> },
                { title: "Music Explorer", desc: "Listened to over 20 distinct artists this month.", icon: <Flame className="w-5 h-5 text-amber-400" /> },
                { title: "Reviewer", desc: "Saved entries to your Music Diary.", icon: <BookOpen className="w-5 h-5 text-purple-400" /> },
              ].map((item, i) => (
                <div key={i} className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-xl">{item.icon}</div>
                  <div>
                    <b className="text-sm text-white block">{item.title}</b>
                    <small className="text-xs text-white/60">{item.desc}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Settings" && (
            <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-md">
              <h3 className="text-base font-bold text-white">Profile Settings</h3>
              <div>
                <label className="text-xs text-white/60 block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#0e0c12] border border-white/15 rounded-xl p-3 text-xs text-white"
                  rows={3}
                />
              </div>
              <button onClick={saveBio} disabled={savingBio} className="px-4 py-2 bg-[#d8fa61] text-[#0e0c12] font-semibold text-xs rounded-xl cursor-pointer">
                {savingBio ? <ButtonLoader label="Saving" /> : "Save Profile"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {editing && (
        <div className="modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="profile-edit glass-panel p-6 rounded-3xl max-w-md w-full relative">
            <button className="close absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer" onClick={() => setEditing(false)}>×</button>
            <p className="eyebrow">EDIT PROFILE</p>
            <h2 className="text-lg font-bold text-white my-2">Update your bio</h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#0e0c12] border border-white/15 rounded-xl p-3 text-xs text-white my-2"
              rows={4}
              disabled={savingBio}
            />
            <button onClick={saveBio} disabled={savingBio} className="w-full py-2 bg-[#d8fa61] text-[#0e0c12] rounded-xl font-bold text-xs cursor-pointer">
              {savingBio ? <ButtonLoader label="Saving" /> : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ProfilePosts({ posts, user, token, onChange }) {
  if (!posts.length)
    return (
      <div className="empty-state p-8 text-center glass-panel rounded-2xl">
        <Radio className="w-10 h-10 text-white/20 mx-auto mb-2" />
        <h2 className="text-base font-bold text-white">No posts shared yet.</h2>
      </div>
    );
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          token={token}
          currentUserId={user?._id}
          onChange={onChange}
          manage
        />
      ))}
    </div>
  );
}

function DiaryEntries({ entries, token, user, editable, onChange }) {
  if (!entries.length)
    return (
      <div className="empty-state p-8 text-center glass-panel rounded-2xl">
        <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-2" />
        <h2 className="text-base font-bold text-white">No diary entries saved yet.</h2>
      </div>
    );
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <DiaryEntryCard
          key={entry._id}
          entry={entry}
          token={token}
          currentUserId={user?._id}
          editable={editable}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function MusicDna({ dna, full = false }) {
  const data = Object.entries(dna).slice(0, full ? 6 : 4);
  return (
    <section className="glass-panel p-6 rounded-2xl space-y-4 border border-white/10">
      <div className="flex justify-between items-center">
        <p className="eyebrow text-xs text-[#d8fa61] font-bold">MUSIC DNA</p>
        <Zap className="w-4 h-4 text-[#d8fa61]" />
      </div>
      <div className="space-y-3">
        {data.map(([name, value]) => (
          <div key={name} className="space-y-1">
            <div className="flex justify-between text-xs text-white/80">
              <span className="capitalize">{name}</span>
              <b className="text-[#d8fa61]">{value}%</b>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#d8fa61] to-[#8d70d7] rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
