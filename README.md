# Gold Flame Experience

Create a full-viewport, Awwwards-level interactive hero section for "Gold Flame Shawarma" using React, Three.js/React Three Fiber (or GSAP ScrollTrigger canvas scrub), and Tailwind CSS. Design it with the visual polish and fluidity of an Apple product launch or Nike interactive campaign.

1. Environment & Atmosphere




Dark cinematic environment (#0B0B0C background) with warm golden rim lighting, dynamic studio highlights, and realistic drop shadows.

Subtle depth-of-field blur and a subtle particle system (floating steam, soft warm ambient embers, floating spice dust).

2. Interactive 3D Canvas / Scrub Engine




Render a photorealistic 3D shawarma model as the centerpiece with detailed grilled textures, crisp edges, and subtle sauce reflections.

Idle State: Slow 360-degree floating orbit animation.

Cursor Interaction: Smooth parallax mouse-tracking (subtle camera tilt following cursor, lighting intensity gently increases on hover).

Scroll Progression: Implement GSAP ScrollTrigger with scrub: true. As the user scrolls, the camera zooms, the object reposition/scales dynamically to clear textual content, and smoothly transitions through explosive exploded-ingredient layers, slice cross-sections, and narrative scroll stages.

3. Layout & Luxury Typography




Headline: Large, high-contrast serif/sans-serif combination reading "THE FLAME THAT DEFINES FLAVOR" with a staggered reveal animation.

Subheading: "Crafted over fire. Wrapped with perfection. Served with obsession." in clean, tracked-out typography.

Navigation & UI: Floating Glassmorphic header with glowing borders, live status indicator, and magnetic interactive hover CTA buttons ("Order Now" / "Explore the Flame").

4. Responsive & Performance Best Practices




Ensure non-blocking typography overlays using auto-layout grids.

Scale and translate the center object adaptively for mobile, tablet, and desktop viewports without clipping or obscuring reading areas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dfc669f9-77f1-494e-a24c-95887338ba62).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
