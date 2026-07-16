"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaBoxOpen, FaShoppingBag, FaDollarSign, FaUserPlus, FaClipboardList, FaTruck } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

type OrderStatus = "pending" | "accepted" | "processing" | "shipped" | "delivered" | "cancelled";

const statusColors: Record<OrderStatus, string> = {
  "pending": "bg-yellow-100 text-yellow-700",
  "accepted": "bg-blue-100 text-blue-700",
  "processing": "bg-purple-100 text-purple-700",
  "shipped": "bg-indigo-100 text-indigo-700",
  "delivered": "bg-green-100 text-green-700",
  "cancelled": "bg-red-100 text-red-700",
};

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  _id: string;
  buyerInfo: {
    name: string;
  };
  amount: number;
  createdAt: string;
  orderStatus: OrderStatus;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: "active" | "blocked";
  image?: string;
}

export default function AdminOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/stats`);
        if (res.success) {
          setStats(res.stats);
          setRecentOrders(res.recentOrders);
          setRecentUsers(res.recentUsers);
        }
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
      }
    };
    if (session) fetchStats();
  }, [session]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Admin Panel Welcome */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">
          Admin Operations, <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">{session?.user?.name || "Administrator"}</span>!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Platform management systems and active control metrics dashboard panel.</p>
      </div>

      {/* Global Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Global Users", value: stats.totalUsers, icon: <FaUsers size={20} />, color: "from-blue-500 to-blue-600", bg: "bg-blue-50/60" },
          { label: "Active Listings", value: stats.totalProducts, icon: <FaBoxOpen size={20} />, color: "from-purple-500 to-purple-600", bg: "bg-purple-50/60" },
          { label: "Total Platform Orders", value: stats.totalOrders, icon: <FaShoppingBag size={20} />, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50/60" },
          { label: "Total GMV Volume", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: <FaDollarSign size={20} />, color: "from-amber-500 to-amber-600", bg: "bg-amber-50/60" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={`${card.bg} border border-gray-100 rounded-3xl p-6 flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-black text-gray-800 mt-2">{card.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two-Column split tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders Side */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <FaClipboardList size={18} />
              </div>
              <div>
                <h2 className="font-black text-gray-800 text-base">Global Recent Orders</h2>
                <p className="text-gray-400 text-[11px] mt-0.5">Monitor system-wide platform transactional streams.</p>
              </div>
            </div>
            <Link href="/dashboard/admin/manage-orders" className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition-colors">
              View
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-gray-400 font-medium text-xs">No orders recorded globally.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl bg-gray-50/20 hover:bg-white transition-all gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                      <FaTruck size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-xs">
                        Order #{order._id?.toString().slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{order.buyerInfo?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-black text-purple-600 text-xs">৳{order.amount?.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations Side */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FaUserPlus size={18} />
              </div>
              <div>
                <h2 className="font-black text-gray-800 text-base">New Platform Signups</h2>
                <p className="text-gray-400 text-[11px] mt-0.5">Audit recently created platform user profiles.</p>
              </div>
            </div>
            <Link href="/dashboard/admin/manage-users" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">
              Manage
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-gray-400 font-medium text-xs">No user signups found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl bg-gray-50/20 hover:bg-white transition-all gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-gray-800 text-xs truncate max-w-[100px]">{user.name}</p>
                        <MdVerified className="text-green-500" size={11} />
                      </div>
                      <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize ${
                      user.role === "admin" ? "bg-purple-100 text-purple-700" :
                      user.role === "seller" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {user.role}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize ${
                      user.status === "blocked" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {user.status || "active"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}