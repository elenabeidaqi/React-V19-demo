import { createFileRoute } from "@tanstack/react-router";
import { Suspense, use, useOptimistic, useState, useTransition } from "react";

type ProductData = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
  image: string;
};

export const Route = createFileRoute("/products")({
  ssr: true,
  component: Products,
});

async function fetchProduct(): Promise<ProductData[]> {
  const response = await fetch(`https://fakestoreapi.com/products`);
  const data = await response.json();
  return data.map((product: ProductData) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    rating: product.rating,
    image: product.image,
  }));
}

async function addToCartAPI(productId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  void productId;
}

function Products() {
  return (
    <div className=" text-white p-4 h-screen">
      <Suspense fallback={<ProductSkeleton />}>
        <Product productDataPromise={fetchProduct()} />
      </Suspense>
    </div>
  );
}

function Product({
  productDataPromise,
}: {
  productDataPromise: Promise<ProductData[]>;
}) {
  const products = use(productDataPromise);
  const [isPending, startTransition] = useTransition();
  const [actualCart, setActualCart] = useState<Map<number, number>>(new Map());

  const [optimisticCart, setOptimisticCart] = useOptimistic(
    actualCart,
    (
      currentCart: Map<number, number>,
      { productId, quantity }: { productId: number; quantity: number }
    ) => {
      const newCart = new Map(currentCart);
      const currentQuantity = newCart.get(productId) || 0;
      newCart.set(productId, currentQuantity + quantity);
      return newCart;
    }
  );

  const addToCart = async (productId: number) => {
    setOptimisticCart({ productId, quantity: 1 });

    try {
      await addToCartAPI(productId);
      setActualCart((prev) => {
        const newCart = new Map(prev);
        newCart.set(productId, (newCart.get(productId) || 0) + 1);
        return newCart;
      });
    } catch (error) {
      setOptimisticCart({ productId, quantity: -1 });
      console.error("Failed to add to cart:", error);
    }
  };
  return (
    <div className="mt-12 flex flex-wrap justify-center items-center gap-4">
      {products.map((product: ProductData, i: number) => {
        const cartQuantity = optimisticCart.get(product.id!) ?? 0;
        return (
          <div
            key={i}
            className="bg-blue-200 border border-gray-200 rounded-md p-3 w-1/5 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-64 object-cover rounded"
            />
            <h2 className="text-lg font-bold text-gray-700 mt-2 line-clamp-2">
              {product.title}
            </h2>
            <p className="text-gray-700 font-semibold">
              ${product.price.toFixed(2)}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startTransition(() => addToCart(product.id));
              }}
              disabled={isPending}
              className="bg-blue-500 text-white p-2 rounded-md w-full cursor-pointer hover:bg-blue-600 transition-colors mt-2 flex items-center justify-center gap-2"
            >
              Add to cart
              {cartQuantity > 0 && (
                <span className="bg-blue-600 px-2 py-1 rounded text-sm">
                  {cartQuantity}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-500 text-center p-2.5">
        Loading...
      </h2>
    </div>
  );
}

export default Products;
