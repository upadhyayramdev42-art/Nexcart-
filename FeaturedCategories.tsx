import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data";

export function FeaturedCategories() {
  const [featured, ...rest] = categories;

  return (
    <section className="py-16 bg-muted-light dark:bg-muted-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-widest mb-2">
              Browse
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Featured Categories
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-2.5 transition-all"
          >
            All categories <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Large featured card */}
          <Link
            href={featured.href}
            className="lg:col-span-2 lg:row-span-2 relative group overflow-hidden rounded-2xl aspect-square lg:aspect-auto min-h-[200px]"
          >
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <p className="text-white/70 text-xs font-medium mb-1">
                {featured.productCount.toLocaleString()} products
              </p>
              <h3 className="text-white text-2xl font-bold font-display">
                {featured.name}
              </h3>
              <div className="flex items-center gap-1 text-brand-300 text-sm font-semibold mt-2 group-hover:gap-2 transition-all">
                Shop now <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Regular category cards */}
          {rest.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="relative group overflow-hidden rounded-2xl aspect-square"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white/60 text-[10px] font-medium mb-0.5">
                  {category.productCount.toLocaleString()} items
                </p>
                <h3 className="text-white text-sm font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
