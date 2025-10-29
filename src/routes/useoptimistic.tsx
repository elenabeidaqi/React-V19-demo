import { createFileRoute } from "@tanstack/react-router";
import UseOptimisticExample from "../new-features/useOptimisticExample";

export const Route = createFileRoute("/useoptimistic")({
  component: UseOptimisticExample,
});
