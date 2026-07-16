"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import { FaClipboardList, FaEye, FaCheck, FaTimes, FaTruck, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface OrderItem {
  _id: string;
  orderId: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  };
  buyerName: string;
  buyerEmail: string;
  amount: number;
  orderStatus: "pending" | "accepted" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: string;
  createdAt: string;
  paymentDate?: string;
}

const statusColors: Record<OrderItem["orderStatus"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ManageOrdersPage(): JSX.Element {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/seller?email=${session?.user?.email}`
      );
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch seller pipeline tracking telemetry registry orders:", error);
    } {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) fetchOrders();
  }, [session]);

  const handleUpdateStatus = async (orderId: string, status: OrderItem["orderStatus"]) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ orderId, status }),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success(`Order marked as ${status} successfully!`);
        // Real-time synchronization within standard local records array mapping block
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, orderStatus: status } : order))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: status } : null));
        }
      } else {
        toast.error(data.message || "Failed to alter package tracking records state");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
          <FaClipboardList className="text-green-500" size={24} />
          Incoming Customer Orders
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage purchase tracking steps, fulfillment states and verification logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table/List View Panel Section Node */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-7">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50 hidden md:grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-5">Product Info</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Payout</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm font-medium">
              No product purchase transaction sequences recorded inside your listing stack directory.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-all ${
                    selectedOrder?._id === order._id ? "bg-green-50/40 border-l-4 border-green-500 pl-4" : ""
                  }`}
                >
                  {/* Info Node layout parameter components */}
                  <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0">
                      <img
                        src={order.productId?.images?.[0] || "https://via.placeholder.com/150"}
                        alt={order.productId?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate min-w-0">
                      <p className="text-sm font-black text-gray-800 truncate">{order.productId?.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize inline-block mt-1 ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer parameter info rows */}
                  <div className="col-span-1 md:col-span-3 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{order.buyerName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{order.buyerEmail}</p>
                  </div>

                  {/* Pricing logic block indicator tags */}
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm font-black text-green-600">৳{order.amount?.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">{order.paymentStatus}</p>
                  </div>

                  {/* Interface button trigger events controls */}
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-green-500 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <FaEye size={12} /> Inspect
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Sidebar inspector modal view block panel component */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <motion.div
              layoutId={selectedOrder._id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 sticky top-6"
            >
              <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                <div>
                  <h3 className="font-black text-gray-800 text-base">Fulfillment Hub</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Reference ID: <span className="font-mono text-gray-600 uppercase">{selectedOrder._id.slice(-12)}</span></p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all text-xs font-bold"
                >
                  Dismiss
                </button>
              </div>

              {/* Specs parameters logs rows inside panel layout */}
              <div className="space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Product item:</span>
                  <span className="text-gray-700 font-black truncate max-w-[200px]">{selectedOrder.productId?.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Customer designation:</span>
                  <span className="text-gray-700 font-bold">{selectedOrder.buyerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Billing parameter:</span>
                  <span className="text-green-600 font-black">৳{selectedOrder.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Package track logs:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md capitalize ${statusColors[selectedOrder.orderStatus]}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* Status workflow automation buttons array control deck context validation layer */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Execute State Progression Operations</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.orderStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, "accepted")}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                      >
                        <FaCheck size={11} /> Accept Order
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, "cancelled")}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all"
                      >
                        <FaTimes size={11} /> Cancel
                      </button>
                    </>
                  )}

                  {selectedOrder.orderStatus === "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "processing")}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-all col-span-2 shadow-md"
                    >
                      <FaBoxOpen size={11} /> Process Logistics Package
                    </button>
                  )}

                  {selectedOrder.orderStatus === "processing" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "shipped")}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all col-span-2 shadow-md"
                    >
                      <FaTruck size={11} /> Mark as Shipped
                    </button>
                  )}

                  {selectedOrder.orderStatus === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "delivered")}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all col-span-2 shadow-md"
                    >
                      <FaCheck size={11} /> Confirm Delivery Completion
                    </button>
                  )}

                  {(selectedOrder.orderStatus === "delivered" || selectedOrder.orderStatus === "cancelled") && (
                    <div className="col-span-2 text-center py-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold">
                        Order status finalized as <span className="underline capitalize">{selectedOrder.orderStatus}</span>.<br /> No remaining state tasks are active.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden lg:block border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400 text-xs font-bold">
              Select any specific customer catalog purchase block sequence item to trigger context pipeline operations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}