import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageSkeleton } from "../components/Loading";
const API = `${import.meta.env.VITE_API_URL}/api`;
const status = {
  favorite: "❤️ Favorite",
  listening: "🎧 Listening",
  listened: "✅ Listened",
  want_to_listen: "📌 Want to Listen",
  revisited: "🔁 Revisited",
};
export default function DiaryDetail() {
  const { type, id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    rating: 5,
    review: "",
    status: "listened",
    entryDate: new Date().toISOString().slice(0, 10),
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/diary/details/${type}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => res.ok && res.json())
      .then(setItem)
      .catch((error) => {
        if (error.name !== "AbortError") setItem(null);
      });
    return () => controller.abort();
  }, [id, token, type]);
  const save = async () => {
    if (saving || !item) return;
    setSaving(true);
    const res = await fetch(`${API}/diary`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...item, ...form }),
    });
    if (res.ok) {
      window.dispatchEvent(new Event("diary-updated"));
      setMessage("Saved to your Music Diary.");
    } else
      setMessage((await res.json()).message || "Could not save this entry.");
    setSaving(false);
  };
  const share = async () => {
    if (sharing || !item) return;
    setSharing(true);
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption: `${"★".repeat(form.rating)} ${item.title} — ${form.review || status[form.status]}`,
        type: "custom",
        artist: { name: item.artist },
        song: type === "song" ? { name: item.title } : undefined,
        images: item.image ? [item.image] : [],
      }),
    });
    if (res.ok) navigate("/dashboard");
    setSharing(false);
  };
  if (!item) return <PageSkeleton />;
  return (
    <main className="dashboard-main diary-page">
      <button className="text-button" onClick={() => navigate(-1)}>
        ← Back to diary
      </button>
      <section className="glass-section diary-detail">
        <div className="diary-detail-head">
          {item.image && <img src={item.image} alt="" />}
          <div>
            <p className="eyebrow">{type}</p>
            <h1>{item.title}</h1>
            <p>{item.artist}</p>
            {item.album && <p>{item.album}</p>}
            <p className="subtle">
              {item.releaseDate} · Popularity {item.popularity ?? "—"}
              {item.followers !== undefined
                ? ` · ${item.followers.toLocaleString()} followers`
                : ""}
            </p>
            <div className="genre-pills">
              {item.genres?.map((genre) => (
                <span key={genre}>{genre}</span>
              ))}
            </div>
          </div>
        </div>
        <ExtraMetadata item={item} />
        <div className="post-editor diary-form">
          <p className="eyebrow">MY REVIEW</p>
          <label>
            Rating
            <select
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {"★".repeat(value)} ({value}/5)
                </option>
              ))}
            </select>
          </label>
          <label>
            Review
            <textarea
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              placeholder="What did this sound like to you?"
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {Object.entries(status).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.entryDate}
              onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
            />
          </label>
          <button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Review"}
          </button>
          <button onClick={share} disabled={sharing}>
            {sharing ? "Sharing..." : "Share as Post"}
          </button>
          {message && <p className="subtle">{message}</p>}
        </div>
      </section>
    </main>
  );
}
function ExtraMetadata({ item }) {
  if (!item.tracks?.length && !item.related?.length) return null;
  return (
    <div className="diary-extra">
      {item.tracks?.length > 0 && (
        <>
          <p className="eyebrow">TRACKS</p>
          {item.tracks.map((track, index) => (
            <p key={track.id}>
              {index + 1}. {track.title} <span>{track.artist}</span>
            </p>
          ))}
        </>
      )}
      {item.related?.length > 0 && (
        <>
          <p className="eyebrow">RELATED ARTISTS</p>
          <div className="genre-pills">
            {item.related.map((artist) => (
              <span key={artist.spotifyId}>{artist.title}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
