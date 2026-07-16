"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaHeart, FaCreditCard, FaBoxOpen } from "react-icons/fa";
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

interface BuyerStats {
  totalOrders: number;
  wishlistCount: number;
  totalSpent: number;
  recentPurchases: number;
}

interface RecentOrder {
  _id: string;
  sellerInfo: {
    name: string;
  };
  amount: number;
  createdAt: string;
  orderStatus: OrderStatus;
}

export default function BuyerOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<BuyerStats>({
    totalOrders: 0,
    wishlistCount: 0,
    totalSpent: 0,
    recentPurchases: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/buyer/stats`);
        if (res.success) {
          setStats(res.stats);
          setRecentOrders(res.recentOrders);
        }
      } catch (error) {
        console.error("Error fetching buyer stats:", error);
      }
    };
    if (session) fetchStats();
  }, [session]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">
          Welcome back, <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">{session?.user?.name || "User"}</span>!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your orders, check wishlist, and monitor marketplace shopping activity.</p>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Orders", value: stats.totalOrders, icon: <FaShoppingBag size={20} />, color: "from-blue-500 to-blue-600", bg: "bg-blue-50/60" },
          { label: "Wishlist Items", value: stats.wishlistCount, icon: <FaHeart size={20} />, color: "from-pink-500 to-pink-600", bg: "bg-pink-50/60" },
          { label: "Total Spent", value: `৳${stats.totalSpent.toLocaleString()}`, icon: <FaCreditCard size={20} />, color: "from-green-500 to-green-600", bg: "bg-green-50/60" },
          { label: "Recent Purchases", value: stats.recentPurchases, icon: <FaBoxOpen size={20} />, color: "from-purple-500 to-purple-600", bg: "bg-purple-50/60" },
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

      {/* Activity Overview */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <FaBoxOpen size={18} />
            </div>
            <div>
              <h2 className="font-black text-gray-800 text-lg">My Recent Orders</h2>
              <p className="text-gray-400 text-xs mt-0.5">Review the tracking statuses and records of your current orders.</p>
            </div>
          </div>
          <Link href="/dashboard/buyer/orders" className="text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 font-medium text-sm">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-50 rounded-2xl bg-gray-50/30 hover:bg-white hover:border-gray-100 hover:shadow-md transition-all duration-200 gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                    <FaShoppingBag size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      Order #{order._id?.toString().slice(-6).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MdVerified className="text-green-500" size={11} />
                      <p className="text-xs text-gray-400">{order.sellerInfo?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  <div className="text-right">
                    <p className="font-black text-green-600 text-sm">
                      ৳{order.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric"
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}