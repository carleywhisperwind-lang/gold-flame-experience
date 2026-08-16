import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import MagneticButton from "./MagneticButton";
import rollImg from "@/assets/shawarma-roll.png";

const ShawarmaScene = lazy(() => import("./ShawarmaScene"));

const STAGES = [
  {
    tag: "01 — The Fire",
    title: "Slow-turned over open flame",
    body: "Ninety minutes on the vertical spit. Fat renders, spice caramelises, edges char to lacquer.",
  },
  {
    tag: "02 — The Layers",
    title: "Twelve components, one bite",
    body: "Toum, sumac onion, pickled turnip, charred tomato — stacked so every bite carries the whole story.",
  },
  {
    tag: "03 — The Wrap",
    title: "Sealed on the grill, served in seconds",
    body: "Pressed until the flatbread crackles, cut on the bias, handed over while the steam still rises.",
  },
];

/** Progressive bites taken out of the roll, one per scroll stage. */
const BITES = [
  { x: 63, y: 9, r: 9 },
  { x: 37, y: 17, r: 10.5 },
  { x: 66, y: 26, r: 12 },
  { x: 41, y: 35, r: 13 },
];

function biteMask(n: number) {
  if (n <= 0) return undefined;
  return BITES.slice(0, n)
    .map(
      (b) =>
        `radial-gradient(circle at ${b.x}% ${b.y}%, transparent 0 ${b.r}%, #000 ${b.r + 0.6}%)`,
    )
    .join(", ");
}

