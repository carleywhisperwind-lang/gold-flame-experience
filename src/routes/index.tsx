import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/hero/HeroSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gold Flame Shawarma — The Flame That Defines Flavor" },
      {
        name: "description",
        content:
          "Fire-turned shawarma crafted over open flame. Explore the craft in an immersive 3D experience and order from Gold Flame Shawarma.",
      },
      { property: "og:title", content: "Gold Flame Shawarma — The Flame That Defines Flavor" },
      {
        property: "og:description",
        content:
          "Crafted over fire. Wrapped with perfection. Served with obsession. An immersive look at Gold Flame Shawarma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
