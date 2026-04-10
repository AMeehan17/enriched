import { redirect } from "next/navigation";

// Ship 1 has only one user-facing module. The landing page redirects to
// it directly. When Module 2+ ships, this becomes a real landing page
// with featured comparisons, recent additions, etc.
export default function HomePage() {
  redirect("/compare");
}
