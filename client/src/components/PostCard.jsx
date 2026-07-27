import { useState } from "react";

const API = `${import.meta.env.VITE_API_URL}/api`;
const initials = (name = "Listener") => name.split(" ").map((part) => part[0]).join("").slice(0, 2);

function Avatar({ user }) {
  return user?.avatar ? <img className="avatar sm" src={user.avatar} alt="" /> : <span className="avatar sm">{initials(user?.name)}</span>;
}

export default function PostCard({ post, token, currentUserId, onChange, manage = false }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const headers = { Authorization: `Bearer ${token}` };
  const isOwner = String(post.user?._id || post.user) === String(currentUserId);
  const liked = (post.likes || []).some((like) => String(like?._id || like) === String(currentUserId));

  const like = async () => {
    const oldPost = post;
    const nextLikes = liked ? post.likes.filter((like) => String(like?._id || like) !== String(currentUserId)) : [...(post.likes || []), currentUserId];
    onChange({ ...post, likes: nextLikes });
    try {
      const response = await fetch(`${API}/posts/${post._id}/like`, { method: "POST", headers });
      if (!response.ok) throw new Error();
      const data = await response.json();
      onChange({ ...post, likes: Array(data.likes).fill(data.liked ? currentUserId : "") });
    } catch { onChange(oldPost); }
  };
  const addComment = async (event) => {
    event.preventDefault();
    const text = comment.trim(); if (!text) return;
    const optimistic = { _id: `temp-${Date.now()}`, user: { _id: currentUserId, name: "You" }, text, createdAt: new Date().toISOString() };
    onChange({ ...post, comments: [...(post.comments || []), optimistic] }); setComment("");
    try {
      const response = await fetch(`${API}/posts/${post._id}/comments`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!response.ok) throw new Error();
      onChange(await response.json());
    } catch { onChange(post); }
  };
  const save = async () => {
    const text = caption.trim(); if (!text) return;
    const response = await fetch(`${API}/posts/${post._id}`, { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ caption: text }) });
    if (response.ok) { onChange(await response.json()); setEditing(false); }
  };
  const remove = async () => {
    if (!window.confirm("Delete this post?")) return;
    const response = await fetch(`${API}/posts/${post._id}`, { method: "DELETE", headers });
    if (response.ok) onChange({ _id: post._id, deleted: true });
  };

  return <article className="feed-post">
    <div className="post-byline"><Avatar user={post.user}/><div><b>{post.user?.name || "Listener"}</b><small>{new Date(post.createdAt).toLocaleDateString()}</small></div></div>
    <div className="post-art"><span>♫</span><p>{post.type?.replace("_", " ")}</p></div>
    {editing ? <div className="post-editor"><textarea value={caption} onChange={(event) => setCaption(event.target.value)} maxLength="1000"/><button onClick={save}>Save</button><button onClick={() => { setCaption(post.caption); setEditing(false); }}>Cancel</button></div> : <h2>{post.caption}</h2>}
    <div className="post-meta">{post.artist?.name && <span>{post.artist.name}</span>}{post.mood && <span>{post.mood}</span>}</div>
    <div className="post-actions"><button onClick={like}>{liked ? "♥ Unlike" : "♡ Like"} {post.likes?.length || 0}</button><button onClick={() => setCommentsOpen((open) => !open)}>◌ Comment {post.comments?.length || 0}</button>{manage && isOwner && <><button onClick={() => setEditing(true)}>Edit</button><button onClick={remove}>Delete</button></>}</div>
    {commentsOpen && <div className="post-comments"><form onSubmit={addComment}><input value={comment} onChange={(event) => setComment(event.target.value)} maxLength="500" placeholder="Add a comment..."/><button>Post</button></form>{(post.comments || []).map((item) => <div className="post-comment" key={item._id}><Avatar user={item.user}/><p><b>{item.user?.name || "Listener"}</b><span>{item.text}</span><small>{new Date(item.createdAt).toLocaleString()}</small></p></div>)}</div>}
  </article>;
}
