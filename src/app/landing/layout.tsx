// Landing is the one route that must stay light regardless of the user's
// theme preference. `force-light` re-declares the light palette on this
// subtree, so even when <html class="dark"> is set the landing content
// still renders with the light tokens.
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="force-light bg-foundation-primary text-neutral-primary-text">
      {children}
    </div>
  );
}
