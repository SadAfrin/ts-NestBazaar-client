"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaTag, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface ProductItem {
  _id: string;
  title: string;
  price: number;
  category: string;
  condition: "Like New" | "Good" | "Refurbished" | string;
  status: "available" | "sold" | "pending" | string;
  images?: string[];
}

const conditionColors: Record<string, string> = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Refurbished": "bg-orange-100 text-orange-700",
};

const statusColors: Record<string, string> = {
  "available": "bg-green-100 text-green-700",
  "sold": "bg-gray-100 text-gray-700",
  "pending": "bg-yellow-100 text-yellow-700",
};

export default function MyProductsPage(): JSX.Element {
  const { data: session } = useSession();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/seller?email=${session?.user?.email}`
      );
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Failed to parse inventory records sequence:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) fetchProducts();
  }, [session]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleteLoading(productId);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted successfully!");
        fetchProducts();
      } else {
        toast.error("Failed to delete product!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchCondition = conditionFilter ? p.condition === conditionFilter : true;
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchCategory && matchCondition && matchStatus;
  });

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("");
    setConditionFilter("");
    setStatusFilter("");
  };

  const anyFilterActive = !!(search || categoryFilter || conditionFilter || statusFilter);

  return (
    <div className="space-y-6">
      {/* Header Widget */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">My Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products listed</p>
        </div>
        <Link href="/dashboard/seller/add-product">
          <Button
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-md"
            startContent={<FaPlus size={12} />}
          >
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Search Input and Select Control Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Search Parameter field */}
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search your products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 transition-all shadow-sm"
          />
        </div>

        {/* Category Mapping Target Options */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 transition-all shadow-sm cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Fashion">Fashion</option>
          <option value="Mobile Phones">Mobile Phones</option>
          <option value="Other">Other</option>
        </select>

        {/* Condition filtering */}
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 transition-all shadow-sm cursor-pointer"
        >
          <option value="">All Conditions</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Refurbished">Refurbished</option>
        </select>

        {/* Status filtering */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 transition-all shadow-sm cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>

        {/* Dynamic Reset State Handler Action */}
        {anyFilterActive && (
          <button
            onClick={handleReset}
            className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl text-sm transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filter Yield Quantitative Metric Tags */}
      {anyFilterActive && (
        <p className="text-sm text-gray-400">
          Showing <span className="font-bold text-gray-700">{filteredProducts.length}</span> of {products.length} products
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-4 border border-gray-100">
              <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center shadow-inner">
              <FaBoxOpen size={40} className="text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-black text-lg">No Products Found</p>
              <p className="text-gray-400 text-sm mt-1">
                {anyFilterActive
                  ? "Try changing your filters"
                  : "Start listing products to sell"}
              </p>
            </div>
            {!anyFilterActive && (
              <Link href="/dashboard/seller/add-product">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-md">
                  Add First Product
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Results Directory Data Matrix Grid Node Table Layout */
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:grid">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gray-50/50 transition-all"
              >
                {/* Core item image r label context descriptors */}
                <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/150"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{product.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${conditionColors[product.condition] || "bg-gray-100 text-gray-700"}`}>
                      {product.condition}
                    </span>
                  </div>
                </div>

                {/* Categories classification indicator parameters */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FaTag size={10} className="text-green-500" />
                    <span>{product.category}</span>
                  </div>
                </div>

                {/* Catalog currency values parameter */}
                <div className="col-span-1 md:col-span-2">
                  <p className="font-black text-green-600 text-sm">৳{product.price?.toLocaleString()}</p>
                </div>

                {/* Database stock status tags indices */}
                <div className="col-span-1 md:col-span-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize inline-block ${statusColors[product.status] || "bg-gray-100 text-gray-700"}`}>
                    {product.status}
                  </span>
                </div>

                {/* Operations triggers block container components */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                  <Link href={`/dashboard/seller/edit-product/${product._id}`}>
                    <button className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-all shadow-xs">
                      <FaEdit size={13} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleteLoading === product._id}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-all disabled:opacity-50 shadow-xs"
                  >
                    {deleteLoading === product._id ? (
                      <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaTrash size={13} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}