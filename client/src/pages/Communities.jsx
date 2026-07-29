import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiSearch, FiPlus, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import { CommunitySkeleton, PostSkeleton, ButtonLoader } from "../components/Loading";
import { useDebounce } from "../hooks/useDebounce";

const API = `${import.meta.env.VITE_API_URL}/api`;

const CommunityCard = ({ community, onJoin, joiningSlug }) => (
  <article className="match-card cursor-pointer">
    <div className="match-top">
      <span className="avatar">{community.icon || "♫"}</span>
      <span className="score">{community.memberCount}</span>
    </div>
    <h3>{community.name}</h3>
    <p>{community.description}</p>
    <small>{community.memberCount} members · {community.genre || "Music"}</small>
    <Link className="text-button" to={`/communities/${community.slug}`}>Open community →</Link>
    {!community.membership && community.privacy === "public" && (
      <button
        onClick={() => onJoin(community.slug)}
        disabled={joiningSlug === community.slug}
        className="cursor-pointer"
      >
        {joiningSlug === community.slug ? <ButtonLoader label="Joining" /> : "Join"}
      </button>
    )}
  </article>
);

export default function Communities() {
  const { slug } = useParams();
  return slug ? <CommunityDetail slug={slug} /> : <DiscoverCommunities />;
}

