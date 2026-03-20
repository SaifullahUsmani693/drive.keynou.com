export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-6">
          By using Keynou Drive, you agree to these Terms of Service.
        </p>

        <section className="space-y-4 text-sm text-muted-foreground">
          <p>
            You are responsible for the links you create and the content they point to. We may suspend accounts that
            violate applicable laws or platform policies.
          </p>
          <p>
            If you choose Google login, you authorize us to access basic account information provided by Google for
            authentication and account management.
          </p>
          <p>
            Payments are handled by our payment processors. You agree that payment terms, refunds, and chargebacks are
            governed by the processor’s policies and our billing terms communicated at purchase.
          </p>
          <p>
            Usage analytics include IP-based geolocation. Keynou Drive uses the IP2Location LITE database for{" "}
            <a href="https://lite.ip2location.com" className="underline underline-offset-4" target="_blank" rel="noreferrer">
              IP geolocation
            </a>
            .
          </p>
          <p>
            For questions about these terms, contact support@keynou.com.
          </p>
        </section>
      </div>
    </main>
  );
}
