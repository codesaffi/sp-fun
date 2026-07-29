import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageSquare, FiEdit2, FiTrash2, FiMusic } from "react-icons/fi";
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
    const nextLikes = liked
      ? post.likes.filter(
          (like) => String(like?._id || like) !== String(currentUserId),
        )
      : [...(post.likes || []), currentUserId];
    onChange({ ...post, likes: nextLikes });
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
    } catch {
      onChange(post);
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
      }
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
      if (response.ok) onChange({ _id: post._id, deleted: true });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="feed-post">
      <div className="post-byline">
        <Avatar user={post.user} />
        <div>
          <b>{post.user?.name || "Listener"}</b>
          {post.community && (
            <small>
              posted in{" "}
              <Link to={`/communities/${post.community.slug}`}>
                {post.community.name}
              </Link>
            </small>
          )}
          <small>{new Date(post.createdAt).toLocaleDateString()}</small>
        </div>
      </div>
      <div className="post-art">
        <FiMusic className="text-[#d8fa61] inline-block" />
        <p>{post.type?.replace("_", " ")}</p>
      </div>
      {editing ? (
        <div className="post-editor">
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength="1000"
            disabled={saving}
          />
          <button onClick={save} disabled={saving}>
            {saving ? <ButtonLoader label="Saving" /> : "Save"}
          </button>
          <button
            onClick={() => {
              setCaption(post.caption);
              setEditing(false);
            }}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      ) : (
        <h2>{post.caption}</h2>
      )}
      <div className="post-meta">
        {post.artist?.name && <span>{post.artist.name}</span>}
        {post.song?.name && <span>{post.song.name}</span>}
        {post.album?.name && <span>{post.album.name}</span>}
        {post.mood && <span>{post.mood}</span>}
      </div>
      <div className="post-actions">
        <button onClick={like} disabled={liking} className="inline-flex items-center gap-1.5 cursor-pointer">
          <FiHeart className={liked ? "text-red-400 fill-red-400" : ""} />
          <span>{liked ? "Liked" : "Like"}</span>
          <span>{post.likes?.length || 0}</span>
        </button>
        <button onClick={() => setCommentsOpen((open) => !open)} className="inline-flex items-center gap-1.5 cursor-pointer">
          <FiMessageSquare />
          <span>Comment</span>
          <span>{post.comments?.length || 0}</span>
        </button>
        {manage && (isOwner || canModerate) && (
          <>
            <button onClick={() => setEditing(true)} disabled={saving} className="inline-flex items-center gap-1 cursor-pointer">
              <FiEdit2 /> Edit
            </button>
            <button onClick={remove} disabled={deleting} className="inline-flex items-center gap-1 cursor-pointer text-red-400">
              {deleting ? <ButtonLoader label="Deleting" /> : <><FiTrash2 /> Delete</>}
            </button>
          </>
        )}
      </div>
      {commentsOpen && (
        <div className="post-comments">
          <form onSubmit={addComment}>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength="500"
              placeholder="Add a comment..."
              disabled={submittingComment}
            />
            <button disabled={submittingComment}>
              {submittingComment ? <ButtonLoader label="Posting" /> : "Post"}
            </button>
          </form>
          {(post.comments || []).map((item) => (
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

export default React.memo(PostCardComponent);
