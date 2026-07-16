"use client";

import { useState, ChangeEvent, FormEvent, JSX } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
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
}

const categories: string[] = ["Electronics", "Furniture", "Vehicles", "Fashion", "Mobile Phones", "Other"];
const conditions: string[] = ["Like New", "Good", "Refurbished"];

export default function AddProductPage(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    images: [""],
    stock: 1,
  });

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
      toast.error("Please provide at least one product image URL!");
      return;
    }

    setLoading(true);

    const productPayload = {
      ...formData,
      price: Number(formData.price),
      images: cleanedImages,
      sellerInfo: {
        name: session?.user?.name || "Anonymous Seller",
        email: session?.user?.email,
      },
    };

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/add`,
        {
          method: "POST",
          body: JSON.stringify(productPayload),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success("Product listed successfully!");
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Failed to list product");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2.5">
          <FaBoxOpen className="text-green-500" size={26} />
          List a New Product
        </h1>
        <p className="text-gray-400 text-sm mt-1">Fill out the credentials below to publish your marketplace catalog item</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Node */}
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
                placeholder="e.g., iPhone 13 Pro Max"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Core Select Grid Components */}
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
              <label className="text-sm font-bold text-gray-600">Condition Layer</label>
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

          {/* Pricing input nodes parameters */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600">Asking Price (BDT)</label>
            <div className="relative">
              <FaDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="number"
                name="price"
                required
                min="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price in Taka"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Description parameter */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600">Product Specification Details</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a descriptive insight overview regarding the hardware item status logs, notes, or traits..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Dynamic Image Fields array control loop stack */}
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
                      placeholder={`https://example.com/image-${index + 1}.jpg`}
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

          {/* Dynamic Preview Panel Visualization Grid */}
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

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition-all mt-2"
          >
            {loading ? "Listing Product..." : "List Product..."}
          </Button>
        </form>
      </div>
    </div>
  );
}