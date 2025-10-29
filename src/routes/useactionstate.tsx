import { createFileRoute } from "@tanstack/react-router";
import ActionStateExample from "../new-features/ActionStateExample";

export const Route = createFileRoute("/useactionstate")({
  component: ActionStateExample,
});
