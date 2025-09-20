'use client'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset?: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-prose">
        An unexpected error occurred. Please try again later.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-left max-w-full overflow-auto p-3 rounded border">
          {error.message}
        </pre>
      )}
      <div className="flex items-center gap-2">
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          Go back home
        </a>
        {reset && (
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}


