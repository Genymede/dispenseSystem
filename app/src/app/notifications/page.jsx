"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Clock, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../component/Header";
import { FormatDateTime } from "../component/formatDate";

const isClient = typeof window !== "undefined";

// ตั้ง API จาก ENV (แนะนำใส่ที่ Vercel: NEXT_PUBLIC_API_URL=https://dispensesystem-production.up.railway.app)
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL ?? (isClient ? `${location.origin}` : "http://localhost:3000");

// แปลง http->ws, https->wss แล้วเติม path /ws
const WS_ORIGIN = API_ORIGIN.replace(/^http(s?):\/\//, (_, s) => (s ? "wss://" : "ws://"));
const WS_BASE = `${WS_ORIGIN}/ws`;

const API_BASE = `${API_ORIGIN}/noti/notifications`;

const TOKEN_KEY = "token";

// ปรับช่วง polling ที่นี่ (ms)
const POLL_MS = 500; // 0.5 วิ (ปรับได้ตามต้องการ)

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState(null);

  const router = useRouter();
  const pollTimerRef = useRef(null);
  const inFlightRef = useRef(false);
  const abortRef = useRef(null);
  const wsRef = useRef(null);

  // --- โหลด user และ token จาก localStorage ---
  useEffect(() => {
    if (!isClient) return;
    try {
      const rawUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!rawUser || !storedToken) {
        setError("ไม่พบข้อมูลผู้ใช้หรือ token ใน localStorage");
        router.push("/login");
        return;
      }
      const user = JSON.parse(rawUser);
      if (!user || typeof user.user_id === "undefined") {
        setError("ข้อมูลผู้ใช้ไม่มี user_id ที่ถูกต้อง");
        router.push("/login");
        return;
      }
      setUserId(user.user_id);
      setToken(storedToken);
      setLoading(false);
    } catch (err) {
      setError("อ่านข้อมูลผู้ใช้ไม่สำเร็จ: " + (err?.message || String(err)));
      localStorage.removeItem("user");
      localStorage.removeItem(TOKEN_KEY);
      router.push("/login");
    }
  }, [router]);

  // --- ฟังก์ชันดึง notifications ---
  const fetchNotifications = async (uid, { showSpinner = false } = {}) => {
    if (!uid || !token || inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (showSpinner) setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/${uid}`, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const sorted = (data ?? []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(sorted);
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "โหลดไม่สำเร็จ");
        if (e.message.includes("Token")) {
          localStorage.removeItem("user");
          localStorage.removeItem(TOKEN_KEY);
          router.push("/login");
        }
      }
    } finally {
      if (showSpinner) setLoading(false);
      inFlightRef.current = false;
    }
  };

  // --- ดึงครั้งแรกเมื่อได้ userId ---
  useEffect(() => {
    if (!userId || !token) return;
    fetchNotifications(userId, { showSpinner: true });
  }, [userId, token]);

  // --- WebSocket connection ---
  useEffect(() => {
    if (!isClient || !userId || !token) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${WS_BASE}?userId=${userId}&token=${token}`);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`✅ WebSocket connected for userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            setNotifications((prevNotifications) => {
              const newNotification = data.data;
              // หลีกเลี่ยงการเพิ่มซ้ำ
              if (prevNotifications.some(n => n.notification_id === newNotification.notification_id)) {
                return prevNotifications;
              }
              const updated = [newNotification, ...prevNotifications].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              );
              return updated;
            });
          } else if (data.type === 'initial_notifications') {
            setNotifications((prevNotifications) => {
              const newNotifications = data.data;
              // รวม notifications ใหม่และเก่า, ลบซ้ำ, และเรียงตาม created_at
              const merged = [...newNotifications, ...prevNotifications].reduce((acc, n) => {
                if (!acc.some(existing => existing.notification_id === n.notification_id)) {
                  acc.push(n);
                }
                return acc;
              }, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              return merged;
            });
          }
        } catch (err) {
          console.error(`❌ WebSocket message error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed for userId: ${userId}, code: ${event.code}, reason: ${event.reason} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId, token]);

  // --- Polling ทุก 0.5 วิ + ดึงทันทีเมื่อโฟกัส/แท็บกลับมา ---
  useEffect(() => {
    if (!userId || !token || !isClient) return;

    // ดึงทันทีตอน mount effect นี้
    fetchNotifications(userId);

    // ตั้ง interval polling (ทำงานแม้แท็บไม่โฟกัส)
    pollTimerRef.current = window.setInterval(() => {
      fetchNotifications(userId);
    }, POLL_MS);

    // เมื่อหน้าต่างกลับมาโฟกัส ดึงทันที
    const onFocus = () => fetchNotifications(userId);
    const onVisibility = () => {
      if (!document.hidden) fetchNotifications(userId);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [userId, token]);

  // --- อัปเดต document.title เมื่อมีแจ้งเตือนใหม่ ---
  useEffect(() => {
    if (!isClient) return;
    const originalTitle = document.title;
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    if (unreadCount > 0 && document.hidden) {
      document.title = `(${unreadCount}) การแจ้งเตือนใหม่`;
    } else {
      document.title = originalTitle;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [notifications]);

  // --- Actions ---
  const markAsRead = async (notificationId) => {
    if (isUpdating || !token) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead: true }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (e) {
      setErrorMessage(e.message || "อัปเดตสถานะไม่สำเร็จ");
      if (e.message.includes("Token")) {
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const markAllAsRead = async () => {
    if (isUpdating || !userId || !token) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/user/${userId}/read-all`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead: true }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setNotifications((prevNotifications) => prevNotifications.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      setErrorMessage(e.message || "อัปเดตทั้งหมดไม่สำเร็จ");
      if (e.message.includes("Token")) {
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // --- ตัวกรอง & helper ---
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "วันนี้";
    if (days === 1) return "เมื่อวาน";
    if (days < 7) return `${days} วันที่แล้ว`;
    return d.toLocaleDateString("th-TH");
  };

  // --- ซิงค์ unread ลง localStorage ---
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("unread", String(unreadCount));
    window.dispatchEvent(new Event("unread:change"));
  }, [unreadCount]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <Header header="การแจ้งเตือน" icon={Bell} />
              <p className="text-gray-500 text-sm">
                {notifications.length > 0
                  ? `ทั้งหมด ${notifications.length} รายการ`
                  : "ไม่มีการแจ้งเตือน"}
                {unreadCount > 0 && ` • ${unreadCount} รายการใหม่`}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-white rounded-full shadow-sm ring-1 ring-blue-500/20 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว</span>
            </button>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="max-w-7xl mx-auto mt-6 flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: "all", label: "ทั้งหมด", count: notifications.length },
              { key: "unread", label: "ยังไม่อ่าน", count: unreadCount },
              { key: "read", label: "อ่านแล้ว", count: notifications.length - unreadCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${filter === tab.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-7xl mx-auto py-8">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-lg bg-red-100 text-red-700 text-sm font-medium flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 text-center"
            >
              <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-20 h-20 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่มีการแจ้งเตือน</h3>
              <p className="text-gray-500">คุณจะเห็นการแจ้งเตือนใหม่ๆ ที่นี่เมื่อมีการอัพเดท</p>
            </motion.div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 text-center"
            >
              <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-20 h-20 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ไม่มีการแจ้งเตือน
                {filter === "unread" ? "ที่ยังไม่อ่าน" : filter === "read" ? "ที่อ่านแล้ว" : ""}
              </h3>
              <p className="text-gray-500">ลองเปลี่ยนตัวกรองเพื่อดูการแจ้งเตือนอื่นๆ</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.notification_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={() =>
                      !notification.is_read && markAsRead(notification.notification_id)
                    }
                    className={`flex items-center justify-between gap-4 p-5 rounded-2xl shadow-md border border-gray-200 transition-all duration-200 transform hover:scale-[1.02] ${!notification.is_read
                        ? "border-l-4 border-l-blue-500 bg-blue-50/30 cursor-pointer hover:bg-blue-50 hover:shadow-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-gray-200"
                      }`}
                  >
                    <div className={`p-3 rounded-xl bg-white shadow-sm text-blue-600 flex-shrink-0`}>
                      <Bell className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-bold ${!notification.is_read ? "text-gray-900" : "text-gray-600"
                          }`}
                      >
                        {notification.title}
                      </h3>
                      <p
                        className={`text-sm text-gray-500 truncate ${!notification.is_read ? "text-gray-700" : ""
                          }`}
                      >
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-400">
                        <FormatDateTime dateString={notification.created_at} />
                      </span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {!notification.is_read ? (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            ใหม่
                          </span>
                        ) : (
                          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 text-xs rounded-full">
                              อ่านแล้ว
                            </span>
                          </div>
                        )}
                        <div className="flex items-center text-xs text-gray-400 space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;