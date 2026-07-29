import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { notificationTarget } from "../utils/notificationUtils";
import { ButtonLoader } from "./Loading";

const API = `${import.meta.env.VITE_API_URL}/api`;
const ago = (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function NotificationCenterComponent() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [data, setData] = useState({ notifications: [], unread: 0 });

  const load = async (signal) => {
    const response = await fetch(`${API}/notifications?limit=8`, { headers, signal });
    if (response.ok) setData(await response.json());
  };

  useEffect(() => {
    if (!token) return undefined;
    const controller = new AbortController();
    load(controller.signal).catch(() => {});
    const timer = window.setInterval(() => load().catch(() => {}), 30000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [headers, token]);

  const read = async (item) => {
    if (busy) return;
    setBusy(item._id);
    if (!item.isRead) {
      setData((current) => ({
        ...current,
        unread: Math.max(current.unread - 1, 0),
        notifications: current.notifications.map((entry) =>
          entry._id === item._id ? { ...entry, isRead: true } : entry,
        ),
      }));
      const response = await fetch(`${API}/notifications/${item._id}/read`, {
        method: "PATCH",
        headers,
      });
      if (!response.ok) await load().catch(() => {});
    }
    setBusy("");
    navigate(notificationTarget(item));
    setOpen(false);
  };

  const markAll = async () => {
    if (busy) return;
    setBusy("all");
    setData((current) => ({
      ...current,
      unread: 0,
      notifications: current.notifications.map((item) => ({ ...item, isRead: true })),
    }));
    const response = await fetch(`${API}/notifications/read-all`, {
      method: "PATCH",
      headers,
    });
    setBusy("");
    if (!response.ok) load().catch(() => {});
  };

  return (
    <div className="notification-center relative">
      <button
        className="bell relative inline-flex items-center justify-center p-2 text-xl hover:text-[#d8fa61] transition-colors cursor-pointer"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <FiBell />
        {data.unread > 0 && (
          <b className="absolute -top-1 -right-1 bg-[#d8fa61] text-[#0e0c12] text-xs px-1.5 py-0.5 rounded-full font-bold">
            {data.unread > 9 ? "9+" : data.unread}
          </b>
        )}
      </button>
      {open && (
        <section className="notification-dropdown">
          <header className="flex justify-between items-center pb-2 border-b border-white/10">
            <strong>Notifications</strong>
            <button className="text-button text-xs cursor-pointer" onClick={markAll} disabled={busy === "all"}>
              {busy === "all" ? <ButtonLoader label="Marking" /> : "Mark all read"}
            </button>
          </header>
          {data.notifications.length ? (
            data.notifications.map((item) => (
              <button
                className={!item.isRead ? "notification unread cursor-pointer" : "notification cursor-pointer"}
                key={item._id}
                onClick={() => read(item)}
                disabled={busy === item._id}
              >
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
                <span>
                  <b>{item.sender?.name || item.title}</b>
                  <small>{item.message} · {ago(item.createdAt)}</small>
                </span>
              </button>
            ))
          ) : (
            <p className="subtle p-3 text-center text-sm">You’re all caught up.</p>
          )}
          <button
            className="text-button w-full text-center py-2 cursor-pointer"
            onClick={() => {
              navigate("/notifications");
              setOpen(false);
            }}
          >
            View all notifications
          </button>
        </section>
      )}
    </div>
  );
}

export default React.memo(NotificationCenterComponent);
