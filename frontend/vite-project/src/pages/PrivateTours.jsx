export default function PrivateTours() {
  return (
    <div className="section-background min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="hero-type hero-soft text-3xl md:text-5xl">
          Private Tours
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-200">
          Flexible, tailored experiences with a dedicated guide and
          custom pacing for your group.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Half‑Day Custom</h2>
            <p className="mt-3 text-slate-200">
              Choose your theme: history, food, photography, or design.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Full‑Day Escape</h2>
            <p className="mt-3 text-slate-200">
              Combine city highlights with a scenic countryside stop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
