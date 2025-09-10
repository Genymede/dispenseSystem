"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, User, LogOut, ChevronDown, Menu, X, Settings } from "lucide-react";

/* ------------------ Config ------------------ */
const UNREAD_KEY = "unread";
const TOKEN_KEY = "token";
const WS_RECONNECT_INTERVAL = 5000; // 5 วินาที
const WS_MAX_RECONNECT_ATTEMPTS = 5;

/* ------------------ Utils ------------------ */
const getHost = () =>
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const getUnreadFromLS = () => {
  try {
    const v = localStorage.getItem(UNREAD_KEY);
    return Number(v) || 0;
  } catch {
    return 0;
  }
};

const getTokenFromLS = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

/* ฟังก์ชันสำหรับเรียก API Login */
async function loginUser(username, password) {
  const host = getHost();
  const response = await fetch(`https://dispensesystem-production.up.railway.app/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Login failed");
  }
  return response.json();
}

/* ฟังก์ชันดึง unreadCount จาก API */
async function fetchUnreadCount(userId, token) {
  const host = getHost();
  try {
    const response = await fetch(`https://dispensesystem-production.up.railway.app/noti/notifications-total/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log(`📊 Fetched unread count for userId ${userId}: ${data.total}`);
    return data.total || 0;
  } catch (error) {
    console.error(`❌ Error fetching unread count for userId ${userId}:`, error);
    return 0;
  }
}

