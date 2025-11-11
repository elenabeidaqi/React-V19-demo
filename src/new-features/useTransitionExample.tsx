import { useEffect, useMemo, useState, useTransition } from "react";

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

type RemoteProduct = {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function createExpandedDataset(source: Product[], multiplier = 50): Product[] {
  if (source.length === 0) {
    return [];
  }

  return source.flatMap((product) =>
    Array.from({ length: multiplier }, (_, index) => ({
      ...product,
      id: `${product.id}-${index}`,
    }))
  );
}

const loadingPlaceholders = Array.from({ length: 6 }, (_, index) => index);

function ProductSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loadingPlaceholders.map((key) => (
        <div
          key={key}
          className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 animate-pulse"
        >
          <div className="h-40 rounded-md bg-blue-200/60" />
          <div className="mt-4 h-4 w-3/4 rounded bg-blue-200/80" />
          <div className="mt-2 h-4 w-1/3 rounded bg-blue-200/60" />
          <div className="mt-6 h-10 rounded bg-blue-200/60" />
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={product.image}
        alt={product.title}
        className="h-40 w-full rounded-md object-contain bg-white"
        loading="lazy"
      />
      <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-blue-900">
        {product.title}
      </h2>
      <p className="mt-2 text-sm text-blue-700">{product.category}</p>
      <p className="mt-3 text-xl font-semibold text-blue-800">
        {priceFormatter.format(product.price)}
      </p>
      <p className="mt-3 line-clamp-3 text-sm text-blue-900/80">
        {product.description}
      </p>
    </article>
  );
}

function useFetchedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("https://fakestoreapi.com/products");
        const data: RemoteProduct[] = await response.json();

        if (!isMounted) {
          return;
        }

        const normalized: Product[] = data.map((product) => ({
          id: String(product.id),
          title: product.title,
          price: product.price,
          category: product.category,
          description: product.description,
          image: product.image,
        }));

        setProducts(normalized);
      } catch {
        if (!isMounted) {
          return;
        }
        setError("دریافت اطلاعات با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, isLoading, error };
}

function Filters({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <label className="flex-1">
        <span className="mb-1 block text-sm font-medium text-blue-900">
          جستجو در عنوان محصول
        </span>
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="مثلاً: bag, jacket، electronics"
          className="w-full rounded-lg border border-blue-300 bg-white px-4 py-2 text-blue-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
    </div>
  );
}

const emptyStateMessage =
  "هیچ محصولی با فیلتر فعلی پیدا نشد. لطفاً عبارت دیگری را امتحان کنید.";

function EmptyState() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-8 text-center text-blue-900">
      <p>{emptyStateMessage}</p>
    </div>
  );
}

function ProductGrid({
  products,
  isPending,
  totalCount,
}: {
  products: Product[];
  isPending: boolean;
  totalCount: number;
}) {
  return (
    <section
      className={`rounded-xl border border-blue-200 bg-blue-50/30 p-4 ${
        isPending ? "opacity-70 transition-opacity duration-200" : ""
      }`}
    >
      <header className="mb-4 flex flex-col gap-2 text-sm text-blue-900 md:flex-row md:items-center md:justify-between">
        <span>
          {products.length} محصول از مجموع {totalCount} مورد در حال نمایش است.
        </span>
        {isPending && (
          <span className="inline-flex items-center gap-2 text-blue-700">
            <span className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
            به‌روزرسانی نتایج...
          </span>
        )}
      </header>
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function UseTransitionExample() {
  const { products, isLoading, error } = useFetchedProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const [nonTransitionFiltered, setNonTransitionFiltered] = useState<Product[]>(
    []
  );
  const [isNonTransitionPending, setIsNonTransitionPending] = useState(false);

  const expandedProducts = useMemo(
    () => createExpandedDataset(products, 170),
    [products]
  );

  useEffect(() => {
    setFilteredProducts(expandedProducts);
    setNonTransitionFiltered(expandedProducts);
  }, [expandedProducts]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // startTransition(() => {
    //   const normalized = value.trim().toLowerCase();
    //   if (normalized.length === 0) {
    //     setFilteredProducts(expandedProducts);
    //     return;
    //   }

    //   const next = expandedProducts.filter((product) => {
    //     const haystack = `${product.title} ${product.category}`.toLowerCase();
    //     return haystack.includes(normalized);
    //   });
    //   setFilteredProducts(next);
    // });

    setIsNonTransitionPending(true);
    const normalized = value.trim().toLowerCase();

    const performFilterSync = () => {
      if (normalized.length === 0) {
        setNonTransitionFiltered(expandedProducts);
      } else {
        const next = expandedProducts.filter((product) => {
          const haystack = `${product.title} ${product.category}`.toLowerCase();
          return haystack.includes(normalized);
        });
        setNonTransitionFiltered(next);
      }
      setIsNonTransitionPending(false);
    };
    performFilterSync();
    // if (expandedProducts.length > 80) {
    //   requestIdleCallback(performFilterSync);
    // } else {
    //   performFilterSync();
    // }
  };

  return (
    <div className="mx-auto mt-16 max-w-6xl space-y-6 px-4 pb-16">
      <header className="space-y-3 text-blue-900">
        <h1 className="text-3xl font-bold">useTransition در عمل</h1>
        <p className="text-base leading-7 text-blue-900/80">
          این مثال نشان می‌دهد چگونه می‌توان با استفاده از useTransition بین
          تعامل‌های سریع و عملیات پرهزینه تعادل برقرار کرد.
        </p>
      </header>

      {/* <FeatureSummary /> */}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-red-800">
          {error}
        </div>
      ) : isLoading ? (
        <ProductSkeletonGrid />
      ) : (
        <>
          <Filters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
          <section className="grid gap-6 lg:grid-cols-2">
            {/* <div className="space-y-3">
              <h2 className="text-lg font-semibold text-blue-900">
                نسخه با useTransition
              </h2>
              <p className="text-sm text-blue-800">
                فیلتر کردن لیست داخل transition انجام می‌شود؛ ورودی بلافاصله
                به‌روزرسانی می‌شود و نتایج با کمی تأخیر اما روان تغییر می‌کنند.
              </p>
              <ProductGrid
                products={filteredProducts}
                isPending={isPending}
                totalCount={expandedProducts.length}
              />
            </div> */}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-blue-900">
                نسخه بدون useTransition
              </h2>
              <p className="text-sm text-blue-800">
                همان عملیات فیلتر همزمان با تایپ اجرا می‌شود؛ اگر لیست خیلی بزرگ
                باشد ورودی ممکن است کند یا گیر احساس شود.
              </p>
              <ProductGrid
                products={nonTransitionFiltered}
                isPending={isNonTransitionPending}
                totalCount={expandedProducts.length}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
