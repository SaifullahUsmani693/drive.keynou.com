export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This Privacy Policy explains how Keynou Drive collects, uses, and protects your information.
        </p>

        <section className="space-y-4 text-sm text-muted-foreground">
          <p>
            We collect account information, link analytics, and usage data to provide the service. We never sell your
            personal data.
          </p>
          <p>
            If you choose Google login, we receive basic profile details (such as your name, email, and Google account
            identifier) so we can create and secure your account. We do not access your Google password.
          </p>
          <p>
            Payments are handled by our payment partners. We do not store full card numbers on our servers; payment
            processors handle card data and provide us with transaction confirmations and limited metadata needed for
            billing and support.
          </p>
          <p>
            We process IP addresses to understand geographic usage patterns and protect the platform. Keynou Drive uses
            the IP2Location LITE database for{" "}
            <a href="https://lite.ip2location.com" className="underline underline-offset-4" target="_blank" rel="noreferrer">
              IP geolocation
            </a>
            .
          </p>
          <p>
            If you have privacy questions, contact us at support@keynou.com.
          </p>
        </section>
      </div>
    </main>
  );
}