export default function Navbar() {
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPharmacist, setIsPharmacist] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginInfo, setLoginInfo] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState(null);

  const prevUnreadRef = useRef(0);
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const MOCK_USER_ID_RIDER = 9;

  /* ------------------ WebSocket Management ------------------ */
  const connectWebSocket = (userId, token) => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) return;

    const host = getHost();
    wsRef.current = new WebSocket(`ws://dispensesystem-production.up.railway.app/ws?userId=${userId}&token=${token}`);

    wsRef.current.onopen = () => {
      console.log(`✅ WebSocket connected for userId: ${userId}`);
      reconnectAttemptsRef.current = 0;
    };

    wsRef.current.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === "notification") {
          const notifications = [data];
          const newUnreadCount = notifications.filter(n => !n.is_read).length;
          if (newUnreadCount > 0) {
            setUnreadCount((currentUnread) => {
              const updatedCount = currentUnread + newUnreadCount;
              localStorage.setItem(UNREAD_KEY, String(updatedCount));
              window.dispatchEvent(new Event("unread:change"));
              console.log(`📨 Received ${type} with ${newUnreadCount} new unread notifications`);
              return updatedCount;
            });
          }
        }
      } catch (error) {
        console.error(`❌ Error parsing WebSocket message:`, error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log(`🔌 WebSocket closed for userId: ${userId}, code: ${event.code}, reason: ${event.reason}`);
      if (reconnectAttemptsRef.current < WS_MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          console.log(`🔄 Reconnecting WebSocket, attempt ${reconnectAttemptsRef.current}`);
          connectWebSocket(userId, token);
        }, WS_RECONNECT_INTERVAL);
      } else {
        console.error(`❌ Max reconnect attempts reached for userId: ${userId}`);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error(`❌ WebSocket error for userId: ${userId}:`, error);
    };
  };

  /* ------------------ Auth handlers ------------------ */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const data = await loginUser(loginInfo.username, loginInfo.password);
      setUserData(data.user);
      setToken(data.token);
      setIsPharmacist(data.user.role === "pharmacist");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error.message);
      setErrorMessage(error.message);
    }
  };

  const handleMaskRider = () => {
    const data = {
      user_id: MOCK_USER_ID_RIDER,
      username: "Mask Rider Decade",
      role: "Mask Rider",
      firstname: "Mask",
      lastname: "Rider",
    };
    localStorage.setItem("user", JSON.stringify(data));
    setUserData(data);
    setIsPharmacist(false);
    setIsModalOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    localStorage.removeItem("user");
    localStorage.removeItem(TOKEN_KEY);
    setUserData(null);
    setToken(null);
    setIsPharmacist(false);
    setIsModalOpen(false);
    setUnreadCount(0);
    localStorage.setItem(UNREAD_KEY, "0");
    window.dispatchEvent(new Event("unread:change"));
    window.location.reload();
  };

  /* ------------------ Mount: load user & unread ------------------ */
  useEffect(() => {
    // Load user and token
    const storedUser = localStorage.getItem("user");
    const storedToken = getTokenFromLS();
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setToken(storedToken);
        setIsPharmacist(user?.role === "pharmacist");
      } catch {}
    }

    // Initial unread from localStorage
    const initialUnread = getUnreadFromLS();
    prevUnreadRef.current = initialUnread;
    setUnreadCount(initialUnread);
  }, []);

  /* ------------------ Fetch initial unread count & WebSocket ------------------ */
  useEffect(() => {
    if (!userData?.user_id || !token) return;

    // Fetch initial unread count first
    const fetchInitialUnread = async () => {
      const count = await fetchUnreadCount(userData.user_id, token);
      setUnreadCount(count);
      localStorage.setItem(UNREAD_KEY, String(count));
      window.dispatchEvent(new Event("unread:change"));
      connectWebSocket(userData.user_id, token);
    };
    fetchInitialUnread();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userData?.user_id, token]);

  /* ------------------ Live updates from localStorage ------------------ */
  useEffect(() => {
    // Cross-tab updates
    const onStorage = (e) => {
      if (e.key === UNREAD_KEY) {
        const next = Number(e.newValue) || 0;
        prevUnreadRef.current = next;
        setUnreadCount(next);
      }
    };
    window.addEventListener("storage", onStorage);

    // Same-tab custom event
    const onCustom = () => {
      const next = getUnreadFromLS();
      if (next !== prevUnreadRef.current) {
        prevUnreadRef.current = next;
        setUnreadCount(next);
      }
    };
    window.addEventListener("unread:change", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("unread:change", onCustom);
    };
  }, []);

  /* ------------------ UI helpers ------------------ */
  const pharmacistImage = "/image/FakePharmacist.png";
  const maskRiderImage = "https://cn.lnwfile.com/_/cn/_raw/1t/l7/d9.jpg";
  const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const getUserImage = (role) => {
    if (role === "pharmacist") return pharmacistImage;
    if (role === "Mask Rider") return maskRiderImage;
    return defaultImage;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && !event.target.closest(".user-menu")) setIsModalOpen(false);
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu")) setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen, isMobileMenuOpen]);

  return (
    <div className="fixed top-0 left-0 w-full px-1 z-50">
      <div className="backdrop-blur-lg bg-gradient-to-r from-blue-600 to-sky-400/95 text-white rounded-md shadow-lg border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                className="h-12 w-12 rounded-lg shadow-sm"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu7nMhqiZLkgWSeS8Y1-Mbs0ILsrgt1S0HRA&s"
                alt="Logo"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold hidden sm:block">ระบบจ่ายยาและคลังยาย่อย</h1>
              <h1 className="text-sm font-bold block sm:hidden">ระบบจ่ายยา</h1>
              <p className="text-xs text-blue-100 hidden sm:block">Pharmacy Management System</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative user-menu">
              <button
                className="flex items-center space-x-3 px-2 py-1 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-105"
                onClick={() => setIsModalOpen(!isModalOpen)}
              >
                {userData ? (
                  <>
                    <img
                      className="h-8 w-8 object-cover rounded-full border-2 border-white/30"
                      src={getUserImage(userData.role)}
                      alt="User Avatar"
                    />
                    <div className="text-left hidden lg:block">
                      <div className="text-sm font-semibold text-white">{`${userData.firstname} ${userData.lastname}`}</div>
                      <div className="text-xs text-blue-100">{userData.role}</div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-white/70 transition-transform duration-200 ${
                        isModalOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                ) : (
                  <>
                    <User className="h-6 w-6 text-white/80" />
                    <span className="text-sm font-semibold text-white">Login</span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/70 transition-transform duration-200 ${
                        isModalOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {isModalOpen && (
                <div className="absolute top-14 right-0 w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-300 opacity-100 scale-100">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">{userData ? "จัดการบัญชี" : "เข้าสู่ระบบ"}</h3>
                  </div>

                  <div className="p-4 space-y-4">
                    {userData ? (
                      <>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            className="h-12 w-12 object-cover rounded-full border-2 border-gray-200"
                            src={getUserImage(userData.role)}
                            alt="User Avatar"
                          />
                          <div>
                            <div className="font-semibold text-gray-800">{`${userData.firstname} ${userData.lastname}`}</div>
                            <div className="text-sm text-gray-500">{userData.role}</div>
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                              ออนไลน์
                            </div>
                          </div>
                        </div>

                        <button
                          className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 font-semibold"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <form className="space-y-2" onSubmit={handleLogin}>
                          <input
                            type="text"
                            name="username"
                            placeholder="ชื่อผู้ใช้"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={loginInfo.username}
                            onChange={(e) => setLoginInfo({ ...loginInfo, username: e.target.value })}
                          />
                          <input
                            type="password"
                            name="password"
                            placeholder="รหัสผ่าน"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={loginInfo.password}
                            onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                          />
                          {errorMessage && (
                            <div className="text-red-500 text-sm text-center font-medium">{errorMessage}</div>
                          )}
                          <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-all duration-200 font-semibold"
                          >
                            เข้าสู่ระบบ
                          </button>
                        </form>
                        {/* <button
                          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-all duration-200 font-semibold"
                          onClick={handleMaskRider}
                        >
                          แค่ไรเดอร์ที่ผ่านทางมา
                        </button> */}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-b-xl">
                    <button
                      className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      onClick={() => setIsModalOpen(false)}
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification + Settings */}
            {isPharmacist && (
              <div className="relative space-x-4">
                <button
                  className="relative p-2 bg-white/15 hover:bg-white/50 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
                  onMouseEnter={() => setShowNotificationTooltip(true)}
                  onMouseLeave={() => setShowNotificationTooltip(false)}
                  onClick={() => (window.location.href = "/notifications")}
                >
                  <Bell className="h-7 w-7 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  className="relative p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
                  onClick={() => (window.location.href = "/settings")}
                >
                  <Settings className="h-7 w-7 text-white" />
                </button>

                {showNotificationTooltip && (
                  <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-300 opacity-100 scale-100">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-blue-600" />
                          การแจ้งเตือน
                        </h3>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {unreadCount} ใหม่
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      {unreadCount > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center text-amber-600">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse" />
                            <span className="font-semibold">คุณมี {unreadCount} การแจ้งเตือนใหม่</span>
                          </div>
                          <p className="text-sm text-gray-600">คลิกเพื่อดูรายละเอียดทั้งหมด</p>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <span>ไม่มีการแจ้งเตือนใหม่</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-b-xl">
                      <a
                        href="/notifications"
                        className="text-center text-sm text-blue-600 hover:text-blue-800 font-semibold block hover:underline transition-colors duration-200"
                      >
                        ดูการแจ้งเตือนทั้งหมด →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="p-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mobile-menu border-t border-white/10 bg-white/5 backdrop-blur-lg">
            <div className="px-6 py-4 space-y-4">
              {userData ? (
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                  <img
                    className="h-10 w-10 object-cover rounded-full border-2 border-white/30"
                    src={getUserImage(userData.role)}
                    alt="User Avatar"
                  />
                  <div>
                    <div className="font-semibold text-white">{`${userData.firstname} ${userData.lastname}`}</div>
                    <div className="text-sm text-blue-100">{userData.role}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-white font-semibold">Guest User</div>
              )}

              {isPharmacist && (
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">การแจ้งเตือน</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {userData ? (
                  <>
                    {isPharmacist && (
                      <a
                        href="/notifications"
                        className="block w-full text-center bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                      >
                        ดูการแจ้งเตือนทั้งหมด
                      </a>
                    )}
                    <button
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all duration-200 font-semibold"
                      onClick={handleLogout}
                    >
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-all duration-200 font-semibold"
                      onClick={handleLogin}
                    >
                      เข้าสู่ระบบในฐานะเภสัชกร
                    </button>
                    {/* <button
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-all duration-200 font-semibold"
                      onClick={handleMaskRider}
                    >
                      แค่ไรเดอร์ที่ผ่านทางมา
                    </button> */}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}