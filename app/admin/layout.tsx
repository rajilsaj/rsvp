import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b surface sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-6">
          <Link href="/admin" className="font-display text-xl text-primary shrink-0">
            Admin
          </Link>
          <div className="flex gap-1">
            <Link
              href="/admin/guests"
              className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted transition-colors"
            >
              Guests
            </Link>
            <Link
              href="/admin/seating"
              className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted transition-colors"
            >
              Seating
            </Link>
            <Link
              href="/admin/updates"
              className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted transition-colors"
            >
              Updates
            </Link>
          </div>
          <div className="ml-auto">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View site →
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
