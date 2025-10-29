import { use, useOptimistic, useState, useTransition } from "react";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

// Simulate API call for adding to cart
async function addToCartAPI(productId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  void productId;
}

const Product = ({ dataPromise }: { dataPromise: Promise<Product[]> }) => {
  const data = use(dataPromise);
  const [isPending, startTransition] = useTransition();
  // Actual cart state (server state) - Map of productId to quantity
  const [actualCart, setActualCart] = useState<Map<number, number>>(new Map());

  // Optimistic cart state with reducer function
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
    // Optimistic update - show immediately
    setOptimisticCart({ productId, quantity: 1 });

    try {
      await addToCartAPI(productId);
      // Update actual state after API success
      setActualCart((prev) => {
        const newCart = new Map(prev);
        newCart.set(productId, (newCart.get(productId) || 0) + 1);
        return newCart;
      });
    } catch (error) {
      // Revert on error
      setOptimisticCart({ productId, quantity: -1 });
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full gap-4 flex-wrap p-8 my-24">
      {data.length > 0 ? (
        data.map((product: Product) => {
          const cartQuantity = optimisticCart.get(product.id) || 0;

          return (
            <div className="bg-blue-200 border border-gray-200 rounded-md p-3 w-1/5 flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
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
        })
      ) : (
        <div className="text-gray-700">No products found</div>
      )}
    </div>
  );
};

export default Product;
