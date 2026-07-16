"use client";

import { useEffect, useState, use, JSX } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaArrowLeft, 
  FaShoppingCart, 
  FaHeart, 
  FaStar 
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { toast } from "react-toastify";
import { useSession } from "@/lib/auth-client";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import ReviewSection from "@/components/review/ReviewSection";

// Data structures interface contracts 
interface SellerInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  condition: "Like New" | "Good" | "Refurbished";
  category: string;
  description: string;
  images?: string[];
  sellerInfo?: SellerInfo;
}

interface SellerProfile {
  name: string;
  email: string;
  photo?: string;
  phone?: string;
  location?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const conditionColors: Record<Product["condition"], string> = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Refurbished": "bg-orange-100 text-orange-700",
};

export default function ProductDetailsPage({ params }: PageProps): JSX.Element {
  // Safe unwrap for async params block in Next.js 15
  const { id } = use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const { data: session } = useSession();

  // Fetch core item listing metadata stream
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch product target profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  // Fetch verified vendor identity profile mapping
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!product?.sellerInfo?.email) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/check?email=${product.sellerInfo.email}`
        );
        const data = await res.json();
        if (data.exists) {
          setSellerProfile(data.user);
        }
      } catch (error) {
        console.error("Seller account routing tracking issue:", error);
      }
    };
    if (product) {
      fetchSellerProfile();
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-xl font-black text-gray-700">Product listings empty</p>
        <Button
          onClick={() => router.push("/products")}
          className="mt-4 bg-green-500 text-white font-bold rounded-2xl shadow-sm"
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Action Trigger */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors mb-8 font-semibold text-sm group"
        >
          <FaArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Products
        </button>

        {/* Master Resource Split Layout View Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Wing Carousel Media Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="relative h-96 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-300 text-sm font-medium">Asset Missing Preview</span>
              )}
              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm ${conditionColors[product.condition] || "bg-gray-100 text-gray-700"}`}>
                {product.condition}
              </span>
            </div>

            {/* Thumbnail Navigation Array */}
            {product.images && product.images.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-0.5 bg-white ${
                      selectedImage === index
                        ? "border-green-500 shadow-md scale-95"
                        : "border-gray-100 hover:border-green-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Wing Context Specification Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100 inline-block uppercase tracking-wider">
              {product.category}
            </span>

            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-4">
              <p className="text-4xl font-black text-green-600">
                ৳{product.price?.toLocaleString()}
              </p>
            </div>

            {/* Static Item Spec Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wider">Description</h3>
              <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Author / Seller Information Context Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">Seller Information</h3>
              <div className="flex items-center gap-4">
                {sellerProfile?.photo ? (
                  <img
                    src={sellerProfile.photo}
                    alt={sellerProfile.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-green-100 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {(sellerProfile?.name || product.sellerInfo?.name || "U").charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-gray-800 text-base">
                      {sellerProfile?.name || product.sellerInfo?.name}
                    </p>
                    <MdVerified className="text-green-500" size={16} />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" size={11} />
                    ))}
                    <span className="text-xs font-bold text-gray-400 ml-1.5">5.0</span>
                  </div>
                </div>
              </div>

              {/* Contacts Line Stack Container */}
              <div className="space-y-2.5 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaEnvelope className="text-green-500 flex-shrink-0" size={13} />
                  <span className="truncate">{sellerProfile?.email || product.sellerInfo?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaPhone className="text-green-500 flex-shrink-0" size={13} />
                  <span>
                    {sellerProfile?.phone || product.sellerInfo?.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaMapMarkerAlt className="text-green-500 flex-shrink-0" size={13} />
                  <span>
                    {sellerProfile?.location || product.sellerInfo?.location || "Bangladesh"}
                  </span>
                </div>
              </div>
            </div>

            {/* User Interaction Routing Control Center Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">

              {/* Order Transaction Execution Button Component */}
              <Button
                disabled={orderLoading}
                onClick={async () => {
                  if (!session) {
                    toast.warn("Please login to place an order!");
                    router.push("/login");
                    return;
                  }
                  setOrderLoading(true);
                  try {
                    const roleRes = await fetch(
                      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/role?email=${session.user?.email}`
                    );
                    const roleData = await roleRes.json();
                    
                    if (roleData.role === "admin" || roleData.role === "seller") {
                      toast.warn("Only buyers can place orders!");
                      return;
                    }

                    router.push(`/checkout?productId=${product._id}`);
                  } catch (error) {
                    console.error(error);
                    toast.error("Something went wrong processing order verification details.");
                  } finally {
                    setOrderLoading(false);
                  }
                }}
                className="flex-1 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:shadow-xl transition-all"
              >
                {orderLoading ? "Processing..." : (
                  <span className="flex items-center justify-center gap-2">
                    <FaShoppingCart size={14} /> Place Order
                  </span>
                )}
              </Button>

              {/* Wishlist Tracking Interceptor Item Toggle Component */}
              <Button
                variant="bordered"
                disabled={wishlistLoading}
                onClick={async () => {
                  if (!session) {
                    toast.warn("Please login to add to wishlist!");
                    router.push("/login");
                    return;
                  }
                  setWishlistLoading(true);
                  try {
                    const roleRes = await fetch(
                      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/role?email=${session.user?.email}`
                    );
                    const roleData = await roleRes.json();

                    if (roleData.role === "admin" || roleData.role === "seller") {
                      toast.warn("Only buyers can add to wishlist!");
                      return;
                    }

                    await fetchWithAuth(
                      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/wishlist`,
                      {
                        method: "POST",
                        body: JSON.stringify({
                          email: session.user?.email,
                          productId: product._id,
                        }),
                      }
                    );
                    toast.success("Added to wishlist!");
                  } catch (error) {
                    console.error(error);
                    toast.error("Failed to add component to database wishlist mapping!");
                  } finally {
                    setWishlistLoading(false);
                  }
                }}
                className="border-2 border-green-500 text-green-600 font-bold rounded-2xl hover:bg-green-50/50 transition-all py-6 px-6"
              >
                {wishlistLoading ? "Adding..." : (
                  <span className="flex items-center justify-center gap-2">
                    <FaHeart size={13} /> Wishlist
                  </span>
                )}
              </Button>

            </div>

          </motion.div>
        </div>

        {/* Review Management Section Component Mounting Anchor */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <ReviewSection productId={id} />
        </div>

      </div>
    </div>
  );
}