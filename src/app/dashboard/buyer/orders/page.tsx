"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaBoxOpen, FaTimes, FaEye } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Link from "next/link";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Order {
  _id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  price: number;
  sellerName: string;
  sellerEmail: string;
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

const statusSteps: Exclude<Order["orderStatus"], "cancelled">[] = ["pending", "accepted", "processing", "shipped", "delivered"];

const stepIcons: Record<Exclude<Order["orderStatus"], "cancelled">, JSX.Element> = {
  "pending": <FaClock size={14} />,
  "accepted": <FaCheckCircle size={14} />,
  "processing": <FaBoxOpen size={14} />,
  "shipped": <FaTruck size={14} />,
  "delivered": <FaCheckCircle size={14} />,
};

export default function BuyerOrdersPage(): JSX.Element {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  const fetchOrders = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/buyer?email=${session.user.email}`
      );
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to compile buyer orders track list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/cancel`,
        {
          method: "POST",
          body: JSON.stringify({ orderId: selectedOrder._id }),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success("Order cancelled successfully!");
        setOrders((prev) =>
          prev.map((order) =>
            order._id === selectedOrder._id ? { ...order, orderStatus: "cancelled" } : order
          )
        );
        setSelectedOrder((prev) => prev ? { ...prev, orderStatus: "cancelled" } : null);
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
          <FaShoppingBag className="text-green-500" size={22} />
          My Orders
        </h1>
        <p className="text-gray-400 text-sm mt-1">Track your product purchase pipeline histories</p>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-bold">Compiling your order manifests...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
          <p className="text-4xl mb-3">📦</p>
          <h3 className="font-black text-gray-700 text-base">No Orders Found</h3>
          <p className="text-gray-400 text-xs mt-1 mb-5">You haven&apos;t placed any livestock or product orders yet</p>
          <Button
            as={Link}
            href="/products"
            className="bg-green-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md"
          >
            Explore Products
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Order Details</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-600">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                        {order.productImage && (
                          <img src={order.productImage} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-1 max-w-[180px]">
                          {order.productTitle}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          ID: #{order._id?.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <MdVerified className="text-green-500" size={12} />
                        <p className="font-semibold text-gray-700">{order.sellerName}</p>
                      </div>
                      <p className="text-[10px] text-gray-400">{order.sellerEmail}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-gray-800">৳{order.price?.toLocaleString()}</p>
                      <span className="text-[9px] uppercase font-bold text-green-600 bg-green-50 px-1 rounded">
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
                        title="Track Order"
                      >
                        <FaEye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Overlay Sheet / Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative space-y-5"
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <FaTimes size={14} />
            </button>

            <div>
              <h3 className="text-base font-black text-gray-800">Order Lifetrack Viewer</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Manifest Identifier: {selectedOrder._id}</p>
            </div>

            {/* Micro Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl text-xs">
              <div>
                <p className="text-gray-400">Product Title</p>
                <p className="font-bold text-gray-700 truncate">{selectedOrder.productTitle}</p>
              </div>
              <div>
                <p className="text-gray-400">Settled Amount</p>
                <p className="font-black text-green-600">৳{selectedOrder.price?.toLocaleString()}</p>
              </div>
            </div>

            {/* Visualizer Pipeline Track Stepper */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-gray-600">Live Delivery Stepper Route:</p>

              <div className="flex items-center justify-between w-full pt-2">
                {selectedOrder.orderStatus === "cancelled" ? (
                  <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 p-3 rounded-xl w-full justify-center text-xs">
                    <FaTimesCircle size={16} />
                    <span>This package channel tracking has been cancelled</span>
                  </div>
                ) : (
                  statusSteps.map((step, index) => {
                    const currentIndex = statusSteps.indexOf(selectedOrder.orderStatus as any);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={step} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center relative flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? "bg-green-500 text-white shadow-md shadow-green-200 ring-4 ring-green-100"
                              : isCompleted
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {stepIcons[step]}
                          </div>
                          <span className={`text-[9px] font-black capitalize mt-1.5 ${
                            isCurrent ? "text-green-600" : isCompleted ? "text-gray-700" : "text-gray-400"
                          }`}>
                            {step}
                          </span>
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={`flex-1 h-1 mx-1 rounded-full mb-4 ${
                            index < currentIndex ? "bg-green-400" : "bg-gray-200"
                          }`} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cancel Control Panel Node */}
            {(selectedOrder.orderStatus === "pending" ||
              selectedOrder.orderStatus === "accepted" ||
              selectedOrder.orderStatus === "processing") && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full mt-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all text-sm disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}

            {/* Block Node Actions */}
            {(selectedOrder.orderStatus === "shipped" ||
              selectedOrder.orderStatus === "delivered") && (
              <div className="mt-4 py-3 bg-gray-50 rounded-2xl text-center">
                <p className="text-xs text-gray-400 font-bold">
                  Order cannot be cancelled after shipment
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}