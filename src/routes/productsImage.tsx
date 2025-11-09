import { createFileRoute } from "@tanstack/react-router";
import {
  Suspense,
  use,
  useState
} from "react";

type ImageData = {
  id: number;
  url: string;
  title: string;
};

export const Route = createFileRoute("/productsImage")({
  ssr: true,
  component: ProductsImage,
});

async function fetchImage(id: number): Promise<ImageData> {
  const response = await fetch(`https://fakestoreapi.com/products/${id}`);
  const data = await response.json();
  return { id, url: data.image, title: data.title };
}

function ProductsImage() {
  const [imageId, setImageId] = useState(1);
  const [imageDataPromise, setImageDataPromise] = useState<Promise<ImageData>>(
    () => fetchImage(imageId)
  );

  return (
    <div className="flex flex-col justify-center items-center  text-white p-4 h-screen">
      <Button
        action={() => {
          setImageId(imageId + 1);
          setImageDataPromise(fetchImage(imageId + 1));
        }}
      >
        Next Image
      </Button>
      <Suspense fallback={<ImageSkeleton imageId={imageId} />}>
        <Image imageDataPromise={imageDataPromise} imageId={imageId} />
      </Suspense>
    </div>
  );
}

function Image({
  imageDataPromise,
  imageId,
}: {
  imageDataPromise: Promise<ImageData>;
  imageId: number;
}) {
  const image = use(imageDataPromise);

  return (
    <div className="mt-5" key={imageId}>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-black text-center p-2.5">
          {image.title}
        </h2>
      </div>
      <div>
        <img
          src={image.url}
          alt={image.title}
          className="h-96 object-contain aspect-5/4"
        />
      </div>
    </div>
  );
}

function ImageSkeleton({ imageId }: { imageId: number }) {
  return (
    <div className="mt-5" key={imageId}>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-black text-center p-2.5">
          Loading...
        </h2>
      </div>
      <div>
        <div className="h-96 aspect-5/4 bg-gray-300 animate-pulse rounded-md"></div>
      </div>
    </div>
  );
}

function Button({
  action,
  children,
}: {
  action: () => void;
  children: React.ReactNode;
}) {
  // const [isPending, startTransition] = useTransition();
  return (
    <div>
      <button
        // disabled={isPending}
        onClick={() => {
          action();
        }}
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-bold text-2xl disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {children}
      </button>
    </div>
  );
}
