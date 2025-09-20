# Invoice Dashboard Performance Validation

Base URL: <set by script>

## Summary

| Area        | Metric                    | Measured | Target | Status |
|-------------|---------------------------|----------|--------|--------|
| Lighthouse  | Performance Score         | - | ≥ 90 | - |
| Page Load   | Initial Load (ms)         | - | < 1000 | - |
| API         | /api/invoices avg (ms)    | - | < 200 | - |
| API         | /api/stats avg (ms)       | - | < 200 | - |
| API         | /api/outstanding avg (ms) | - | < 200 | - |
| Render      | 200 rows (ms)             | - | < 100 | - |
| Render      | 1000 rows (ms)            | - | < 200 | - |
| Render      | 10000 rows (ms)           | - | < 300 | - |
| Bundle      | JS total (bytes)          | - | < 1000000 | - |
| A11y        | WCAG 2.1 AA Violations    | - | 0 | - |

## Failures

- None (placeholder)

## Recommendations

- If Lighthouse < target: ensure static assets are cached, reduce main-thread work, confirm dynamic import boundaries for charts/tables.
- If API latency > target: validate DB indexes are in use, check PostgREST explain plans, increase edge cache or add server-side in-memory caches.
- If render time > target: reduce props churn, memoize row cells, verify virtualization overscan, and avoid expensive cell formatters.
- If bundle > target: exclude devtools in prod, tree-shake icons/libs, split chart libs.
- If a11y violations: address axe rule IDs in results, add missing labels/roles/contrast.

