"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { FaHeart, FaTrash, FaEye, FaShoppingBag, FaMapMarkerAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface SellerInfo {
  name: string;
  email: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  condition: "Like New" | "Good" | "Refurbished";
  location?: string;
  images?: string[];
  sellerInfo?: SellerInfo;
}

interface WishlistItem {
  _id: string;
  productId: Product;
}

const conditionColors: Record<Product["condition"], string> = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Refurbished": "bg-orange-100 text-orange-700",
};

export default function WishlistPage(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWishlist = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/wishlist?email=${session.user.email}`
      );
      const data = await res.json();
      if (data.success) setWishlist(data.data);
    } catch (error) {
      console.error("Failed to compile buyer wishlist register data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [session]);

  const handleRemove = async (productId: string) => {
    if (!session?.user?.email) return;
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/wishlist?email=${session.user.email}&productId=${productId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Removed from wishlist!");
        setWishlist((prev) => prev.filter((item) => item.productId?._id !== productId));
      } else {
        toast.error("Failed to remove item!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
          <FaHeart className="text-red-500" size={22} />
          My Wishlist
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Monitor your bookmarked items and favorite collection items
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-bold">Assembling favorite catalog manifests...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
          <p className="text-4xl mb-3">❤️</p>
          <h3 className="font-black text-gray-700 text-base">Your Wishlist is Empty</h3>
          <p className="text-gray-400 text-xs mt-1 mb-5">
            Save items that you want to check out later or keep tracking
          </p>
          <Button
            as={Link}
            href="/products"
            className="bg-green-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md"
          >
            Discover Products
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {wishlist.map((item, index) => {
            const product = item.productId;
            if (!product) return null; // Defensive layer block node against empty/deleted pipeline entities

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all"
              >
                {/* Product Layout details */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${conditionColors[product.condition] || "bg-gray-100 text-gray-700"}`}>
                        {product.condition}
                      </span>
                      <div className="flex items-center gap-0.5 text-gray-400 text-xs pl-1">
                        <FaMapMarkerAlt size={10} className="text-gray-400" />
                        <span className="truncate max-w-[120px]">{product.location || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller & Monetary calculation segment maps */}
                <div className="flex flex-row md:flex-col items-center md:items-start justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
                  <div className="text-left">
                    <p className="font-black text-green-600 text-base">
                      ৳{product.price?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MdVerified className="text-green-500 shrink-0" size={11} />
                      <p className="text-[11px] text-gray-400 truncate max-w-[110px]">
                        {product.sellerInfo?.name || "Verified Seller"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operations Action Segment Nodes wrapper */}
                <div className="hidden md:block w-px h-14 bg-gray-200"></div>
                <div className="flex items-center gap-6 justify-end w-full md:w-auto pt-2 md:pt-0">
                  <Link href={`/products/${product._id}`}>
                    <button
                      className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-all"
                      title="View Details"
                    >
                      <FaEye size={13} />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      toast.info("Redirecting to product!");
                      router.push(`/products/${product._id}`);
                    }}
                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-all"
                    title="Place Order"
                  >
                    <FaShoppingBag size={13} />
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-all"
                    title="Remove"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}