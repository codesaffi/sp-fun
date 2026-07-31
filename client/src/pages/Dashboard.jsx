import React, { Suspense, lazy, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Users,
  Music,
  Grid,
  BookOpen,
  Bell,
  LogOut,
  TrendingUp,
  Zap,
  Sparkles,
  Share2,
  X,
  Radio,
  Sliders,
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import { PageSkeleton, PostSkeleton, ButtonLoader } from "../components/Loading";
import { useDebounce } from "../hooks/useDebounce";

const MyProfile = lazy(() => import("./MyProfile"));
const OtherUsers = lazy(() => import("./OtherUsers"));
const MyMusicTaste = lazy(() => import("./MyMusicTaste"));
const RecentlyPlayed = lazy(() => import("./RecentlyPlayed"));
const AdvancedTest = lazy(() => import("./AdvancedTest"));

const API_URL = import.meta.env.VITE_API_URL;
const api = `${API_URL}/api/social`;
const initials = (name = "You") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

const Avatar = ({ user, size = "md" }) =>
  user?.avatar ? (
    <img className={`avatar ${size}`} src={user.avatar} alt="" />
  ) : (
    <span className={`avatar ${size}`}>{initials(user?.name)}</span>
  );

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [insights, setInsights] = useState(null);
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState("");
  const [shared, setShared] = useState(false);
  const [compare, setCompare] = useState(null);
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [postModal, setPostModal] = useState(false);
  const [postType, setPostType] = useState("top_artist");
  const [caption, setCaption] = useState("");
  const [postError, setPostError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [compareLoading, setCompareLoading] = useState("");

  const debouncedQuery = useDebounce(query.trim(), 350);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${api}/insights?refresh=true`, { headers }).then(
        (r) => r.ok && r.json(),
      ),
      fetch(`${api}/leaderboard`, { headers }).then((r) => r.ok && r.json()),
    ])
      .then(([me, board]) => {
        setInsights(me || null);
        setPeople(board || []);
      })
      .catch(() => {});
  }, [token, headers]);

  const loadPosts = useCallback(async () => {
    setFeedLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/posts`, { headers });
      if (r.ok) setPosts(await r.json());
    } catch {
      // Keep dashboard usable on error
    } finally {
      setFeedLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (token) loadPosts();
  }, [token, loadPosts]);

  const explore = useCallback(async (value = query) => {
    const response = await fetch(
      `${api}/discover?q=${encodeURIComponent(value)}`,
      { headers },
    );
    if (response.ok) setPeople(await response.json());
  }, [headers, query]);

  useEffect(() => {
    if (view === "discover" && token) {
      explore(debouncedQuery);
    }
  }, [debouncedQuery, view, token, explore]);

  const showCompare = async (person) => {
    if (compareLoading) return;
    setCompareLoading(person._id);
    try {
      const response = await fetch(`${api}/compare/${person._id}`, { headers });
      if (response.ok) setCompare(await response.json());
    } finally {
      setCompareLoading("");
    }
  };

  const nav = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "feed", label: "Feed", icon: <Radio className="w-4 h-4" /> },
    { id: "discover", label: "Search", icon: <Search className="w-4 h-4" /> },
    { id: "matches", label: "Matches", icon: <Users className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "library", label: "Library", icon: <Music className="w-4 h-4" /> },
    { id: "diary", label: "Music Diary", icon: <BookOpen className="w-4 h-4" /> },
    { id: "community", label: "Community", icon: <Grid className="w-4 h-4" /> },
    { id: "logout", label: "Logout", icon: <LogOut className="w-4 h-4 text-red-400" /> },
  ];

  const user = insights?.user;
  const genres = insights?.topGenres?.length
    ? insights.topGenres
    : ["indie pop", "dream pop", "alternative", "bedroom pop"];
  const personality = insights?.personality || "Sound Explorer";
  const mood = insights?.mood || "Curious";

  const radarData = useMemo(() => {
    const dna = insights?.musicDna || { energy: 52, danceability: 50, positivity: 51, acousticness: 34 };
    return Object.entries(dna).slice(0, 5).map(([subject, value]) => ({
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      value: Number(value) || 0,
      fullMark: 100,
    }));
  }, [insights]);

  const openComposer = () => {
    setPostError("");
    setCaption("");
    setPostModal(true);
  };

  const postTemplates = {
    top_artist: `🎵 My Top Artist is ${insights?.favoriteArtist?.name || "my current favorite"}.`,
    top_song: `🎶 My current favorite song is ${insights?.favoriteTrack?.name || "on repeat"}.`,
    profile: `My music taste is ${personality}.`,
    mood: `Today's vibe: ${mood}.`,
    genres: `Today's genres: ${genres.slice(0, 3).join(", ")}.`,
    recent: "This song has been living in my head lately.",
    custom: "",
  };

  const publish = async () => {
    if (publishing) return;
    const text = caption.trim() || postTemplates[postType];
    if (!text) return setPostError("Write a caption before sharing.");
    setPublishing(true);
    const body = {
      caption: text,
      type: postType,
      artist: insights?.favoriteArtist,
      song: insights?.favoriteTrack,
      genres,
      musicProfile: personality,
      mood,
    };
    try {
      const r = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok)
        return setPostError(data.message || "Could not share this post.");
      setPosts((current) => [data, ...current]);
      setPostModal(false);
      setView("feed");
      toast.success("Moment shared to feed!", { duration: 2500 });
    } catch {
      setPostError("Connection failed. Please try again.");
      toast.error("Failed to share moment");
    } finally {
      setPublishing(false);
    }
  };

  const updatePost = useCallback((updated) =>
    setPosts((current) =>
      updated?.deleted
        ? current.filter((post) => post._id !== updated._id)
        : updated
          ? current.map((post) => (post._id === updated._id ? updated : post))
          : current,
    ), []);

  const doLogout = () => {
    logout();
    navigate("/", { replace: true });
    toast("Logged out successfully");
  };

  return (
    <div className="app-shell">
      <aside className="side-nav bg-[#09090d]/90 backdrop-blur-xl border-r border-white/10">
        <div className="brand cursor-pointer" onClick={() => setView("home")}>
          <span className="brand-mark bg-[#d8fa61] text-[#0e0c12]">m</span> melody
        </div>
        <div className="nav-group">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "logout") {
                  doLogout();
                } else if (item.id === "notifications") {
                  navigate("/notifications");
                } else if (item.id === "diary") {
                  navigate("/diary");
                } else if (item.id === "community") {
                  navigate("/communities");
                } else {
                  setView(item.id);
                }
              }}
              className={
                view === item.id && item.id !== "logout"
                  ? "nav-item active cursor-pointer"
                  : "nav-item cursor-pointer"
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <main className="dashboard-main aurora-glow-bg">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div key="home" initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
              <header className="dash-header">
                <div>
                  <p className="eyebrow">YOUR SOUND, YOUR PEOPLE</p>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Good evening{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                    .
                  </h1>
                  <p className="subtle">
                    Here’s what your music is saying today.
                  </p>
                </div>
              </header>

              <motion.section variants={itemVariants} className="hero-card hover-elevate overflow-hidden relative border border-white/10 rounded-[24px] bg-[#16131b]">
                <div className="hero-glow" />
                <div className="hero-copy z-10">
                  <span className="pill inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#d8fa61]" /> MUSIC PERSONALITY</span>
                  <h2 className="text-2xl font-bold my-2">{personality}</h2>
                  <p className="text-white/70 text-sm">
                    You’re drawn to music that feels personal, textured, and a little unexpected.
                  </p>
                  <div className="genre-row flex flex-wrap gap-2 mt-4">
                    {genres.slice(0, 4).map((genre) => (
                      <span key={genre} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">{genre}</span>
                    ))}
                  </div>
                </div>
                <div className="orb-wrap">
                  <div className="orb orb-one" />
                  <div className="orb orb-two" />
                  <div className="orb orb-three" />
                  <Music className="w-12 h-12 text-[#d8fa61] z-10 opacity-80" />
                </div>
              </motion.section>

              <motion.section variants={itemVariants} className="stat-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                <article className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <span className="stat-icon pink p-3 rounded-xl bg-pink-500/10 text-pink-400"><Music className="w-5 h-5" /></span>
                  <div>
                    <p className="text-[11px] font-bold text-white/40 uppercase">YOUR CURRENT MOOD</p>
                    <h3 className="text-lg font-bold text-white">{mood}</h3>
                    <small className="text-white/50 text-xs">Based on recent listening</small>
                  </div>
                </article>

                <article className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <span className="stat-icon lime p-3 rounded-xl bg-[#d8fa61]/10 text-[#d8fa61]"><TrendingUp className="w-5 h-5" /></span>
                  <div>
                    <p className="text-[11px] font-bold text-white/40 uppercase">LISTENING STREAK</p>
                    <h3 className="text-lg font-bold text-white">{insights?.listeningDiversity || 24} artists</h3>
                    <small className="text-white/50 text-xs">in your rotation this month</small>
                  </div>
                </article>

                <article className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <span className="stat-icon lavender p-3 rounded-xl bg-purple-500/10 text-purple-400"><Zap className="w-5 h-5" /></span>
                  <div>
                    <p className="text-[11px] font-bold text-white/40 uppercase">TOP MATCH</p>
                    <h3 className="text-lg font-bold text-white">{people[0]?.compatibility?.score ?? 86}% compatible</h3>
                    <small className="text-white/50 text-xs">Someone gets your sound</small>
                  </div>
                </article>
              </motion.section>

              <motion.section variants={itemVariants} className="dna-card glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <p className="eyebrow">YOUR MUSIC DNA</p>
                  <h2 className="text-xl font-bold text-white my-2">How your sound feels</h2>
                  <p className="text-sm text-white/70">
                    {insights?.description ||
                      "Your listening profile is taking shape based on energy, positivity, and acoustic patterns."}
                  </p>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" stroke="#a39ba7" fontSize={11} />
                      <Radar name="Music DNA" dataKey="value" stroke="#d8fa61" fill="#d8fa61" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.section>

              <section className="section-head flex justify-between items-center pt-2">
                <div>
                  <p className="eyebrow">PEOPLE WHO GET IT</p>
                  <h2 className="text-xl font-bold text-white">Your top music matches</h2>
                </div>
                <button
                  onClick={() => setView("matches")}
                  className="text-button text-xs text-[#d8fa61] hover:underline cursor-pointer"
                >
                  See all matches →
                </button>
              </section>

              <motion.div variants={containerVariants} className="match-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(people.length
                  ? people.slice(0, 3)
                  : [
                      {
                        name: "Your next match",
                        personality: "Waiting for listeners",
                        compatibility: { score: 0 },
                      },
                    ]
                ).map((person, i) => (
                  <motion.article variants={itemVariants} className="match-card hover-elevate" key={person._id || i}>
                    <div className="match-top">
                      <Avatar user={person} />
                      <span className="score bg-[#d8fa61]/10 text-[#d8fa61] border border-[#d8fa61]/20">
                        {person.compatibility?.score ?? 0}%
                      </span>
                    </div>
                    <h3>{person.name}</h3>
                    <p>{person.personality}</p>
                    <div className="mini-bar">
                      <i style={{ width: `${person.compatibility?.score ?? 0}%` }} />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      disabled={!person._id || compareLoading === person._id}
                      onClick={() => showCompare(person)}
                      className="cursor-pointer"
                    >
                      {compareLoading === person._id ? <ButtonLoader label="Loading" /> : "View compatibility"}
                    </motion.button>
                  </motion.article>
                ))}
              </motion.div>

              <motion.section variants={itemVariants} className="insight-card glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <span className="pill warm inline-flex items-center gap-1"><Share2 className="w-3 h-3" /> SHARE YOUR SOUND</span>
                  <h2 className="text-lg font-bold text-white my-1">
                    {shared
                      ? "Ready for your feed"
                      : `Your top artist is ${insights?.favoriteArtist?.name || "waiting to be discovered"}.`}
                  </h2>
                  <p className="text-xs text-white/70">
                    Turn this listening moment into a post for the people who get it.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShared(true);
                    openComposer();
                  }}
                  className="px-5 py-2.5 bg-[#d8fa61] text-[#0e0c12] font-semibold text-sm rounded-xl cursor-pointer"
                >
                  {shared ? "Share again" : "Share to feed"}
                </motion.button>
              </motion.section>
            </motion.div>
          )}

          {view === "feed" && (
            <motion.section key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header className="dash-header compact flex justify-between items-center">
                <div>
                  <p className="eyebrow">MUSIC FROM YOUR PEOPLE</p>
                  <h1 className="text-2xl font-bold">The feed</h1>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} className="feed-share cursor-pointer flex items-center gap-1.5" onClick={openComposer}>
                  <Share2 className="w-4 h-4" /> Share a moment
                </motion.button>
              </header>
              <div className="feed-list space-y-4 mt-4">
                {feedLoading ? (
                  <PostSkeleton count={4} />
                ) : posts.length ? (
                  posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      token={token}
                      currentUserId={user?._id}
                      onChange={updatePost}
                    />
                  ))
                ) : (
                  <div className="empty-state p-8 text-center glass-panel rounded-2xl">
                    <Music className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-white">No posts yet.</h2>
                    <p className="text-xs text-white/60 mb-4">Share your music taste and start the conversation.</p>
                    <button onClick={openComposer} className="px-4 py-2 bg-[#d8fa61] text-[#0e0c12] rounded-xl font-semibold text-xs cursor-pointer">Create your first post</button>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {view === "discover" && (
            <motion.section key="discover" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header className="dash-header compact">
                <div>
                  <p className="eyebrow">FIND YOUR PEOPLE</p>
                  <h1 className="text-2xl font-bold">Discover listeners</h1>
                </div>
              </header>
              <div className="search relative my-4">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && explore()}
                  placeholder="Try “Clairo”, “indie”, or “80% compatible”"
                  className="pl-10"
                />
                <button onClick={() => explore()} className="cursor-pointer">Search</button>
              </div>
              <div className="people-list space-y-3">
                {people.map((person) => (
                  <motion.article whileHover={{ x: 2 }} key={person._id} className="person-row glass-panel p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar user={person} />
                      <div>
                        <h3 className="font-semibold text-white text-sm">{person.name}</h3>
                        <p className="text-xs text-white/60">
                          {person.favoriteArtist} · {person.personality}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <b className="text-[#d8fa61] text-sm">{person.compatibility.score}%</b>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => showCompare(person)} disabled={compareLoading === person._id} className="cursor-pointer text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white">
                        {compareLoading === person._id ? <ButtonLoader label="Loading" /> : "Compare"}
                      </motion.button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}

          {view === "matches" && (
            <motion.section key="matches" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header className="dash-header compact">
                <p className="eyebrow">COMPATIBILITY LEADERBOARD</p>
                <h1 className="text-2xl font-bold">Your music matches</h1>
                <p className="subtle">
                  Complete taste overlap, not just one favorite artist.
                </p>
              </header>
              <div className="people-list space-y-3 mt-4">
                {people.map((person, index) => (
                  <motion.article whileHover={{ x: 2 }} key={person._id} className="person-row glass-panel p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <em className="text-white/40 font-bold text-sm">0{index + 1}</em>
                      <Avatar user={person} />
                      <div>
                        <h3 className="font-semibold text-white text-sm">{person.name}</h3>
                        <p className="text-xs text-white/60">
                          {person.compatibility.sharedArtists
                            ?.slice(0, 2)
                            .join(" · ") || person.personality}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <b className="text-[#d8fa61] text-sm">{person.compatibility.score}%</b>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => showCompare(person)} disabled={compareLoading === person._id} className="cursor-pointer text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white">
                        {compareLoading === person._id ? <ButtonLoader label="Loading" /> : "View match"}
                      </motion.button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}

          {view === "community" && (
            <section className="community">
              <p className="eyebrow">LISTEN TOGETHER</p>
              <h1 className="text-2xl font-bold mb-4">Communities for every sound.</h1>
              <div className="community-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Dreamy indie",
                  "Late night lo-fi",
                  "Alternative archives",
                  "Pop after dark",
                ].map((community, i) => (
                  <motion.article whileHover={{ y: -2 }} key={community} className="glass-panel p-5 rounded-2xl space-y-2 cursor-pointer">
                    <span className="text-2xl text-[#d8fa61]">{["☾", "◒", "✳", "♬"][i]}</span>
                    <h2 className="text-lg font-bold text-white">{community}</h2>
                    <p className="text-xs text-white/60">{["2.4k", "8.1k", "1.7k", "5.2k"][i]} listeners</p>
                    <button onClick={() => navigate("/communities")} className="px-4 py-1.5 bg-white/10 text-white rounded-xl text-xs cursor-pointer">Explore communities</button>
                  </motion.article>
                ))}
              </div>
            </section>
          )}

          {view === "library" && (
            <section className="legacy space-y-4">
              <div className="legacy-tabs flex flex-wrap gap-2">
                <button onClick={() => setView("profile")} className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 text-xs">Profile</button>
                <button onClick={() => setView("users")} className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 text-xs">People</button>
                <button onClick={() => setView("taste")} className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 text-xs">Music taste</button>
                <button onClick={() => setView("recent")} className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 text-xs">Recently played</button>
                <button onClick={() => setView("test")} className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 text-xs">Spotify tools</button>
              </div>
              <p className="text-xs text-white/60">Select a section above to access your Spotify tools and listening data.</p>
            </section>
          )}
        </AnimatePresence>

        <Suspense fallback={<PageSkeleton />}>
          {view === "profile" && <MyProfile />}
          {view === "users" && <OtherUsers />}
          {view === "taste" && <MyMusicTaste />}
          {view === "recent" && <RecentlyPlayed />}
          {view === "test" && <AdvancedTest />}
        </Suspense>
      </main>

      <AnimatePresence>
        {compare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setCompare(null)}
          >
            <motion.article
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="compare-modal glass-panel p-6 rounded-3xl max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer" onClick={() => setCompare(null)}>
                <X className="w-5 h-5" />
              </button>
              <Avatar user={compare.user} />
              <p className="eyebrow mt-2">MUSIC COMPATIBILITY</p>
              <h2 className="text-xl font-bold text-white">
                {compare.user.name} <b className="text-[#d8fa61]">{compare.score}%</b>
              </h2>
              <p className="text-xs text-white/70 my-2">{compare.reason}</p>
              <div className="breakdown space-y-2 my-4">
                {Object.entries(compare.breakdown || {}).map(([label, value]) => (
                  <div key={label}>
                    <span className="text-xs flex justify-between text-white/80">
                      <span>{label.replace(/([A-Z])/g, " $1")}</span>
                      <b>{value}%</b>
                    </span>
                    <i className="block h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                      <em className="block h-full bg-[#d8fa61]" style={{ width: `${value}%` }} />
                    </i>
                  </div>
                ))}
              </div>
              <div className="compare-tags flex flex-wrap gap-2 text-xs text-white/70">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  🎵 {compare.sharedArtists?.slice(0, 3).join(", ") || "New artists"}
                </span>
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  ✦ {compare.sharedGenres?.slice(0, 2).join(", ") || "Different genres"}
                </span>
              </div>
            </motion.article>
          </motion.div>
        )}

        {postModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setPostModal(false)}
          >
            <motion.article
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="composer glass-panel p-6 rounded-3xl max-w-lg w-full relative space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer" onClick={() => setPostModal(false)}>
                <X className="w-5 h-5" />
              </button>
              <p className="eyebrow">SHARE YOUR SOUND</p>
              <h2 className="text-xl font-bold text-white">Create a music moment</h2>
              <div className="post-types flex flex-wrap gap-1.5">
                {Object.entries({
                  top_artist: "Top artist",
                  top_song: "Top song",
                  profile: "Music profile",
                  mood: "Mood",
                  genres: "Top genres",
                  recent: "Recently played",
                  custom: "Custom",
                }).map(([id, label]) => (
                  <button
                    className={postType === id ? "selected cursor-pointer px-3 py-1 text-xs rounded-xl bg-[#d8fa61] text-[#0e0c12] font-semibold" : "cursor-pointer px-3 py-1 text-xs rounded-xl bg-white/10 text-white"}
                    onClick={() => setPostType(id)}
                    key={id}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={postTemplates[postType]}
                disabled={publishing}
                className="w-full bg-[#0e0c12] border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#d8fa61]"
              />
              <div className="card-preview p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <Music className="w-4 h-4 text-[#d8fa61] inline-block mr-2" />
                <p className="text-white/80 inline">{caption || postTemplates[postType]}</p>
                <small className="block text-white/40 mt-1">{user?.name || "You"} · VibeMatch</small>
              </div>
              {postError && <p className="form-error text-xs text-red-400">{postError}</p>}
              <button className="publish w-full py-2.5 bg-[#d8fa61] text-[#0e0c12] rounded-xl font-bold text-sm cursor-pointer" onClick={publish} disabled={publishing}>
                {publishing ? <ButtonLoader label="Sharing" /> : "Share to feed"}
              </button>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
