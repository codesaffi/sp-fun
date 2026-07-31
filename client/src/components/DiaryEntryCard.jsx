import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, MessageSquare, Edit3, Trash2, Share2, Disc, Send } from "lucide-react";
import { toast } from "sonner";
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
    const isLiking = !liked;
    const likes = liked
      ? entry.likes.filter(
          (item) => String(item?._id || item) !== String(currentUserId),
        )
      : [...(entry.likes || []), currentUserId];
    patch({ ...entry, likes });

    if (isLiking) {
      toast.success("Liked diary entry", { duration: 1500 });
    }

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
      toast.error("Failed to update like status");
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
      toast.success("Comment added", { duration: 2000 });
    } catch {
      patch(original);
      toast.error("Could not post comment");
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
        toast.success("Diary entry updated");
      }
    } catch {
      toast.error("Failed to update entry");
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
      if (res.ok) {
        patch({ _id: entry._id, deleted: true });
        toast.success("Diary entry deleted");
      }
    } catch {
      toast.error("Could not delete entry");
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
        toast.success("Shared review as a feed post!");
      }
    } catch {
      toast.error("Failed to share review");
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="feed-post diary-entry hover-elevate rounded-[22px] border border-white/10 bg-[#16131b]/90 backdrop-blur-md p-5 mb-4 shadow-lg"
    >
      <div className="post-byline flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar user={entry.user} />
          <div>
            <b className="text-white font-medium">{entry.user?.name || "Listener"}</b>
            <small className="block text-white/40 text-[11px]">
              {new Date(entry.entryDate || entry.createdAt).toLocaleDateString()}
            </small>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
          {statuses[entry.status]}
        </span>
      </div>

      <div className="diary-entry-main flex gap-4 my-4">
        {entry.image ? (
          <img src={entry.image} alt="" className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow-md shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Disc className="w-8 h-8 text-[#d8fa61]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#d8fa61]">{entry.type}</p>
          <h2 className="text-lg font-bold text-white truncate">{entry.title}</h2>
          <p className="text-xs text-white/60 truncate my-0.5">
            {entry.artist}
            {entry.album ? ` · ${entry.album}` : ""}
          </p>
          <div className="flex items-center gap-0.5 text-amber-400 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < (entry.rating || 0) ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="post-editor space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              disabled={saving}
              className="bg-[#0e0c12] border border-white/15 rounded-xl p-2 text-xs text-white"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={saving}
              className="bg-[#0e0c12] border border-white/15 rounded-xl p-2 text-xs text-white"
            >
              {Object.entries(statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.review}
            onChange={(e) => setForm({ ...form, review: e.target.value })}
            disabled={saving}
            placeholder="Write your review..."
            className="w-full bg-[#0e0c12] border border-white/15 rounded-xl p-3 text-xs text-white"
          />
          <input
            type="date"
            value={form.entryDate}
            onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
            disabled={saving}
            className="bg-[#0e0c12] border border-white/15 rounded-xl p-2 text-xs text-white"
          />
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={save}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-[#d8fa61] text-[#0e0c12] font-semibold text-xs cursor-pointer"
            >
              {saving ? <ButtonLoader label="Saving" /> : "Save"}
            </motion.button>
            <button onClick={() => setEditing(false)} disabled={saving} className="px-4 py-1.5 rounded-xl bg-white/10 text-xs text-white cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        entry.review && <p className="diary-review text-sm text-white/80 italic my-3 bg-white/5 p-3 rounded-xl border border-white/5">{entry.review}</p>
      )}

      <div className="post-actions flex items-center gap-4 pt-3 border-t border-white/5">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={like}
          disabled={liking}
          className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
            liked ? "text-red-400" : "text-white/60 hover:text-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-red-400 text-red-400" : ""}`} />
          <span>{liked ? "Liked" : "Like"}</span>
          <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[11px]">{entry.likes?.length || 0}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white cursor-pointer transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
          <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[11px]">{entry.comments?.length || 0}</span>
        </motion.button>

        {editable && (
          <div className="ml-auto flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setEditing(true)}
              disabled={saving}
              className="p-1.5 text-white/60 hover:text-white cursor-pointer transition-colors"
              title="Edit Entry"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={remove}
              disabled={deleting}
              className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
              title="Delete Entry"
            >
              {deleting ? <ButtonLoader label="" /> : <Trash2 className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={share}
              disabled={sharing}
              className="p-1.5 text-[#d8fa61] hover:text-[#d9fa60] cursor-pointer transition-colors"
              title="Share to Feed"
            >
              {sharing ? <ButtonLoader label="" /> : <Share2 className="w-4 h-4" />}
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="post-comments mt-4 pt-3 border-t border-white/5 space-y-3 overflow-hidden"
          >
            <form onSubmit={comment} className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength="500"
                placeholder="Add a comment..."
                disabled={submittingComment}
                className="flex-1 bg-[#0e0c12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d8fa61]"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                disabled={submittingComment}
                className="px-3 py-2 bg-[#d8fa61] text-[#0e0c12] rounded-xl font-semibold text-xs cursor-pointer inline-flex items-center gap-1"
              >
                {submittingComment ? <ButtonLoader label="" /> : <><Send className="w-3 h-3" /> Post</>}
              </motion.button>
            </form>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {entry.comments?.map((item) => (
                <div className="post-comment flex items-start gap-2.5 p-2 rounded-xl bg-white/5" key={item._id}>
                  <Avatar user={item.user} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <b className="text-xs font-semibold text-white">{item.user?.name || "Listener"}</b>
                      <small className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                    <p className="text-xs text-white/80 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default React.memo(DiaryEntryCardComponent);
