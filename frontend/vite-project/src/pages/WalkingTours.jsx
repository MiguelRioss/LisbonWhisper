
export default function WalkingTours() {
  return (
    <div className="section-background min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="hero-type hero-soft text-3xl md:text-5xl">
          Walking Tours
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-200">
          Discover Lisbon on foot with curated routes that highlight
          viewpoints, history, and local neighborhoods.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Old Town Walk</h2>
            <p className="mt-3 text-slate-200">
              Alfama lanes, hidden courtyards, and classic miradouros.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">River & Downtown</h2>
            <p className="mt-3 text-slate-200">
              Baixa streets, Praça do Comércio, and riverside views.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
