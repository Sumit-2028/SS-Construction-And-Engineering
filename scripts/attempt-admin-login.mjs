import querystring from "node:querystring";
import { env } from "node:process";

const base = "http://localhost:3000";
const email = "admin@apexconstructions.example";
const password = "Admin@12345";

async function run() {
  console.log("Fetching CSRF token...");
  const r1 = await fetch(`${base}/api/auth/csrf`, { redirect: "manual" });
  if (!r1.ok) {
    console.error("Failed to fetch csrf token", r1.status, await r1.text());
    process.exit(1);
  }
  const body = await r1.json();
  const csrfToken = body.csrfToken;
  const setCookie = r1.headers.get("set-cookie") || "";
  const cookie = setCookie
    .split(/,(?=[^ ;]+=)/)
    .map((c) => c.split(";")[0])
    .join("; ");
  console.log("csrfToken:", csrfToken);

  const form = querystring.stringify({
    csrfToken,
    callbackUrl: base,
    email,
    password,
  });

  console.log("Posting credentials...");
  const r2 = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie,
    },
    body: form,
    redirect: "manual",
  });

  console.log("Response status:", r2.status);
  if (r2.status === 302) {
    console.log("Login redirected to:", r2.headers.get("location"));
  }
  const text = await r2.text();
  console.log("Response body sample:", text.slice(0, 500));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
