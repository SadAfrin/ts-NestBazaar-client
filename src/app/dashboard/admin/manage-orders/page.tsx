"use client";

import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import { FaClipboardList, FaSearch, FaEye, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Order {
  _id: string;
  productId: string;
  productTitle: string;
  price: number;
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  sellerName: string;
  paymentStatus: string;
  orderStatus: "pending" | "accepted" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

const statusColors: Record<Order["orderStatus"], string> = {
  "pending": "bg-yellow-100 text-yellow-700",
  "accepted": "bg-blue-100 text-blue-700",
  "processing": "bg-purple-100 text-purple-700",
  "shipped": "bg-indigo-100 text-indigo-700",
  "delivered": "bg-green-100 text-green-700",
  "cancelled": "bg-red-100 text-red-700",
};

const statusOptions: Order["orderStatus"][] = ["pending", "accepted", "processing", "shipped", "delivered", "cancelled"];

export default function AdminManageOrdersPage(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error compilation dynamic orders feed:", error);
      toast.error("Failed to fetch platform orders pipeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/orders/status`, {
        method: "PUT",
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, orderStatus: newStatus as any } : order))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus as any } : null);
        }
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating target order state matrix");
    }
  };

  // Filter computation logic block
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.productTitle?.toLowerCase().includes(search.toLowerCase()) ||
      order.buyerName?.toLowerCase().includes(search.toLowerCase()) ||
      order._id?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === "" || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Header section layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
            <FaClipboardList className="text-green-500" size={22} />
            Manage All Orders
          </h1>
          <p className="text-gray-400 text-sm mt-1">Platform wide global tracking configuration panel</p>
        </div>
        <div className="bg-white px-4 py-2 border border-gray-100 rounded-xl text-right shadow-sm self-start sm:self-auto">
          <p className="text-xs font-semibold text-gray-400">Total Filtered</p>
          <p className="text-lg font-black text-green-600">{filteredOrders.length} orders</p>
        </div>
      </div>

      {/* Control Interceptor Filtering Segment */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            placeholder="Search Order ID, Product, Buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-400 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-green-400 cursor-pointer"
        >
          <option value="">All Order Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status} className="capitalize">{status}</option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-green-400 cursor-pointer"
        >
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Render Data Matrix Framework Table */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-bold">Compiling platform order registers...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
          <p className="text-4xl mb-2">📦</p>
          <p className="text-sm font-black text-gray-600">No matching orders identified</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-black text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Order ID / Date</th>
                  <th className="p-4">Product Specs</th>
                  <th className="p-4">Stakeholders Details</th>
                  <th className="p-4">Settlement</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-600">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-black text-gray-800 truncate max-w-[80px]">#{order._id}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800 line-clamp-1 max-w-[150px]">{order.productTitle}</p>
                      <p className="text-green-600 font-black mt-0.5">৳{order.price?.toLocaleString()}</p>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p><span className="text-gray-400 font-bold">B:</span> {order.buyerName}</p>
                      <p><span className="text-gray-400 font-bold">S:</span> {order.sellerName}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                        order.paymentStatus === "paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md capitalize ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      >
                        <FaEye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Management Action Overlay Template */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative space-y-5"
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <FaTimes size={14} />
            </button>

            <div>
              <h3 className="text-base font-black text-gray-800">Order Deep-Dive View</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">ID: {selectedOrder._id}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs divide-y divide-gray-100">
              <div className="flex justify-between pb-2">
                <span className="text-gray-500">Product Title</span>
                <span className="font-bold text-gray-800 text-right max-w-[200px] truncate">{selectedOrder.productTitle}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Total Price</span>
                <span className="font-black text-green-600">৳{selectedOrder.price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Buyer Identity</span>
                <span className="text-gray-700 text-right">{selectedOrder.buyerName} ({selectedOrder.buyerEmail})</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Seller Identity</span>
                <span className="text-gray-700 text-right">{selectedOrder.sellerName} ({selectedOrder.sellerEmail})</span>
              </div>
              <td className="flex justify-between py-2">
                <span className="text-gray-500">Payment Check</span>
                <span className={`text-[10px] font-black rounded-md uppercase ${
                  selectedOrder.paymentStatus === "paid" ? "text-green-600" : "text-red-600"
                }`}>
                  {selectedOrder.paymentStatus}
                </span>
              </td>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Current Status</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md capitalize ${statusColors[selectedOrder.orderStatus]}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600">Override Order Pipeline Status:</p>
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedOrder._id, status)}
                    className={`px-2 py-2 rounded-xl text-[10px] font-black capitalize transition-all ${
                      selectedOrder.orderStatus === status
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center pt-2 font-medium">
                Admin holds structural access privileges to override order tracks
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}