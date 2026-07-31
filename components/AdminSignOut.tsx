"use client";

export function AdminSignOut() {
  async function signOut() {
    await fetch("/api/admin-login", { method: "DELETE" }).catch(() => {});
    window.location.href = "/admin-login";
  }

  return (
    <button
      onClick={signOut}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}
