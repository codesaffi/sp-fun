import React, { useState } from "react";
import { FiHeart, FiMessageSquare, FiEdit2, FiTrash2, FiShare2, FiMusic } from "react-icons/fi";
import { ButtonLoader } from "./Loading";

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

function DiaryEntryCardComponent({
  entry,
  token,
  currentUserId,
  editable = false,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [liking, setLiking] = useState(false);

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
    if (liking) return;
    setLiking(true);
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
    } finally {
      setLiking(false);
    }
  };

  const comment = async (event) => {
    event.preventDefault();
    const commentText = text.trim();
    if (!commentText || submittingComment) return;
    setSubmittingComment(true);
    const original = entry;
    const optimistic = {
      _id: `temp-${Date.now()}`,
      user: { _id: currentUserId, name: "You" },
      text: commentText,
      createdAt: new Date().toISOString(),
    };
    patch({ ...entry, comments: [...(entry.comments || []), optimistic] });
    setText("");
    try {
      const res = await fetch(`${API}/diary/${entry._id}/comments`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error();
      patch(await res.json());
    } catch {
      patch(original);
    } finally {
      setSubmittingComment(false);
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/diary/${entry._id}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        patch(await res.json());
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (deleting || !window.confirm("Delete this diary entry?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/diary/${entry._id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) patch({ _id: entry._id, deleted: true });
    } finally {
      setDeleting(false);
    }
  };

  const share = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const res = await fetch(`${API}/posts`, {
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
      if (res.ok) {
        alert("Shared to feed successfully!");
      }
    } finally {
      setSharing(false);
    }
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
          <img src={entry.image} alt="" className="rounded-xl object-cover" />
        ) : (
          <div className="post-art"><FiMusic className="text-[#d8fa61]" /></div>
        )}
        <div>
          <p className="eyebrow">{entry.type}</p>
          <h2>{entry.title}</h2>
          <p className="diary-meta">
            {entry.artist}
            {entry.album ? ` · ${entry.album}` : ""}
          </p>
          <p className="diary-rating text-amber-400">
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
            disabled={saving}
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
            disabled={saving}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            disabled={saving}
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
            disabled={saving}
          />
          <button onClick={save} disabled={saving}>
            {saving ? <ButtonLoader label="Saving" /> : "Save"}
          </button>
          <button onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
        </div>
      ) : (
        entry.review && <p className="diary-review">{entry.review}</p>
      )}
      <div className="post-actions">
        <button onClick={like} disabled={liking} className="inline-flex items-center gap-1.5 cursor-pointer">
          <FiHeart className={liked ? "text-red-400 fill-red-400" : ""} />
          <span>{liked ? "Liked" : "Like"}</span>
          <span>{entry.likes?.length || 0}</span>
        </button>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 cursor-pointer">
          <FiMessageSquare />
          <span>Comment</span>
          <span>{entry.comments?.length || 0}</span>
        </button>
        {editable && (
          <>
            <button onClick={() => setEditing(true)} disabled={saving} className="inline-flex items-center gap-1 cursor-pointer">
              <FiEdit2 /> Edit
            </button>
            <button onClick={remove} disabled={deleting} className="inline-flex items-center gap-1 cursor-pointer text-red-400">
              {deleting ? <ButtonLoader label="Deleting" /> : <><FiTrash2 /> Delete</>}
            </button>
            <button onClick={share} disabled={sharing} className="inline-flex items-center gap-1 cursor-pointer">
              {sharing ? <ButtonLoader label="Sharing" /> : <><FiShare2 /> Share as Post</>}
            </button>
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
              disabled={submittingComment}
            />
            <button disabled={submittingComment}>
              {submittingComment ? <ButtonLoader label="Posting" /> : "Post"}
            </button>
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

export default React.memo(DiaryEntryCardComponent);
