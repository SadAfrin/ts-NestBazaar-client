"use client";

import { useState, useEffect, ChangeEvent, FormEvent, JSX } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@heroui/react";
import { FaBoxOpen, FaTag, FaDollarSign, FaList, FaImage } from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface ProductFormData {
  title: string;
  category: string;
  condition: string;
  price: string;
  description: string;
  images: string[];
  stock: number;
  status: string;
}

const categories: string[] = ["Electronics", "Furniture", "Vehicles", "Fashion", "Mobile Phones", "Other"];
const conditions: string[] = ["Like New", "Good", "Refurbished"];

export default function EditProductPage(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = useParams() as { id: string };
  
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    images: [""],
    stock: 1,
    status: "available",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Public route — no token needed for viewing entity logs
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${id}`
        );
        const data = await res.json();
        if (data.success) {
          setFormData({
            title: data.data.title || "",
            category: data.data.category || "",
            condition: data.data.condition || "",
            price: data.data.price?.toString() || "",
            description: data.data.description || "",
            images: data.data.images && data.data.images.length > 0 ? data.data.images : [""],
            stock: data.data.stock || 1,
            status: data.data.status || "available",
          });
        } else {
          toast.error("Failed to load product data");
        }
      } catch (error) {
        console.error("Failed to parse remote collection inventory payload item:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    if (formData.images.length >= 5) {
      toast.warning("You can add up to 5 images only!");
      return;
    }
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index: number) => {
    if (formData.images.length === 1) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.category || !formData.condition) {
      toast.error("Please fill in all dropdown options!");
      return;
    }

    const cleanedImages = formData.images.filter((img) => img.trim() !== "");
    if (cleanedImages.length === 0) {
      toast.error("Please provide at least one image URL!");
      return;
    }

    setLoading(true);

    const updatePayload = {
      ...formData,
      price: Number(formData.price),
      images: cleanedImages,
    };

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success("Product updated successfully!");
        router.push("/dashboard/seller/my-products");
      } else {
        toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
          <FaBoxOpen className="text-green-500" size={26} />
          Modify Product Directory
        </h1>
        <p className="text-gray-400 text-sm mt-1">Update specifications record metadata entries inside the database matrix</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Parameter Node */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600">Product Title</label>
            <div className="relative">
              <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Core Select Parameters Input Row Stack Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-600">Category</label>
              <div className="relative">
                <FaList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-600">Condition Status</label>
              <div className="relative">
                <FaBoxOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Condition</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing input parameter */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600">Price tag (BDT)</label>
            <div className="relative">
              <FaDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="number"
                name="price"
                required
                min="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter valuation numbers"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Description Node parameters */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600">Product Specification Details</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Dynamic Image Collection Cluster Control Loop Block */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-600">Product Images</label>
            <div className="space-y-2">
              {formData.images.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/asset-link.jpg"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all"
                    />
                  </div>
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-3 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition-all font-bold text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-1">
              {formData.images.length < 5 && (
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-sm text-green-600 font-bold hover:underline"
                >
                  + Add another image
                </button>
              )}
            </div>
          </div>

          {/* Local Render Preview Mapping Segment Grid Layout */}
          {formData.images[0] && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-600">Preview Layout Gallery</label>
              <div className="flex gap-3 flex-wrap">
                {formData.images
                  .filter((img) => img.trim() !== "")
                  .map((img, index) => (
                    <div key={index} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                      <img
                        src={img}
                        alt={`preview-${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/80";
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Form Trigger Segment Operations Nodes Wrapper */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="bordered"
              className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all"
              onClick={() => router.push("/dashboard/seller/my-products")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition-all"
            >
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}