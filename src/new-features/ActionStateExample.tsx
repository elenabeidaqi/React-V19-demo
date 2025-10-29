import axios from "axios";
import { useActionState } from "react";

interface FormState {
  success: boolean;
  message?: string;
  error?: string;
}

async function submitForm(_prevState: FormState, formData: FormData) {
  try {
    await axios.post("https://fakestoreapi.com/products", formData);
    return { success: true, message: "فرم با موفقیت ارسال شد" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export default function ActionStateExample() {
  const [state, submitAction, isPending] = useActionState(submitForm, {
    success: false,
    error: "",
  });

  return (
    <form
      action={submitAction}
      className="flex  p-4 justify-center items-center h-screen w-full"
    >
      <div className="flex flex-col justify-center items-center gap-4 w-1/5 bg-blue-300 border border-gray-300 rounded-md py-8 px-7">
        <h2 className="text-lg font-bold text-gray-700">اطلاعات محصول</h2>
        <input
          type="text"
          name="title"
          required
          className="border border-gray-300 rounded-md p-2 bg-white w-full"
          placeholder="عنوان محصول"
        />
        <input
          type="number"
          name="price"
          min={0}
          required
          className="border border-gray-300 rounded-md p-2 bg-white w-full"
          placeholder="قیمت محصول"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 text-white p-2 rounded-md w-full"
        >
          {isPending ? "در حال ارسال..." : "ارسال"}
        </button>
        {!state.success && state.error && (
          <p className="text-red-500">{state.error}</p>
        )}
        {state.success && <p className="text-green-500">{state.message}</p>}
      </div>
    </form>
  );
}
