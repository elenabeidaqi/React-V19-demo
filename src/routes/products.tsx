import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";
import { Suspense } from "react";
import Product from "../new-features/Product";

async function fetchProducts() {
  const res = await axios.get("https://fakestoreapi.com/products");
  return res.data;
}

export default function Products() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Product dataPromise={fetchProducts() as Promise<Product[]>} />
    </Suspense>
  );
}

export const Route = createFileRoute("/products")({
  component: Products,
});
