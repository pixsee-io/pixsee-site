export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md rounded-2xl border border-neutral-tertiary-border p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-primary-text">
          You are offline
        </h1>
        <p className="mt-3 text-sm text-neutral-secondary-text">
          Pixsee is unavailable right now. Reconnect to continue, or retry in a
          moment.
        </p>
      </div>
    </main>
  );
}
