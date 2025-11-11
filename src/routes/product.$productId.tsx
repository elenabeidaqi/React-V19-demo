import { createFileRoute, useParams } from "@tanstack/react-router";
import { Suspense, use, useEffect, useState } from "react"; // Added use
import { useEffectEvent } from "react"; // Note: useEffectEvent is experimental in React 19
import axios from "axios";

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

// New fetch function that returns a promise

async function fetchProduct(id: string): Promise<ProductData> {
  const response = await axios.get(`https://fakestoreapi.com/products/${id}`);
  return response.data;
}

export const Route = createFileRoute("/product/$productId")({
  ssr: true,
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = useParams({ from: "/product/$productId" });
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails productPromise={fetchProduct(productId)} />
    </Suspense>
  );
}

function ProductDetails({
  productPromise,
}: {
  productPromise: Promise<ProductData>;
}) {
  const product = use(productPromise);
  // Use use() to suspend and unwrap promise
  const [engaged, setEngaged] = useState(false);

  const logView = useEffectEvent(() => {
    console.log(`Viewed product ${product.id} with engagement: ${engaged}`);
    // In a real app, this could send to an analytics service
  });

  useEffect(() => {
    const id = setTimeout(() => {
      logView();
    }, 2000);
    return () => clearTimeout(id);
  }, [logView]);

  // useEffect(() => {
  //   const id = setTimeout(() => {
  //     console.log(`Viewed product ${product.id} with engagement: ${engaged}`);
  //   }, 2000);
  //   return () => clearTimeout(id);
  // }, [product.id, engaged]);

  // Demo with useEffect (stale problem)
  // const [staleMessage, setStaleMessage] = useState('Initial message');
  // const [staleCountdown, setStaleCountdown] = useState(3);
  // const [staleLastLog, setStaleLastLog] = useState('No log yet');

  // useEffect(() => {
  //   const id = setInterval(() => {
  //     setStaleCountdown((prev) => {
  //       if (prev <= 1) {
  //         const log = `Logged: ${staleMessage}`;
  //         setStaleLastLog(log); // Update UI with logged message
  //         console.log(log);
  //         return 3;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);
  //   return () => clearInterval(id);
  // }, []); // Empty deps causes stale closure

  // Demo with useEffectEvent (fix)
  const [message, setMessage] = useState("Initial message");
  const [countdown, setCountdown] = useState(5);
  const [lastLog, setLastLog] = useState("No log yet");

  const handleTick = useEffectEvent(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        const log = `Logged: ${message}`;
        setLastLog(log); // Update UI with fresh logged message
        // console.log(log);
        // setMessage(`Updated at ${new Date().toLocaleTimeString()}`)
        return 5;
      }
      return prev - 1;
    });
  });

  useEffect(() => {
    const id = setInterval(handleTick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-96 object-cover rounded mb-4"
      />
      <p className="text-gray-700 mb-4">{product.description}</p>
      <p className="text-xl font-semibold mb-4">${product.price.toFixed(2)}</p>
      <button
        onClick={() => setEngaged(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Mark as Engaged (for demo)
      </button>
      <p>Engaged: {engaged ? "Yes" : "No"}</p>
      <p className="mt-4 text-sm text-gray-500">
        Check console after 2 seconds for view log. If you click "Engage" before
        the timeout, the log will reflect the updated state without restarting
        the timer.
      </p>

      {/* <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-bold mb-2">1. useEffect with Empty Deps (Stale Problem)</h2>
        <p>Current message: {staleMessage}</p>
        <p>Countdown: {staleCountdown}</p>
        <p>Last logged in UI: {staleLastLog}</p>
        <button onClick={() => setStaleMessage(`Updated at ${new Date().toLocaleTimeString()}`)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2">
          Update Message
        </button>
        <p className="mt-2 text-sm text-gray-500">Update message: UI shows new value, but last log stays initial (stale). Countdown continues.</p>
      </div> */}

      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-bold mb-2">
          2. useEffectEvent (Fixes Stale)
        </h2>
        <p>Current message: {message}</p>
        <p>Countdown: {countdown}</p>
        <p>Last logged in UI: {lastLog}</p>
        <button
          onClick={() =>
            setMessage(`Updated at ${new Date().toLocaleTimeString()}`)
          }
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
        >
          Update Message
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Update message: Last log updates to new value without restarting
          countdown.
        </p>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mt-14">
      <h2 className="text-2xl font-bold mb-4 text-gray-500 text-center p-2.5">
        Loading...
      </h2>
    </div>
  );
}
