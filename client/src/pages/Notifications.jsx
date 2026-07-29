import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ListSkeleton, ButtonLoader } from "../components/Loading";
import { notificationTarget } from "../utils/notificationUtils";
import { FiMusic, FiTrash2 } from "react-icons/fi";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Notifications() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = async () => {
    const response = await fetch(`${API}/notifications?limit=50`, { headers });
    if (response.ok) setItems((await response.json()).notifications);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) return undefined;
    const controller = new AbortController();
    fetch(`${API}/notifications?limit=50`, {
      headers,
      signal: controller.signal,
    })
      .then((response) => response.ok && response.json())
      .then((data) => {
        if (data) setItems(data.notifications);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [headers, token]);

  const action = async (item) => {
    if (busy) return;
    setBusy(item._id);
    setItems((current) =>
      current.map((entry) =>
        entry._id === item._id ? { ...entry, isRead: true } : entry,
      ),
    );
    const response = await fetch(`${API}/notifications/${item._id}/read`, {
      method: "PATCH",
      headers,
    });
    setBusy("");
    if (!response.ok) return load();
    navigate(notificationTarget(item));
  };

  const remove = async (id) => {
    if (busy) return;
    const previous = items;
    setBusy(id);
    setItems((current) => current.filter((item) => item._id !== id));
    const response = await fetch(`${API}/notifications/${id}`, {
      method: "DELETE",
      headers,
    });
    setBusy("");
    if (!response.ok) setItems(previous);
  };

  const markAll = async () => {
    if (busy) return;
    setBusy("all");
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    const response = await fetch(`${API}/notifications/read-all`, {
      method: "PATCH",
      headers,
    });
    setBusy("");
    if (!response.ok) load();
  };

  const clear = async () => {
    if (busy) return;
    const previous = items;
    setBusy("clear");
    setItems([]);
    const response = await fetch(`${API}/notifications`, {
      method: "DELETE",
      headers,
    });
    setBusy("");
    if (!response.ok) setItems(previous);
  };

  return (
    <main className="dashboard-main">
      <header className="dash-header compact">
        <p className="eyebrow">ACTIVITY</p>
        <h1>Notifications</h1>
        <div className="flex gap-2">
          <button className="text-button cursor-pointer" onClick={markAll} disabled={busy === "all"}>
            {busy === "all" ? <ButtonLoader label="Marking" /> : "Mark all read"}
          </button>
          <button className="text-button cursor-pointer text-red-400" onClick={clear} disabled={busy === "clear"}>
            {busy === "clear" ? <ButtonLoader label="Clearing" /> : "Clear all"}
          </button>
        </div>
      </header>
      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="feed-list">
          {items.length ? (
            items.map((item) => (
              <article
                className={`feed-post notification-row cursor-pointer${item.isRead ? "" : " unread"}`}
                key={item._id}
                onClick={() => action(item)}
              >
                <div className="post-byline">
                  {item.sender?.avatar ? (
                    <img
                      className="avatar sm"
                      src={item.sender.avatar}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="avatar sm">
                      {item.sender?.name?.slice(0, 1) || "♫"}
                    </span>
                  )}
                  <div>
                    <b>{item.sender?.name || item.title}</b>
                    <p>{item.message}</p>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </div>
                  <button
                    disabled={busy === item._id}
                    className="cursor-pointer text-red-400 ml-auto"
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(item._id);
                    }}
                  >
                    {busy === item._id ? <ButtonLoader label="Deleting" /> : <FiTrash2 />}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <FiMusic className="text-4xl text-white/20 mb-2 inline-block" />
              <h2>No notifications yet.</h2>
              <p>Your music activity will appear here.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
