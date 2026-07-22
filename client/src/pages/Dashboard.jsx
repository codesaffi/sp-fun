import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MyProfile from "./MyProfile";
import OtherUsers from "./OtherUsers";
import MyMusicTaste from "./MyMusicTaste";
import RecentlyPlayed from "./RecentlyPlayed";
import AdvancedTest from "./AdvancedTest";
import React from "react";
import {
  FiHome,
  FiSearch,
  FiUsers,
  FiMusic,
  FiGrid,
  FiLogOut,
} from "react-icons/fi";

import { MdDynamicFeed } from "react-icons/md";

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
  const [postModal, setPostModal] = useState(false);
  const [postType, setPostType] = useState("top_artist");
  const [caption, setCaption] = useState("");
  const [postError, setPostError] = useState("");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${api}/insights`, { headers }).then((r) => r.ok && r.json()),
      fetch(`${api}/leaderboard`, { headers }).then((r) => r.ok && r.json()),
    ])
      .then(([me, board]) => {
        setInsights(me || null);
        setPeople(board || []);
      })
      .catch(() => {});
  }, [token, headers]);
  const loadPosts = async () => {
    try {
      const r = await fetch(`${API_URL}/api/posts`, { headers });
      if (r.ok) setPosts(await r.json());
    } catch {}
  };
  useEffect(() => {
    if (token) loadPosts();
  }, [token]);

  const explore = async (value = query) => {
    const response = await fetch(
      `${api}/discover?q=${encodeURIComponent(value)}`,
      { headers },
    );
    if (response.ok) setPeople(await response.json());
  };
  const showCompare = async (person) => {
    const response = await fetch(`${api}/compare/${person._id}`, { headers });
    if (response.ok) setCompare(await response.json());
  };
const nav = [
  { id: "home", label: "Home", icon: <FiHome /> },
  { id: "feed", label: "Feed", icon: <MdDynamicFeed /> },
  { id: "discover", label: "Search", icon: <FiSearch /> },
  { id: "matches", label: "Matches", icon: <FiUsers /> },
  { id: "library", label: "Library", icon: <FiMusic /> },
  { id: "community", label: "Community", icon: <FiGrid /> },
  { id: "logout", label: "Logout", icon: <FiLogOut /> },
];
  const user = insights?.user;
  const demo = !insights;
  const genres = insights?.topGenres?.length
    ? insights.topGenres
    : ["indie pop", "dream pop", "alternative", "bedroom pop"];
  const personality = insights?.personality || "Sound Explorer";
  const mood = insights?.mood || "Curious";
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
    const text = caption.trim() || postTemplates[postType];
    if (!text) return setPostError("Write a caption before sharing.");
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
    } catch {
      setPostError("Connection failed. Please try again.");
    }
  };
  const toggleLike = async (id) => {
    const r = await fetch(`${API_URL}/api/posts/${id}/like`, {
      method: "POST",
      headers,
    });
    if (r.ok) {
      const data = await r.json();
      setPosts((current) =>
        current.map((post) =>
          post._id === id
            ? {
                ...post,
                likes: Array(data.likes).fill("liked"),
                liked: data.liked,
              }
            : post,
        ),
      );
    }
  };
  const doLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="brand">
          <span className="brand-mark">m</span> melody
        </div>
<div className="nav-group">
  {nav.map((item) => (
    <button
      key={item.id}
      onClick={() => {
        if (item.id === "logout") {
          doLogout();
        } else {
          setView(item.id);
        }
      }}
      className={
        view === item.id && item.id !== "logout"
          ? "nav-item active"
          : "nav-item"
      }
    >
      <span>{item.icon}</span>
      {item.label}
    </button>
  ))}
</div>
        {/* <div className="side-bottom">
          <button className="nav-item" onClick={doLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>{" "}
          <div className="profile-chip">
            <Avatar user={user} size="sm" />
            <span>{user?.name || "Your profile"}</span>
            <b>⌄</b>
          </div>
        </div> */}
      </aside>
      <main className="dashboard-main">
        {view === "home" && (
          <>
            <header className="dash-header">
              <div>
                <p className="eyebrow">YOUR SOUND, YOUR PEOPLE</p>
                <h1>
                  Good evening{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                  .
                </h1>
                <p className="subtle">
                  Here’s what your music is saying today.
                </p>
              </div>
              <button className="bell">♧</button>
            </header>
            <section className="hero-card">
              <div className="hero-glow" />
              <div className="hero-copy">
                <span className="pill">MUSIC PERSONALITY</span>
                <h2>{personality}</h2>
                <p>
                  You’re drawn to music that feels personal, textured, and a
                  little unexpected.
                </p>
                <div className="genre-row">
                  {genres.slice(0, 4).map((genre) => (
                    <span key={genre}>{genre}</span>
                  ))}
                </div>
              </div>
              <div className="orb-wrap">
                <div className="orb orb-one" />
                <div className="orb orb-two" />
                <div className="orb orb-three" />
                <span>♫</span>
              </div>
            </section>
            <section className="stat-grid">
              <article>
                <span className="stat-icon pink">◌</span>
                <div>
                  <p>YOUR CURRENT MOOD</p>
                  <h3>{mood}</h3>
                  <small>Based on your recent listening</small>
                </div>
              </article>
              <article>
                <span className="stat-icon lime">↗</span>
                <div>
                  <p>LISTENING STREAK</p>
                  <h3>{insights?.listeningDiversity || 24} artists</h3>
                  <small>in your rotation this month</small>
                </div>
              </article>
              <article>
                <span className="stat-icon lavender">✦</span>
                <div>
                  <p>TOP MATCH</p>
                  <h3>{people[0]?.compatibility?.score ?? 86}% compatible</h3>
                  <small>Someone gets your sound</small>
                </div>
              </article>
            </section>
            <section className="dna-card">
              <div>
                <p className="eyebrow">YOUR MUSIC DNA</p>
                <h2>How your sound feels</h2>
                <p>
                  {insights?.description ||
                    "Your listening profile is taking shape."}
                </p>
              </div>
              <div className="dna-bars">
                {Object.entries(
                  insights?.musicDna || {
                    energy: 52,
                    danceability: 50,
                    positivity: 51,
                    acousticness: 34,
                  },
                )
                  .slice(0, 4)
                  .map(([name, value]) => (
                    <div key={name}>
                      <span>
                        {name}
                        <b>{value}%</b>
                      </span>
                      <i>
                        <em style={{ width: `${value}%` }} />
                      </i>
                    </div>
                  ))}
              </div>
            </section>
            <section className="section-head">
              <div>
                <p className="eyebrow">PEOPLE WHO GET IT</p>
                <h2>Your top music matches</h2>
              </div>
              <button
                onClick={() => setView("matches")}
                className="text-button"
              >
                See all matches →
              </button>
            </section>
            <div className="match-grid">
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
                <article className="match-card" key={person._id || i}>
                  <div className="match-top">
                    <Avatar user={person} />
                    <span className="score">
                      {person.compatibility?.score ?? 0}%
                    </span>
                  </div>
                  <h3>{person.name}</h3>
                  <p>{person.personality}</p>
                  <div className="mini-bar">
                    <i
                      style={{ width: `${person.compatibility?.score ?? 0}%` }}
                    />
                  </div>
                  <button
                    disabled={!person._id}
                    onClick={() => showCompare(person)}
                  >
                    View compatibility
                  </button>
                </article>
              ))}
            </div>
            <section className="insight-card">
              <div>
                <span className="pill warm">SHARE YOUR SOUND</span>
                <h2>
                  {shared
                    ? "Ready for your feed"
                    : `Your top artist is ${insights?.favoriteArtist?.name || "waiting to be discovered"}.`}
                </h2>
                <p>
                  Turn this listening moment into a post for the people who get
                  it.
                </p>
              </div>
              <button
                onClick={() => {
                  setShared(true);
                  openComposer();
                }}
              >
                {shared ? "Share again" : "Share to feed"}
              </button>
            </section>
          </>
        )}
        {view === "feed" && (
          <section>
            <header className="dash-header compact">
              <p className="eyebrow">MUSIC FROM YOUR PEOPLE</p>
              <h1>The feed</h1>
              <button className="feed-share" onClick={openComposer}>
                + Share a moment
              </button>
            </header>
            <div className="feed-list">
              {posts.length ? (
                posts.map((post) => (
                  <article key={post._id} className="feed-post">
                    <div className="post-byline">
                      <Avatar user={post.user} size="sm" />
                      <div>
                        <b>{post.user?.name || "Listener"}</b>
                        <small>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <div className="post-art">
                      <span>♫</span>
                      <p>{post.type?.replace("_", " ")}</p>
                    </div>
                    <h2>{post.caption}</h2>
                    <div className="post-meta">
                      {post.artist?.name && <span>{post.artist.name}</span>}
                      {post.mood && <span>{post.mood}</span>}
                    </div>
                    <div className="post-actions">
                      <button onClick={() => toggleLike(post._id)}>
                        ♡ {post.likes?.length || 0}
                      </button>
                      <button>◌ {post.comments?.length || 0} comments</button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>♫</span>
                  <h2>No posts yet.</h2>
                  <p>Share your music taste and start the conversation.</p>
                  <button onClick={openComposer}>Create your first post</button>
                </div>
              )}
            </div>
          </section>
        )}
        {view === "discover" && (
          <section>
            <header className="dash-header compact">
              <div>
                <p className="eyebrow">FIND YOUR PEOPLE</p>
                <h1>Discover listeners</h1>
              </div>
            </header>
            <div className="search">
              <span>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && explore()}
                placeholder="Try “Clairo”, “indie”, or “80% compatible”"
              />
              <button onClick={() => explore()}>Search</button>
            </div>
            <div className="people-list">
              {people.map((person) => (
                <article key={person._id} className="person-row">
                  <Avatar user={person} />
                  <div>
                    <h3>{person.name}</h3>
                    <p>
                      {person.favoriteArtist} · {person.personality}
                    </p>
                  </div>
                  <b>{person.compatibility.score}%</b>
                  <button onClick={() => showCompare(person)}>Compare</button>
                </article>
              ))}
            </div>
          </section>
        )}
        {view === "matches" && (
          <section>
            <header className="dash-header compact">
              <p className="eyebrow">COMPATIBILITY LEADERBOARD</p>
              <h1>Your music matches</h1>
              <p className="subtle">
                Complete taste overlap, not just one favorite artist.
              </p>
            </header>
            <div className="people-list">
              {people.map((person, index) => (
                <article key={person._id} className="person-row">
                  <em>0{index + 1}</em>
                  <Avatar user={person} />
                  <div>
                    <h3>{person.name}</h3>
                    <p>
                      {person.compatibility.sharedArtists
                        ?.slice(0, 2)
                        .join(" · ") || person.personality}
                    </p>
                  </div>
                  <b>{person.compatibility.score}%</b>
                  <button onClick={() => showCompare(person)}>
                    View match
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        {view === "community" && (
          <section className="community">
            <p className="eyebrow">LISTEN TOGETHER</p>
            <h1>Communities for every sound.</h1>
            <div className="community-grid">
              {[
                "Dreamy indie",
                "Late night lo-fi",
                "Alternative archives",
                "Pop after dark",
              ].map((community, i) => (
                <article key={community}>
                  <span>{["☾", "◒", "✳", "♬"][i]}</span>
                  <h2>{community}</h2>
                  <p>{["2.4k", "8.1k", "1.7k", "5.2k"][i]} listeners</p>
                  <button>Join community</button>
                </article>
              ))}
            </div>
          </section>
        )}
        {view === "library" && (
          <section className="legacy">
            <div className="legacy-tabs">
              <button onClick={() => setView("profile")}>Profile</button>
              <button onClick={() => setView("users")}>People</button>
              <button onClick={() => setView("taste")}>Music taste</button>
              <button onClick={() => setView("recent")}>Recently played</button>
              <button onClick={() => setView("test")}>Spotify tools</button>
            </div>
            <p>Select a section above to access your existing Spotify data.</p>
          </section>
        )}
        {view === "profile" && <MyProfile />}
        {view === "users" && <OtherUsers />}
        {view === "taste" && <MyMusicTaste />}
        {view === "recent" && <RecentlyPlayed />}
        {view === "test" && <AdvancedTest />}
      </main>
      {compare && (
        <div className="modal-backdrop" onClick={() => setCompare(null)}>
          <article
            className="compare-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setCompare(null)}>
              ×
            </button>
            <Avatar user={compare.user} />
            <p className="eyebrow">MUSIC COMPATIBILITY</p>
            <h2>
              {compare.user.name} <b>{compare.score}%</b>
            </h2>
            <p>{compare.reason}</p>
            <div className="breakdown">
              {Object.entries(compare.breakdown || {}).map(([label, value]) => (
                <div key={label}>
                  <span>
                    {label.replace(/([A-Z])/g, " $1")} <b>{value}%</b>
                  </span>
                  <i>
                    <em style={{ width: `${value}%` }} />
                  </i>
                </div>
              ))}
            </div>
            <div className="compare-tags">
              <span>
                ♫{" "}
                {compare.sharedArtists?.slice(0, 3).join(", ") || "New artists"}
              </span>
              <span>
                ✦{" "}
                {compare.sharedGenres?.slice(0, 2).join(", ") ||
                  "Different genres"}
              </span>
            </div>
          </article>
        </div>
      )}
      {postModal && (
        <div className="modal-backdrop" onClick={() => setPostModal(false)}>
          <article className="composer" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPostModal(false)}>
              ×
            </button>
            <p className="eyebrow">SHARE YOUR SOUND</p>
            <h2>Create a music moment</h2>
            <div className="post-types">
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
                  className={postType === id ? "selected" : ""}
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
            />
            <div className="card-preview">
              <span>♫</span>
              <p>{caption || postTemplates[postType]}</p>
              <small>{user?.name || "You"} · VibeMatch</small>
            </div>
            {postError && <p className="form-error">{postError}</p>}
            <button className="publish" onClick={publish}>
              Share to feed
            </button>
          </article>
        </div>
      )}
    </div>
  );
}
