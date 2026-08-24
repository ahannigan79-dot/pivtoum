import { redirect } from "next/navigation";

// Evolve is the home dashboard now — "Evolve to Win" is where the plan lives.
export default function EvolvePage() {
  redirect("/hub");
}
