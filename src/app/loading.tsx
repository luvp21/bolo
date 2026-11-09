export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-10 sm:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-48 rounded-full bg-raised" />
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="breathe h-1 rounded-full bg-line" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-4">
        <div className="breathe h-10 w-3/4 rounded-xl bg-raised" />
        <div className="breathe h-5 w-full rounded-lg bg-raised" />
        <div className="breathe h-5 w-5/6 rounded-lg bg-raised" />
      </div>
    </main>
  );
}
