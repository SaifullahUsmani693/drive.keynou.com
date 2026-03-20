export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This Cookie Policy explains how Keynou Drive uses cookies and similar technologies.
        </p>

        <section className="space-y-4 text-sm text-muted-foreground">
          <p>
            We use cookies for authentication, security, and remembering your preferences. You can disable cookies in
            your browser, but some features may not work as expected.
          </p>
          <p>
            When you sign in with Google, we use cookies or similar technologies to keep you authenticated and protect
            your account session.
          </p>
          <p>
            Payments are processed by trusted partners that may set their own cookies or local storage identifiers to
            complete transactions and prevent fraud.
          </p>
          <p>
            For analytics, we rely on IP-based geolocation. Keynou Drive uses the IP2Location LITE database for{" "}
            <a href="https://lite.ip2location.com" className="underline underline-offset-4" target="_blank" rel="noreferrer">
              IP geolocation
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
