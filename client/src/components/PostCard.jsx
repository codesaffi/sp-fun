import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Edit3, Trash2, Music, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { ButtonLoader } from "./Loading";

const API = `${import.meta.env.VITE_API_URL}/api`;
const initials = (name = "Listener") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function Avatar({ user }) {
  return user?.avatar ? (
    <img className="avatar sm" src={user.avatar} alt="" />
  ) : (
    <span className="avatar sm">{initials(user?.name)}</span>
  );
}

function PostCardComponent({
  post,
  token,
  currentUserId,
  onChange,
  manage = false,
  canModerate = false,
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [caption, setCaption] = useState(post.caption);

  const headers = { Authorization: `Bearer ${token}` };
  const isOwner = String(post.user?._id || post.user) === String(currentUserId);
  const liked = (post.likes || []).some(
    (like) => String(like?._id || like) === String(currentUserId),
  );

  const like = async () => {
    if (liking) return;
    setLiking(true);
    const oldPost = post;
    const isLiking = !liked;
    const nextLikes = liked
      ? post.likes.filter(
          (like) => String(like?._id || like) !== String(currentUserId),
        )
      : [...(post.likes || []), currentUserId];
    onChange({ ...post, likes: nextLikes });

    if (isLiking) {
      toast.success("Liked post", { duration: 1500 });
    }

    try {
      const response = await fetch(`${API}/posts/${post._id}/like`, {
        method: "POST",
        headers,
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      onChange({
        ...post,
        likes: Array(data.likes).fill(data.liked ? currentUserId : ""),
      });
    } catch {
      onChange(oldPost);
      toast.error("Failed to update like state");
    } finally {
      setLiking(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    const text = comment.trim();
    if (!text || submittingComment) return;
    setSubmittingComment(true);
    const optimistic = {
      _id: `temp-${Date.now()}`,
      user: { _id: currentUserId, name: "You" },
      text,
      createdAt: new Date().toISOString(),
    };
    onChange({ ...post, comments: [...(post.comments || []), optimistic] });
    setComment("");
    try {
      const response = await fetch(`${API}/posts/${post._id}/comments`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error();
      onChange(await response.json());
      toast.success("Comment added", { duration: 2000 });
    } catch {
      onChange(post);
      toast.error("Could not post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const save = async () => {
    const text = caption.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`${API}/posts/${post._id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ caption: text }),
      });
      if (response.ok) {
        onChange(await response.json());
        setEditing(false);
        toast.success("Post updated successfully");
      }
    } catch {
      toast.error("Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (deleting || !window.confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API}/posts/${post._id}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        onChange({ _id: post._id, deleted: true });
        toast.success("Post deleted");
      }
    } catch {
      toast.error("Could not delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="feed-post hover-elevate rounded-[22px] border border-white/10 bg-[#16131b]/90 backdrop-blur-md p-5 mb-4 shadow-lg"
    >
      <div className="post-byline flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar user={post.user} />
          <div>
            <b className="text-white font-medium">{post.user?.name || "Listener"}</b>
            {post.community && (
              <small className="block text-white/60 text-xs">
                posted in{" "}
                <Link to={`/communities/${post.community.slug}`} className="text-[#d8fa61] hover:underline">
                  {post.community.name}
                </Link>
              </small>
            )}
            <small className="block text-white/40 text-[11px]">
              {new Date(post.createdAt).toLocaleDateString()}
            </small>
          </div>
        </div>
        {post.mood && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#d8fa61]" /> {post.mood}
          </span>
        )}
      </div>

      <div className="post-art my-3 p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
        <Music className="w-4 h-4 text-[#d8fa61]" />
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
          {post.type?.replace("_", " ")}
        </p>
      </div>

      {editing ? (
        <div className="post-editor space-y-3">
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength="1000"
            disabled={saving}
            className="w-full bg-[#0e0c12] border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#d8fa61]"
          />
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={save}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-[#d8fa61] text-[#0e0c12] font-semibold text-sm cursor-pointer"
            >
              {saving ? <ButtonLoader label="Saving" /> : "Save"}
            </motion.button>
            <button
              onClick={() => {
                setCaption(post.caption);
                setEditing(false);
              }}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <h2 className="text-base font-normal leading-relaxed text-white/90 my-3">{post.caption}</h2>
      )}

      <div className="post-meta flex flex-wrap gap-2 my-3">
        {post.artist?.name && (
          <span className="text-xs px-3 py-1 rounded-full bg-[#211a27] text-white/80 border border-white/10">
            🎤 {post.artist.name}
          </span>
        )}
        {post.song?.name && (
          <span className="text-xs px-3 py-1 rounded-full bg-[#211a27] text-white/80 border border-white/10">
            🎵 {post.song.name}
          </span>
        )}
        {post.album?.name && (
          <span className="text-xs px-3 py-1 rounded-full bg-[#211a27] text-white/80 border border-white/10">
            💿 {post.album.name}
          </span>
        )}
      </div>

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
          <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[11px]">{post.likes?.length || 0}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setCommentsOpen((open) => !open)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white cursor-pointer transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
          <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[11px]">{post.comments?.length || 0}</span>
        </motion.button>

        {manage && (isOwner || canModerate) && (
          <div className="ml-auto flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setEditing(true)}
              disabled={saving}
              className="p-1.5 text-white/60 hover:text-white cursor-pointer transition-colors"
              title="Edit Post"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={remove}
              disabled={deleting}
              className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
              title="Delete Post"
            >
              {deleting ? <ButtonLoader label="" /> : <Trash2 className="w-4 h-4" />}
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="post-comments mt-4 pt-3 border-t border-white/5 space-y-3 overflow-hidden"
          >
            <form onSubmit={addComment} className="flex gap-2">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
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
              {(post.comments || []).map((item) => (
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

export default React.memo(PostCardComponent);
