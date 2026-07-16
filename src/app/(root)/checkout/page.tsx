"use client";

import { useState, ChangeEvent, FormEvent, JSX } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  FaShoppingBag, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaShieldAlt 
} from "react-icons/fa";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";

// Type definitions for internal state structures
interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  paymentMethod: "cod" | "card";
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  category: string;
  seller: string;
}

export default function CheckoutPage(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // Mock item context representing selection from a second-hand listing
  const [cartItem] = useState<CartItem>({
    id: "prod-9921",
    title: "iPhone 12 Pro (Excellent Condition)",
    price: 55000,
    category: "Mobile Phones",
    seller: "Nusrat Jahan",
  });

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    shippingAddress: "",
    city: "Dhaka",
    paymentMethod: "cod",
  });

  // Flat calculation metrics
  const platformFee = 150;
  const deliveryCharge = formData.city === "Dhaka" ? 80 : 150;
  const grandTotal = cartItem.price + platformFee + deliveryCharge;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Internal API Order Routing Simulation
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: cartItem.id,
          pricing: {
            itemPrice: cartItem.price,
            platformFee,
            deliveryCharge,
            totalAmount: grandTotal,
          },
          shippingDetails: formData,
        }),
      });

      toast.success("Order placed successfully!");
      router.push("/dashboard/buyer/orders");
      router.refresh();
    } catch (err) {
      console.error("Order checkpoint error:", err);
      toast.error("Failed to process transaction. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Head Header */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl font-black text-gray-900 flex items-center justify-center lg:justify-start gap-3">
            <FaShoppingBag className="text-green-600" size={28} />
            Secure Checkout
          </h1>
          <p className="text-sm text-gray-400 mt-1">Review your second-hand asset details and complete your order</p>
        </div>

        {/* Content Layout Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Shipping Form Section */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-lg font-black text-gray-800 border-b border-gray-100 pb-4 mb-6">
                Shipping & Delivery Details
              </h2>

              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800"
                    />
                  </div>
                </div>

                {/* Email and Phone Grid Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="yourname@domain.com"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* City Selection Dropdown */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800 font-medium"
                  >
                    <option value="Dhaka">Dhaka (Inside City)</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                  </select>
                </div>

                {/* Delivery Street Address Area */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Shipping Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" size={14} />
                    <textarea
                      name="shippingAddress"
                      rows={3}
                      required
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="House number, Street name, Area specifics..."
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800 resize-none"
                    />
                  </div>
                </div>

                {/* Payment Methods Wrapper Core */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Cash on Delivery Selection Option */}
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "cod" }))}
                      className={`border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                        formData.paymentMethod === "cod" 
                          ? "border-green-500 bg-green-50/40" 
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        formData.paymentMethod === "cod" ? "border-green-500 text-green-500" : "border-gray-300"
                      }`}>
                        {formData.paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      </div>
                      <FaMoneyBillWave className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm font-black text-gray-800">Cash on Delivery</p>
                        <p className="text-xs text-gray-400">Pay inside Bangladesh on delivery</p>
                      </div>
                    </div>

                    {/* Online Card Selection Option */}
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "card" }))}
                      className={`border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                        formData.paymentMethod === "card" 
                          ? "border-green-500 bg-green-50/40" 
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        formData.paymentMethod === "card" ? "border-green-500 text-green-500" : "border-gray-300"
                      }`}>
                        {formData.paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      </div>
                      <FaCreditCard className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm font-black text-gray-800">Digital Card Payment</p>
                        <p className="text-xs text-gray-400">Visa, Mastercard, Amex, SSLCommerz</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Checkout Submission Button Action Component */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:shadow-xl transition-all"
                  >
                    {loading ? "Processing Order Configuration..." : `Confirm Purchase • ৳${grandTotal.toLocaleString()}`}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>

          {/* Right Column: Dynamic Price Summary / Order Context Panel */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24"
            >
              <h2 className="text-lg font-black text-gray-800 border-b border-gray-100 pb-4 mb-4">
                Order Summary
              </h2>

              {/* Verified Product Target Listing Spec Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 mb-6">
                <span className="text-[10px] font-bold text-green-600 bg-white px-2 py-1 border border-green-100/60 rounded-full inline-block mb-2">
                  {cartItem.category}
                </span>
                <h3 className="font-black text-gray-800 text-base leading-tight mb-1">{cartItem.title}</h3>
                <p className="text-xs text-gray-400">Listed Seller: <span className="font-semibold text-gray-600">{cartItem.seller}</span></p>
                <div className="border-t border-gray-200/40 my-3" />
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item Price</p>
                  <p className="font-black text-gray-800 text-base">৳{cartItem.price.toLocaleString()}</p>
                </div>
              </div>

              {/* Price Calculation Metric Lines Stack */}
              <div className="space-y-3 px-1 mb-6">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-400 font-medium">Subtotal Listing Cost</p>
                  <p className="font-bold text-gray-700">৳{cartItem.price.toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-400 font-medium">Platform Escrow Fee</p>
                  <p className="font-bold text-gray-700">৳{platformFee}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-400 font-medium">Fulfillment Logistics Charge</p>
                  <p className="font-bold text-gray-700">৳{deliveryCharge}</p>
                </div>
                
                <div className="border-t border-dashed border-gray-200 my-4" />
                
                <div className="flex justify-between items-center">
                  <p className="font-black text-gray-900 text-base">Grand Total</p>
                  <p className="font-black text-2xl text-gradient bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ৳{grandTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bottom Encrypted Platform Assurance Badge */}
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
                <FaShieldAlt className="text-emerald-600 flex-shrink-0" size={18} />
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Your funds are held safely with NestBazaar Escrow and will only be released to the seller after successful package verification.
                </p>
              </div>

            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
}