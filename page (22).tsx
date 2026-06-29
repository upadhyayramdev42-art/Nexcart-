"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, ArrowLeft } from "lucide-react";
import { addMyProduct } from "@/lib/firebase/firestore";
import { uploadProductImage, generateStoragePath } from "@/lib/firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types";

const CATEGORIES = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Books", "Toys", "Automotive", "Food & Grocery", "Health"];

export default function AddProductPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    salePrice: "",
    stock: "",
    sku: "",
    status: "active" as ProductStatus,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (imageFiles.length + files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.category || !form.price || !form.sku) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      // Upload images
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploading(true);
        const uploadPromises = imageFiles.map((file, i) =>
          uploadProductImage(
            file,
            generateStoragePath("products", file.name),
            (p) => setUploadProgress(Math.round((i / imageFiles.length) * 100 + p / imageFiles.length))
          )
        );
        uploadedUrls = await Promise.all(uploadPromises);
        setUploading(false);
      }

      await addMyProduct({
        type: "my_product",
        name: form.name,
        category: form.category,
        brand: form.brand,
        description: form.description,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        stock: parseInt(form.stock) || 0,
        sku: form.sku,
        images: uploadedUrls,
        status: form.status,
        createdBy: appUser?.uid ?? "",
      });

      router.push("/products/my-products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Add Product</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Create a new product in your store</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Sony WH-1000XM5 Headphones" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Sony" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe your product…" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none" />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price (₹) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required placeholder="0.00" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sale Price (₹)</label>
              <input name="salePrice" type="number" min="0" step="0.01" value={form.salePrice} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stock *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required placeholder="0" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">SKU *</label>
              <input name="sku" value={form.sku} onChange={handleChange} required placeholder="e.g. EL-HP-001" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full sm:w-48 px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Product Images</h2>
          <p className="text-xs text-gray-400">Upload up to 5 images. First image will be the main image.</p>

          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors">
                  <X size={11} />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-brand-600 text-white px-1.5 py-0.5 rounded font-bold">MAIN</span>}
              </div>
            ))}

            {imagePreviews.length < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className={cn("w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors", "border-gray-300 dark:border-gray-600 hover:border-brand-400 text-gray-400 hover:text-brand-500")}>
                <Upload size={18} />
                <span className="text-[10px] font-medium">Add Image</span>
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading…</span><span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-brand-600/30 active:scale-[0.98]"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {saving ? "Saving…" : "Save Product"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
