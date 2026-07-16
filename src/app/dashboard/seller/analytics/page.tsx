"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { FaChartBar, FaBoxOpen, FaCheckCircle, FaDollarSign, FaClock } from "react-icons/fa";

interface MonthlySalesData {
  month: string;
  sales: number;
  revenue: number;
}

interface TopProductData {
  name: string;
  sales: number;
}

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

// Fake data for charts (will be replaced with real data after orders are built)
const monthlySales: MonthlySalesData[] = [
  { month: \"Jan\", sales: 4, revenue: 120000 },
  { month: \"Feb\", sales: 6, revenue: 185000 },
  { month: \"Mar\", sales: 3, revenue: 95000 },
  { month: \"Apr\", sales: 8, revenue: 240000 },
  { month: \"May\", sales: 5, revenue: 155000 },
  { month: \"Jun\", sales: 10, revenue: 310000 },
];

const topProducts: TopProductData[] = [
  { name: \"iPhone 14 Pro\", sales: 5 },
  { name: \"Sony Headphones\", sales: 3 },
  { name: \"Samsung S23\", sales: 4 },
  { name: \"MacBook Air\", sales: 2 },
];

const orderStatusData: OrderStatusData[] = [
  { name: \"Delivered\", value: 65, color: \"#10b981\" },
  { name: \"Processing\", value: 20, color: \"#a855f7\" },
  { name: \"Pending\", value: 10, color: \"#eab308\" },
  { name: \"Cancelled\", value: 5, color: \"#ef4444\" },
];

export default function SellerAnalyticsPage(): JSX.Element {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate data loading transition framework
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-gray-400 font-bold">Compiling metric engine reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
          <FaChartBar className="text-green-500" size={24} />
          Business Insights & Analytics
        </h1>
        <p className="text-gray-400 text-sm mt-1">Track store item yield pipelines and dynamic metrics performance statistics</p>
      </div>

      {/* Top Cards Statistics Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: \"Total Revenue\", value: \"৳1,105,000\", desc: \"+18.4% from last month\", icon: <FaDollarSign className="text-green-600" size={16} />, bg: \"bg-green-50\" },
          { title: \"Products Sold\", value: \"36 Items\", desc: \"Across 4 categories\", icon: <FaBoxOpen className="text-blue-600" size={16} />, bg: \"bg-blue-50\" },
          { title: \"Success Rate\", value: \"94.2%\", desc: \"Fulfillment standard logs\", icon: <FaCheckCircle className="text-purple-600" size={16} />, bg: \"bg-purple-50\" },
          { title: \"Pending Orders\", value: \"3 Pipeline\", desc: \"Requires immediate package dispatch\", icon: <FaClock className="text-yellow-600" size={16} />, bg: \"bg-yellow-50\" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-gray-200 transition-all"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-xl font-black text-gray-800">{card.value}</h3>
              <p className="text-[10px] font-semibold text-gray-400">{card.desc}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0 shadow-xs`}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Primary Analytics Charts Node Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Revenue Line Visualization Graph Container Node */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-8"
        >
          <div className="mb-4">
            <h3 className="font-black text-gray-800 text-sm">Revenue Over Time</h3>
            <p className="text-[11px] text-gray-400">Dynamic periodic cash flow tracking index indicators</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlySales} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }} tickFormatter={(val) => `৳${val / 1000}k`} />
              <Tooltip
                formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Volume Performance Bar Segment Node */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-4"
        >
          <div className="mb-4">
            <h3 className="font-black text-gray-800 text-sm">Sales Volume</h3>
            <p className="text-[11px] text-gray-400">Monthly package transfer items frequency rates</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Secondary Analytic Row Widgets Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Horizontal Bar Chart Node: Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-7"
        >
          <div className="mb-4">
            <h3 className="font-black text-gray-800 text-sm">Top Performance Catalog Items</h3>
            <p className="text-[11px] text-gray-400">Products with the highest inventory turnover velocity logs</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600 }} width={110} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="sales" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Status Tracking Pie Component Panel Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-5"
        >
          <div className="mb-4">
            <h3 className="font-black text-gray-800 text-sm">Order Status Metrics</h3>
            <p className="text-[11px] text-gray-400">Overview share partition metrics mapped tracking entities</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
              <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}