export default function HeroSection() {
  const progress = useRef({ v: 0, hover: 0 });
  const wrapper = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [ready, setReady] = useState(false);
  const [bites, setBites] = useState(0);
  const [crunch, setCrunch] = useState(0);
  const [active, setActive] = useState(-1);
  const biteRef = useRef(0);


  useEffect(() => {
    setReady(true);
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !wrapper.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: wrapper.current!,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            progress.current.v = self.progress;
            const n = Math.min(
              BITES.length,
              Math.floor(self.progress * (BITES.length + 0.35)),
            );
            if (n !== biteRef.current) {
              const bitten = n > biteRef.current;
              biteRef.current = n;
              setBites(n);
              setActive(n - 1);
              if (bitten) setCrunch((c) => c + 1);
            }
          },

        });

        if (roll.current) {
          gsap.to(roll.current, {
            scale: 1.18,
            yPercent: -6,
            rotate: 8,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper.current!,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          });
        }

        gsap.utils.toArray<HTMLElement>("[data-stage]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "top 45%",
                scrub: true,
              },
            },
          );
        });
      }, wrapper);
    })();

    const onMove = (e: PointerEvent) => {
      tilt.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      tilt.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    let raf = 0;
    const loop = () => {
      const t = tilt.current;
      t.x += (t.tx - t.x) * 0.06;
      t.y += (t.ty - t.y) * 0.06;
      if (roll.current) {
        roll.current.style.setProperty("--tilt-y", `${t.x * 10}deg`);
        roll.current.style.setProperty("--tilt-x", `${-t.y * 7}deg`);
        roll.current.style.setProperty("--shift-x", `${t.x * 16}px`);
        roll.current.style.setProperty("--shift-y", `${t.y * 12}px`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ctx?.revert();
    };
  }, []);

  // crunch shake whenever a new bite lands
  useEffect(() => {
    if (!crunch || !roll.current) return;
    const el = roll.current;
    el.classList.remove("crunching");
    void el.offsetWidth;
    el.classList.add("crunching");
    const id = window.setTimeout(() => el.classList.remove("crunching"), 520);
    return () => window.clearTimeout(id);
  }, [crunch]);


  return (
    <div ref={wrapper} className="relative bg-background">
      {/* fixed canvas layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[image:var(--gradient-stage)]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_45%,#000_35%,transparent_100%)]">
          {ready && (
            <ClientOnly fallback={null}>
              <Suspense fallback={null}>
                <ShawarmaScene progress={progress} />
              </Suspense>
            </ClientOnly>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={roll} className="roll-stage">
            <div className="roll-inner">
              <img
                src={rollImg}
                alt="Gold Flame chicken shawarma roll in a paper wrap"
                width={1024}
                height={1536}
                style={{
                  maskImage: biteMask(bites),
                  WebkitMaskImage: biteMask(bites),
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                }}
                className="h-full w-auto object-contain drop-shadow-[0_45px_60px_rgba(0,0,0,0.75)] transition-[mask-image] duration-300"
              />
            </div>

          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_50%,transparent_40%,var(--color-background)_100%)] opacity-70" />
        <div className="noise absolute inset-0" />
      </div>

      {/* header */}
      <header className="fixed inset-x-0 top-0 z-30 flex justify-center px-4 pt-5">
        <nav className="glass flex w-full max-w-6xl items-center justify-between gap-6 rounded-full px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flame-dot" aria-hidden />
            <span className="font-display text-sm tracking-[0.32em] text-foreground uppercase">
              Gold Flame
            </span>
          </div>
          <ul className="hidden items-center gap-9 text-[11px] tracking-[0.24em] text-muted-foreground uppercase md:flex">
            <li className="transition-colors hover:text-primary">Menu</li>
            <li className="transition-colors hover:text-primary">Craft</li>
            <li className="transition-colors hover:text-primary">Locations</li>
          </ul>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-[10px] tracking-[0.22em] text-muted-foreground uppercase sm:flex">
              <span className="live-dot" aria-hidden />
              Spit live · 11:00–02:00
            </span>
            <MagneticButton className="hidden sm:inline-flex">Order Now</MagneticButton>
          </div>
        </nav>
      </header>

      {/* hero copy */}
      <section
        className="relative z-20 grid min-h-[100svh] grid-rows-[1fr_auto] items-end px-6 pt-32 pb-14 md:px-12"
        onMouseEnter={() => (progress.current.hover = 1)}
        onMouseLeave={() => (progress.current.hover = 0)}
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="reveal reveal-1 text-[11px] tracking-[0.4em] text-primary uppercase">
              Charcoal · Spice · Obsession
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,8vw,6.4rem)] leading-[0.92] font-semibold text-foreground">
              <span className="reveal reveal-2 block">THE FLAME</span>
              <span className="reveal reveal-3 block text-[image:var(--gradient-gold)] bg-[image:var(--gradient-gold)] bg-clip-text text-transparent italic">
                THAT DEFINES
              </span>
              <span className="reveal reveal-4 block">FLAVOR</span>
            </h1>
          </div>
          <div className="reveal reveal-5 md:col-span-6 md:col-start-1 md:pb-4">
            <p className="max-w-sm text-sm leading-relaxed tracking-[0.14em] text-muted-foreground uppercase">
              Crafted over fire. Wrapped with perfection. Served with obsession.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton>Order Now</MagneticButton>
              <MagneticButton variant="ghost">Explore the Flame</MagneticButton>
            </div>
          </div>
        </div>

        <div className="reveal reveal-6 mx-auto mt-16 flex w-full max-w-7xl items-center justify-between text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          <span>Scroll to unwrap</span>
          <span className="h-px flex-1 mx-6 bg-border" />
          <span>Est. 2009 · Fire-fed daily</span>
        </div>
      </section>

      {/* scroll narrative */}
      {STAGES.map((s, i) => (
        <section
          key={s.tag}
          className="relative z-20 grid min-h-[90svh] items-center px-6 md:px-12"
        >
          <div
            data-stage
            className={`mx-auto w-full max-w-7xl md:grid md:grid-cols-12 ${
              i % 2 ? "md:justify-items-end" : ""
            }`}
          >
            <div
              className={`glass max-w-md rounded-3xl p-8 md:col-span-5 ${
                i % 2 ? "md:col-start-8" : ""
              }`}
            >
              <p className="text-[10px] tracking-[0.34em] text-primary uppercase">{s.tag}</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-foreground md:text-4xl">
                {s.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          </div>
        </section>
      ))}

      <footer className="relative z-20 flex min-h-[60svh] flex-col items-center justify-center gap-8 px-6 text-center">
        <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-none text-foreground">
          Come stand by the fire.
        </h2>
        <MagneticButton>Order Now</MagneticButton>
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          Gold Flame Shawarma
        </p>
      </footer>
    </div>
  );
}
