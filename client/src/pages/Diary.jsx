import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMusic } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { SearchSkeleton, ButtonLoader } from "../components/Loading";
import { useDebounce } from "../hooks/useDebounce";

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
  const debouncedQuery = useDebounce(query.trim(), 350);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      setError("");
      return undefined;
    }
    const controller = new AbortController();
    const searchSpotify = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API}/diary/search?q=${encodeURIComponent(debouncedQuery)}&type=${type}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Spotify search is unavailable.");
        setResults(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        setResults([]);
        setError(err.message || "Spotify search is unavailable.");
      } finally {
        setLoading(false);
      }
    };
    searchSpotify();
    return () => controller.abort();
  }, [debouncedQuery, token, type]);

  const search = (event) => {
    event.preventDefault();
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
        <FiSearch className="text-white/40 text-lg ml-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, albums, or artists"
        />
        <button disabled={loading || !query.trim()} className="cursor-pointer">
          {loading ? <ButtonLoader label="Searching" /> : "Search"}
        </button>
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
            className={type === item ? "active cursor-pointer" : "cursor-pointer"}
          >
            {item === "song"
              ? "Songs"
              : `${item[0].toUpperCase()}${item.slice(1)}s`}
          </button>
        ))}
      </div>
      {loading ? (
        <SearchSkeleton count={6} />
      ) : (
        <div className="music-grid diary-results">
          {results.map((item) => (
            <article key={item.spotifyId} className="diary-card cursor-pointer">
              <div className="artwork">
                {item.image ? <img src={item.image} alt="" /> : <FiMusic className="text-[#d8fa61] text-3xl" />}
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
              <button
                onClick={() => navigate(`/${item.type}/${item.spotifyId}`)}
                className="cursor-pointer"
              >
                Add to Diary
              </button>
            </article>
          ))}
        </div>
      )}
      {error && <p className="text-[#ff8c8c]">{error}</p>}
      {!loading && !error && debouncedQuery && !results.length && (
        <div className="empty-state">
          <FiMusic className="text-4xl text-white/20 mb-2 inline-block" />
          <p>No results found.</p>
        </div>
      )}
    </main>
  );
}
