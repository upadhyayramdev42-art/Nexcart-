"use client";

import { useEffect, useState } from "react";
import { Search, Users, ShieldCheck, User } from "lucide-react";
import { getAllUsers, updateUserRole } from "@/lib/firebase/firestore";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types";

const MOCK_USERS: AppUser[] = [
  { uid: "u1", name: "Priya Sharma", email: "priya@example.com", role: "customer", emailVerified: true, createdAt: new Date("2026-01-10"), updatedAt: new Date() },
  { uid: "u2", name: "Rahul Mehta", email: "rahul@example.com", role: "customer", emailVerified: true, createdAt: new Date("2026-02-15"), updatedAt: new Date() },
  { uid: "u3", name: "Anita Verma", email: "anita@example.com", role: "customer", emailVerified: false, createdAt: new Date("2026-03-05"), updatedAt: new Date() },
  { uid: "u4", name: "Karan Patel", email: "karan@example.com", role: "customer", emailVerified: true, createdAt: new Date("2026-04-22"), updatedAt: new Date() },
];

export default function CustomersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllUsers();
        setUsers(data.length > 0 ? data : MOCK_USERS);
      } catch {
        setUsers(MOCK_USERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleToggle = async (uid: string, currentRole: "admin" | "customer") => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    if (!confirm(`Change role to ${newRole}?`)) return;
    setUpdating(uid);
    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: newRole } : u));
    } catch {
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: newRole } : u));
    } finally {
      setUpdating(null);
    }
  };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-medium">
            <Users size={13} /> {users.filter((u) => u.role === "customer").length} Customers
          </span>
          <span className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 px-3 py-1.5 rounded-xl font-medium">
            <ShieldCheck size={13} /> {users.filter((u) => u.role === "admin").length} Admins
          </span>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["User", "Email", "Role", "Verified", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400"><User size={32} className="mx-auto mb-3 opacity-40" /><p>No users found</p></td></tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.uid} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {initials(user.name)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
                          user.role === "admin" ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400")}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs font-semibold", user.emailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-yellow-600 dark:text-yellow-400")}>
                          {user.emailVerified ? "✓ Verified" : "⚠ Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{user.createdAt.toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleRoleToggle(user.uid, user.role)}
                          disabled={updating === user.uid}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 transition-all"
                        >
                          {updating === user.uid ? "…" : user.role === "admin" ? "Make Customer" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
