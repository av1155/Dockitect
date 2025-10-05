Changes applied for P1.4 critical visual fixes

1) apps/web/app/globals.css
   - Added missing CSS variables for success token per style guide:
     :root  --success: #16a34a
     .dark  --success: #22c55e

2) apps/web/components/nodes/ServiceNode.tsx
   - Updated border color to use brand blue per spec:
     border-blue-600 dark:border-blue-500

3) apps/web/components/nodes/NetworkNode.tsx
   - Switched success border to use CSS token without fallback:
     border-[color:var(--success)]

4) apps/web/components/Canvas.tsx
   - Removed duplicate blueprint→nodes conversion logic and rely on store.setBlueprint as the single source of truth.
   - Replaced nodeTypes to use ServiceNode and NetworkNode directly.
   - Added clarifying comment regarding conversion location.

Verification
- Typecheck: passed (turbo across workspace)
- Lint: passed
- Playwright e2e tests: 11 passed
