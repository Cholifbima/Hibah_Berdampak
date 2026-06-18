"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BNx2OMK_wcPmI10wTyyfZMFJIzml9d2kRw5mDUna_G3o2NxGqpMYuiYC9M0Ftf47l7IY7BoQFA9qaOeAEdXsiT0';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationBell({ className }: { className?: string }) {
  const { user, token } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl("/notifications"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifs(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Request Push Permission on Mount
  useEffect(() => {
    if (!user || !token || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    
    async function subscribePush() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
          }

          // Send to backend
          await fetch(apiUrl("/notifications/subscribe"), {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(subscription)
          });
        }
      } catch (err) {
        console.error("Gagal mendaftarkan Push Notifications:", err);
      }
    }
    
    subscribePush();
  }, [user, token]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = async (id: number) => {
    if (!token) return;
    try {
      await fetch(apiUrl(`/notifications/${id}/read`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifs(notifs.map(n => n.id_notification === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e) }
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="relative inline-flex items-center justify-center" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className={`relative rounded-full transition-colors ${className || 'text-gray-600 hover:bg-gray-100 p-2'}`}
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute top-[60px] sm:top-full left-4 right-4 sm:left-auto sm:right-0 sm:mt-2 sm:w-80 origin-top sm:origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[10000] overflow-hidden flex flex-col max-h-[85vh]">
          <div className="bg-[#163f73] px-4 py-3 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-white">Notifikasi</h3>
            <span className="text-xs text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">{unreadCount} baru</span>
          </div>
          
          <div className="overflow-y-auto max-h-[60vh] bg-gray-50/50">
            {notifs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <Bell className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Belum ada notifikasi.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifs.map((n) => (
                  <div 
                    key={n.id_notification} 
                    onClick={() => {
                      if (!n.is_read) handleRead(n.id_notification);
                    }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-white' : 'bg-gray-50/80 opacity-75'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 line-clamp-1 mb-0.5">{n.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="mt-1.5 text-[10px] text-gray-400 font-medium">
                          {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {n.link && (
                          <Link href={n.link} className="mt-2 inline-block text-[11px] font-bold text-[#163f73] hover:underline" onClick={() => setOpen(false)}>
                            Lihat Detail →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