function DiscoverCommunities() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joiningSlug, setJoiningSlug] = useState("");
  const [form, setForm] = useState({ name: "", description: "", icon: "♫", genre: "", tags: "", privacy: "public", coverImage: "" });

  const debouncedQuery = useDebounce(query.trim(), 350);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/communities?q=${encodeURIComponent(q)}`, { headers });
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(debouncedQuery);
  }, [token, debouncedQuery]);

  const join = async (communitySlug) => {
    if (joiningSlug) return;
    setJoiningSlug(communitySlug);
    try {
      const r = await fetch(`${API}/communities/${communitySlug}/join`, { method: "POST", headers });
      if (r.ok) load(query);
    } finally {
      setJoiningSlug("");
    }
  };

  const create = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/communities`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }),
      });
      if (r.ok) navigate(`/communities/${(await r.json()).slug}`);
    } finally {
      setSubmitting(false);
    }
  };

  const section = (title, values = []) => values.length > 0 && (
    <section>
      <div className="section-head">
        <div>
          <p className="eyebrow">COMMUNITIES</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="match-grid">
        {values.map((community) => (
          <CommunityCard key={community._id} community={community} onJoin={join} joiningSlug={joiningSlug} />
        ))}
      </div>
    </section>
  );

  return (
    <main className="dashboard-main">
      <header className="dash-header compact">
        <p className="eyebrow">LISTEN TOGETHER</p>
        <h1>Discover Communities</h1>
        <button className="feed-share inline-flex items-center gap-1.5 cursor-pointer" onClick={() => setCreating(true)}>
          <FiPlus /> Create community
        </button>
      </header>
      <div className="search">
        <FiSearch className="text-white/40 text-lg ml-3" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by community, genre, or artist"
        />
        <button onClick={() => load(query)} disabled={loading} className="cursor-pointer">
          {loading ? <ButtonLoader label="Searching" /> : "Search"}
        </button>
      </div>
      {loading && !data ? (
        <CommunitySkeleton count={6} />
      ) : data ? (
        <>
          {section("Suggested for your sound", data.suggested)}
          {section("Trending Communities", data.trending)}
          {section("Newest Communities", data.newest)}
          {section("Official Communities", data.official)}
          {section("User Communities", data.user)}
        </>
      ) : null}
      {creating && (
        <div className="modal-backdrop">
          <form className="profile-edit" onSubmit={create}>
            <button type="button" className="close cursor-pointer" onClick={() => setCreating(false)}>×</button>
            <p className="eyebrow">NEW COMMUNITY</p>
            <h2>Create your listening space</h2>
            <input required placeholder="Community name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={submitting} />
            <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={submitting} />
            <input placeholder="Icon or icon image URL" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} disabled={submitting} />
            <input placeholder="Cover image URL (optional)" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} disabled={submitting} />
            <input placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} disabled={submitting} />
            <input placeholder="Tags, separated by commas" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} disabled={submitting} />
            <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })} disabled={submitting}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <button disabled={submitting} className="cursor-pointer">
              {submitting ? <ButtonLoader label="Creating" /> : "Create community"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function CommunityDetail({ slug }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState("Posts");
  const [caption, setCaption] = useState("");
  const [musicQuery, setMusicQuery] = useState("");
  const [musicType, setMusicType] = useState("song");
  const [music, setMusic] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [rule, setRule] = useState({ title: "", description: "" });
  const [details, setDetails] = useState(null);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [joining, setJoining] = useState(false);

  const load = async () => {
    const [detail, feed, memberList] = await Promise.all([
      fetch(`${API}/communities/${slug}`, { headers }),
      fetch(`${API}/communities/${slug}/posts`, { headers }),
      fetch(`${API}/communities/${slug}/members`, { headers }),
    ]);
    if (detail.ok) setCommunity(await detail.json());
    else if (detail.status === 404) navigate("/communities");
    if (feed.ok) setPosts(await feed.json());
    if (memberList.ok) setMembers(await memberList.json());
  };

  useEffect(() => {
    if (token) Promise.resolve().then(load);
  }, [slug, token]);

  const join = async () => {
    if (joining) return;
    setJoining(true);
    try {
      const r = await fetch(`${API}/communities/${slug}/join`, { method: "POST", headers });
      if (r.ok) setCommunity(await r.json());
    } finally {
      setJoining(false);
    }
  };

  const leave = async () => {
    const r = await fetch(`${API}/communities/${slug}/members/me`, { method: "DELETE", headers });
    if (r.ok) navigate("/communities");
  };

  const searchMusic = async () => {
    const r = await fetch(`${API}/diary/search?q=${encodeURIComponent(musicQuery)}&type=${musicType}`, { headers });
    if (r.ok) setMusic(await r.json());
  };

  const publish = async () => {
    if (!caption.trim() || submittingPost) return;
    setSubmittingPost(true);
    try {
      const body = {
        caption,
        type: "custom",
        community: slug,
        [attachment?.type === "album" ? "album" : attachment?.type === "song" ? "song" : "artist"]: attachment
          ? { name: attachment.title, image: attachment.image, artist: attachment.artist }
          : undefined,
      };
      const r = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        const post = await r.json();
        setPosts((current) => [post, ...current]);
        setCaption("");
        setAttachment(null);
        setMusic([]);
      }
    } finally {
      setSubmittingPost(false);
    }
  };

  const addRule = async (event) => {
    event.preventDefault();
    const r = await fetch(`${API}/communities/${slug}/rules`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    if (r.ok) {
      setCommunity(await r.json());
      setRule({ title: "", description: "" });
    }
  };

  const saveDetails = async (event) => {
    event.preventDefault();
    const r = await fetch(`${API}/communities/${slug}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    if (r.ok) {
      const updated = await r.json();
      setCommunity((current) => ({ ...current, ...updated }));
      setDetails(null);
    }
  };

  const removeMember = async (userId) => {
    const r = await fetch(`${API}/communities/${slug}/members/${userId}`, { method: "DELETE", headers });
    if (r.ok) setMembers((current) => current.filter((member) => member.user?._id !== userId));
  };

  const changePost = (updated) =>
    setPosts((current) =>
      updated?.deleted ? current.filter((post) => post._id !== updated._id) : current.map((post) => (post._id === updated._id ? updated : post)),
    );

  if (!community) {
    return (
      <main className="dashboard-main">
        <CommunitySkeleton count={1} />
      </main>
    );
  }

  const isAdmin = community.membership?.role === "admin";

  return (
    <main className="dashboard-main">
      <button className="text-button inline-flex items-center gap-1.5 cursor-pointer" onClick={() => navigate("/communities")}>
        <FiArrowLeft /> Communities
      </button>
      <section className="glass-section">
        <div className="diary-detail-head">
          {community.coverImage ? (
            <img src={community.coverImage} alt="" />
          ) : (
            <span className="profile-avatar large">{community.icon || "♫"}</span>
          )}
          <div>
            <p className="eyebrow">{community.official ? "OFFICIAL COMMUNITY" : community.privacy.toUpperCase()}</p>
            <h1>{community.name}</h1>
            <p>{community.description}</p>
            <small>{community.memberCount} members · Created {new Date(community.createdAt).toLocaleDateString()}</small>
            <p className="subtle">Admin: {community.admin?.name || "Community team"}</p>
            {community.membership ? (
              <button onClick={leave} disabled={isAdmin} className="cursor-pointer">Leave</button>
            ) : (
              <button onClick={join} disabled={community.privacy === "private" || joining} className="cursor-pointer">
                {joining ? <ButtonLoader label="Joining" /> : community.privacy === "private" ? "Private community" : "Join community"}
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="profile-tabs">
        {["Posts", "Members", "About"].map((item) => (
          <button
            key={item}
            className={tab === item ? "active cursor-pointer" : "cursor-pointer"}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Posts" && (
        <section>
          <div className="post-editor">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={community.membership ? "Share a music moment..." : "Join to post"}
              disabled={!community.membership || submittingPost}
            />
            {attachment && (
              <p className="subtle">
                Attached: {attachment.title}{" "}
                <button onClick={() => setAttachment(null)} className="cursor-pointer text-red-400">Remove</button>
              </p>
            )}
            <div className="search">
              <input
                value={musicQuery}
                onChange={(e) => setMusicQuery(e.target.value)}
                placeholder="Attach a song, album, or artist"
              />
              <select value={musicType} onChange={(e) => setMusicType(e.target.value)}>
                <option value="song">Song</option>
                <option value="album">Album</option>
                <option value="artist">Artist</option>
              </select>
              <button onClick={searchMusic} disabled={!community.membership} className="cursor-pointer">Search Spotify</button>
            </div>
            {music.map((item) => (
              <button
                className="text-button cursor-pointer"
                key={item.spotifyId}
                onClick={() => { setAttachment(item); setMusic([]); }}
              >
                {item.title} · {item.artist}
              </button>
            ))}
            <button onClick={publish} disabled={!community.membership || submittingPost} className="cursor-pointer">
              {submittingPost ? <ButtonLoader label="Posting" /> : "Post to community"}
            </button>
          </div>
          <div className="feed-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                token={token}
                currentUserId={community.membership?.user}
                onChange={changePost}
                manage
                canModerate={isAdmin}
              />
            ))}
          </div>
        </section>
      )}
      {tab === "Members" && (
        <section className="people-list">
          {members.map((member) => (
            <article className="person-row" key={member._id}>
              <span className="avatar">
                {member.user?.avatar ? <img src={member.user.avatar} alt="" /> : member.user?.name?.slice(0, 1)}
              </span>
              <div>
                <h3>{member.user?.name}</h3>
                <p>{member.role}</p>
              </div>
              {isAdmin && member.role !== "admin" && (
                <button onClick={() => removeMember(member.user?._id)} className="cursor-pointer text-red-400">Remove</button>
              )}
            </article>
          ))}
        </section>
      )}
      {tab === "About" && (
        <section className="glass-section">
          <p className="eyebrow">COMMUNITY RULES</p>
          {community.rules?.length ? (
            community.rules.map((item) => (
              <p key={item.title}><b>{item.title}</b> · {item.description}</p>
            ))
          ) : (
            <p className="subtle">No rules have been added yet.</p>
          )}
          {isAdmin && (
            <>
              <button
                className="text-button cursor-pointer"
                onClick={() => setDetails({
                  description: community.description,
                  coverImage: community.coverImage,
                  icon: community.icon,
                  genre: community.genre,
                  privacy: community.privacy,
                  tags: community.tags,
                })}
              >
                Edit community
              </button>
              {details && (
                <form className="post-editor" onSubmit={saveDetails}>
                  <textarea value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} />
                  <input placeholder="Cover image URL" value={details.coverImage} onChange={(e) => setDetails({ ...details, coverImage: e.target.value })} />
                  <input placeholder="Icon" value={details.icon} onChange={(e) => setDetails({ ...details, icon: e.target.value })} />
                  <input placeholder="Genre" value={details.genre} onChange={(e) => setDetails({ ...details, genre: e.target.value })} />
                  <select value={details.privacy} onChange={(e) => setDetails({ ...details, privacy: e.target.value })}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <button className="cursor-pointer">Save details</button>
                </form>
              )}
              <form className="post-editor" onSubmit={addRule}>
                <input required placeholder="Rule title" value={rule.title} onChange={(e) => setRule({ ...rule, title: e.target.value })} />
                <input required placeholder="Rule description" value={rule.description} onChange={(e) => setRule({ ...rule, description: e.target.value })} />
                <button className="cursor-pointer">Add rule</button>
              </form>
            </>
          )}
        </section>
      )}
    </main>
  );
}
