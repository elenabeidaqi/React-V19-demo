import axios from "axios";
import { useOptimistic, useState, useTransition } from "react";

const UseOptimisticExample = () => {
  const [actualCount, setActualCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [optimisticDeleteCount, setOptimisticDeleteCount] = useOptimistic(
    actualCount,
    (_currentCount, value: number) => value
  );

  async function deleteProductHandler() {
    const newCount = optimisticDeleteCount + 1;
    setOptimisticDeleteCount(newCount);

    try {
      await axios.delete("https://fakestoreapi.com/products/1");

      setActualCount(newCount);
    } catch {
      setOptimisticDeleteCount(actualCount);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <h2 className="text-lg font-bold text-gray-700">حذف محصول</h2>
      <button
        className="bg-red-500 text-white p-2 rounded-md"
        onClick={() => startTransition(() => deleteProductHandler())}
        disabled={isPending}
      >
        {isPending ? "حذف شد..." : "حذف"}
      </button>

      <p className="text-gray-700 text-2xl mt-4">{optimisticDeleteCount}</p>
    </div>
  );
};

export default UseOptimisticExample;
