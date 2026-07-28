import { useState } from "react";

const API = `${import.meta.env.VITE_API_URL}/api`;
const statuses = {
  favorite: "❤️ Favorite",
  listening: "🎧 Listening",
  listened: "✅ Listened",
  want_to_listen: "📌 Want to Listen",
  revisited: "🔁 Revisited",
};
const initials = (name = "Listener") => name.slice(0, 2).toUpperCase();
const Avatar = ({ user }) =>
  user?.avatar ? (
    <img className="avatar sm" src={user.avatar} alt="" />
  ) : (
    <span className="avatar sm">{initials(user?.name)}</span>
  );

export default function DiaryEntryCard({
  entry,
  token,
  currentUserId,
  editable = false,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    rating: entry.rating || 1,
    review: entry.review || "",
    status: entry.status,
    entryDate: entry.entryDate?.slice(0, 10) || "",
  });
  const headers = { Authorization: `Bearer ${token}` };
  const liked = entry.likes?.some(
    (like) => String(like?._id || like) === String(currentUserId),
  );
  const patch = (updated) => onChange?.(updated);
  const like = async () => {
    const original = entry;
    const likes = liked
      ? entry.likes.filter(
          (item) => String(item?._id || item) !== String(currentUserId),
        )
      : [...(entry.likes || []), currentUserId];
    patch({ ...entry, likes });
    try {
      const res = await fetch(`${API}/diary/${entry._id}/like`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      patch({
        ...entry,
        likes: Array(data.likes).fill(data.liked ? currentUserId : ""),
      });
    } catch {
      patch(original);
    }
  };
  const comment = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    const original = entry;
    try {
      const res = await fetch(`${API}/diary/${entry._id}/comments`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      patch(await res.json());
      setText("");
    } catch {
      patch(original);
    }
  };
  const save = async () => {
    const res = await fetch(`${API}/diary/${entry._id}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      patch(await res.json());
      setEditing(false);
    }
  };
  const remove = async () => {
    if (!window.confirm("Delete this diary entry?")) return;
    const res = await fetch(`${API}/diary/${entry._id}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) patch({ _id: entry._id, deleted: true });
  };
  const share = async () => {
    await fetch(`${API}/posts`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: `${"★".repeat(entry.rating || 0)} ${entry.title} — ${entry.review || statuses[entry.status]}`,
        type: "custom",
        artist: { name: entry.artist },
        song: entry.type === "song" ? { name: entry.title } : undefined,
        images: entry.image ? [entry.image] : [],
      }),
    });
  };
  return (
    <article className="feed-post diary-entry">
      <div className="post-byline">
        <Avatar user={entry.user} />
        <div>
          <b>{entry.user?.name || "Listener"}</b>
          <small>
            {new Date(entry.entryDate || entry.createdAt).toLocaleDateString()}
          </small>
        </div>
      </div>
      <div className="diary-entry-main">
        {entry.image ? (
          <img src={entry.image} alt="" />
        ) : (
          <div className="post-art">♫</div>
        )}
        <div>
          <p className="eyebrow">{entry.type}</p>
          <h2>{entry.title}</h2>
          <p className="diary-meta">
            {entry.artist}
            {entry.album ? ` · ${entry.album}` : ""}
          </p>
          <p className="diary-rating">
            {"★".repeat(entry.rating || 0)}
            {"☆".repeat(5 - (entry.rating || 0))}
          </p>
          <span className="diary-status">{statuses[entry.status]}</span>
        </div>
      </div>
      {editing ? (
        <div className="post-editor">
          <select
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: Number(e.target.value) })
            }
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} stars
              </option>
            ))}
          </select>
          <textarea
            value={form.review}
            onChange={(e) => setForm({ ...form, review: e.target.value })}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {Object.entries(statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.entryDate}
            onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
          />
          <button onClick={save}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        entry.review && <p className="diary-review">{entry.review}</p>
      )}
      <div className="post-actions">
        <button onClick={like}>
          {liked ? "♥ Unlike" : "♡ Like"} {entry.likes?.length || 0}
        </button>
        <button onClick={() => setOpen(!open)}>
          ◌ Comment {entry.comments?.length || 0}
        </button>
        {editable && (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={remove}>Delete</button>
            <button onClick={share}>Share as Post</button>
          </>
        )}
      </div>
      {open && (
        <div className="post-comments">
          <form onSubmit={comment}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength="500"
              placeholder="Add a comment..."
            />
            <button>Post</button>
          </form>
          {entry.comments?.map((item) => (
            <div className="post-comment" key={item._id}>
              <Avatar user={item.user} />
              <p>
                <b>{item.user?.name || "Listener"}</b>
                <span>{item.text}</span>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
