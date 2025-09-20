export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-prose">
        The page you are looking for doesn’t exist or may have been moved.
      </p>
      <a
        href="/"
        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
      >
        Go back home
      </a>
    </div>
  )
}


