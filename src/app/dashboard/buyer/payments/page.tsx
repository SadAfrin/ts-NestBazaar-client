"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Payment {
  _id: string;
  transactionId: string;
  paymentDate?: string;
  createdAt: string;
  paymentMethod?: string;
  amount: number;
  paymentStatus: "success" | "pending" | "failed";
}

const statusColors: Record<Payment["paymentStatus"], string> = {
  "success": "bg-green-100 text-green-700",
  "pending": "bg-yellow-100 text-yellow-700",
  "failed": "bg-red-100 text-red-700",
};

const statusIcons: Record<Payment["paymentStatus"], JSX.Element> = {
  "success": <FaCheckCircle className="text-green-500" size={13} />,
  "pending": <FaClock className="text-yellow-500" size={13} />,
  "failed": <FaTimesCircle className="text-red-500" size={13} />,
};

export default function PaymentHistoryPage(): JSX.Element {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payments?email=${session?.user?.email}`
        );
        const data = await res.json();
        if (data.success) {
          setPayments(data.data);
        }
      } catch (error) {
        console.error("Failed to compile target customer payment statement stack:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [session]);

  return (
    <div className="space-y-6">
      {/* Header Profile Info View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
            <FaCreditCard className="text-green-500" size={22} />
            Payment History
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review your settlement transcripts and receipts</p>
        </div>
        <div className="bg-white px-4 py-2 border border-gray-100 rounded-xl text-right shadow-sm self-start sm:self-auto">
          <p className="text-xs font-semibold text-gray-400">Total Spent</p>
          <p className="text-lg font-black text-green-600">
            ৳{payments
              .filter((p) => p.paymentStatus === "success")
              .reduce((acc, curr) => acc + (curr.amount || 0), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Render Table Data Matrix */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-bold">Compiling cloud gateway logs...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
          <p className="text-4xl mb-2">💳</p>
          <p className="text-sm font-black text-gray-600">No payment records identified yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header mapping desk views */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50/70 px-6 py-3.5 border-b border-gray-100 text-xs font-black text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Transaction ID</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Method</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-3">Status</div>
          </div>

          {/* Table Rows Body Content Feed */}
          <div className="divide-y divide-gray-50">
            {payments.map((payment, index) => (
              <div
                key={payment._id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-gray-50/40 transition-colors ${
                  index !== payments.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="col-span-3">
                  <span className="text-[10px] uppercase font-black text-gray-400 md:hidden block mb-0.5">Transaction ID</span>
                  <p className="text-xs font-bold text-gray-700 truncate">
                    {payment.transactionId}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-black text-gray-400 md:hidden block mb-0.5">Date</span>
                  <p className="text-xs text-gray-500">
                    {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-black text-gray-400 md:hidden block mb-0.5">Method</span>
                  <span className="text-xs font-bold text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded-lg inline-block md:inline">
                    {payment.paymentMethod || "stripe"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-black text-gray-400 md:hidden block mb-0.5">Amount</span>
                  <p className="font-black text-green-600 text-sm">
                    ৳{payment.amount?.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-3">
                  <span className="text-[10px] uppercase font-black text-gray-400 md:hidden block mb-0.5">Status</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md capitalize flex items-center gap-1.5 w-fit ${statusColors[payment.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                    {statusIcons[payment.paymentStatus]}
                    {payment.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}