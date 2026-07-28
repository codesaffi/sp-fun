import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = `${import.meta.env.VITE_API_URL}/api`;
const tabs = ["song", "album", "artist"];
export default function Diary() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState("song");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const search = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/diary/search?q=${encodeURIComponent(query)}&type=${type}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Spotify search is unavailable.");
      setResults(data);
    } catch (err) {
      console.error("Diary Spotify search failed:", err);
      setResults([]);
      setError(err.message || "Spotify search is unavailable.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="dashboard-main diary-page">
      <header className="dash-header compact">
        <p className="eyebrow">MUSIC DIARY</p>
        <h1>Remember every listen.</h1>
        <p className="subtle">
          Search Spotify metadata and make it part of your story.
        </p>
      </header>
      <form className="search" onSubmit={search}>
        <span>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, albums, or artists"
        />
        <button>Search</button>
      </form>
      <div className="profile-tabs diary-tabs">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => {
              setType(item);
              setResults([]);
              setError("");
            }}
            className={type === item ? "active" : ""}
          >
            {item === "song"
              ? "Songs"
              : `${item[0].toUpperCase()}${item.slice(1)}s`}
          </button>
        ))}
      </div>
      <div className="music-grid diary-results">
        {results.map((item) => (
          <article key={item.spotifyId}>
            <div className="artwork">
              {item.image ? <img src={item.image} alt="" /> : <span>♫</span>}
            </div>
            <h3>{item.title}</h3>
            {item.type !== "artist" && <p>{item.artist}</p>}
            {item.album && <small>{item.album}</small>}
            {item.type === "artist" && item.genres?.length > 0 && (
              <small>{item.genres.join(", ")}</small>
            )}
            {item.type === "artist" && item.followers !== undefined && (
              <small>{item.followers.toLocaleString()} followers</small>
            )}
            {item.type !== "artist" && item.releaseDate && (
              <small>{item.releaseDate.slice(0, 4)}</small>
            )}
            <button onClick={() => navigate(`/${item.type}/${item.spotifyId}`)}>
              Add to Diary
            </button>
          </article>
        ))}
      </div>
      {loading && <p className="subtle">Searching Spotify...</p>}
      {error && <p className="text-[#ff8c8c]">{error}</p>}
      {!loading && !error && query && !results.length && (
        <div className="empty-state">
          <span>♫</span>
          <p>No results found.</p>
        </div>
      )}
    </main>
  );
}
