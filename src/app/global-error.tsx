"use client";

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);

  return (
    <html lang="en">
      <body>
        <main style={{ padding: "4rem", fontFamily: "system-ui, sans-serif" }}>
          <p>Application error</p>
          <h1>Something needs attention</h1>
        </main>
      </body>
    </html>
  );
}
