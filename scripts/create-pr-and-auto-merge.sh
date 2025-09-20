#!/usr/bin/env bash
set -euo pipefail

# Create/locate a PR from phase2-clean-implementation -> main and enable auto-merge
# Requirements:
#  - env var GH_TOKEN (classic or fine-grained with repo permissions)
#  - curl, jq
# Optional overrides:
#  - OWNER (default: Nitsur10)
#  - REPO (default: rpd_invoice-dashboard)
#  - HEAD (default: phase2-clean-implementation)
#  - BASE (default: main)
#  - MERGE_METHOD (default: SQUASH)  # also: MERGE, REBASE

OWNER=${OWNER:-Nitsur10}
REPO=${REPO:-rpd_invoice-dashboard}
HEAD=${HEAD:-phase2-clean-implementation}
BASE=${BASE:-main}
MERGE_METHOD=${MERGE_METHOD:-SQUASH}

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "GH_TOKEN is required (export a GitHub token with repo permissions)." >&2
  exit 2
fi

api() {
  local method=$1; shift
  local url=$1; shift
  curl -sSL -X "$method" \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$url" "$@"
}

graph() {
  local query=$1
  local vars=$2
  curl -sSL -X POST https://api.github.com/graphql \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -d @- <<EOF
{"query":$query,"variables":$vars}
EOF
}

echo "Checking for open PR from $HEAD to $BASE..."
OPEN=$(api GET "https://api.github.com/repos/$OWNER/$REPO/pulls?state=open&head=$OWNER:$HEAD&base=$BASE")
COUNT=$(echo "$OPEN" | jq 'length')

if [[ "$COUNT" -gt 0 ]]; then
  NUMBER=$(echo "$OPEN" | jq -r '.[0].number')
  HTML_URL=$(echo "$OPEN" | jq -r '.[0].html_url')
  echo "Found existing PR #$NUMBER: $HTML_URL"
else
  echo "Creating PR..."
  CREATE_BODY=$(jq -n --arg head "$HEAD" --arg base "$BASE" --arg title "Phase 2: Clean Implementation – performance + API hardening" --arg body "This PR merges the Phase 2 clean implementation with performance, API optimizations, and monitoring.\n\n- Supabase select columns + server-side aggregations\n- Indexes: invoice_date, payment_status, supplier_name, invoice_number\n- React Query caching with proper keys; prod-only Devtools\n- Memoization, dynamic imports for heavy modules\n- Server pagination + virtualization\n- Monitoring middleware + web-vitals; WCAG 2.1 AA fixes\n- CI perf tests (Lighthouse, bundle size, API/Render timings)" '{head:$head, base:$base, title:$title, body:$body}')
  CREATED=$(api POST "https://api.github.com/repos/$OWNER/$REPO/pulls" --data "$CREATE_BODY")
  NUMBER=$(echo "$CREATED" | jq -r '.number')
  HTML_URL=$(echo "$CREATED" | jq -r '.html_url')
  if [[ "$NUMBER" == "null" || -z "$NUMBER" ]]; then
    echo "Failed to create PR: $CREATED" >&2
    exit 3
  fi
  echo "Created PR #$NUMBER: $HTML_URL"
fi

echo "Fetching PR node id via GraphQL..."
Q='query($owner:String!,$name:String!,$number:Int!){ repository(owner:$owner,name:$name){ pullRequest(number:$number){ id url } } }'
V=$(jq -n --arg owner "$OWNER" --arg name "$REPO" --argjson number "$NUMBER" '{owner:$owner,name:$name,number:$number}')
NODE=$(graph "$(jq -Rs . <<<"$Q")" "$(jq -Rs . <<<"$V")")
PR_ID=$(echo "$NODE" | jq -r '.data.repository.pullRequest.id')
if [[ -z "$PR_ID" || "$PR_ID" == "null" ]]; then
  echo "Failed to obtain PR node id: $NODE" >&2
  exit 4
fi

echo "Enabling auto-merge ($MERGE_METHOD) via GraphQL..."
MUT='mutation($pullRequestId:ID!,$method:PullRequestMergeMethod!){ enablePullRequestAutoMerge(input:{pullRequestId:$pullRequestId, mergeMethod:$method}){ clientMutationId } }'
MV=$(jq -n --arg id "$PR_ID" --arg method "$MERGE_METHOD" '{pullRequestId:$id, method:$method}')
RES=$(graph "$(jq -Rs . <<<"$MUT")" "$(jq -Rs . <<<"$MV")")
if echo "$RES" | jq -e '.errors' >/dev/null; then
  echo "Auto-merge enable reported errors (proceeding if branch protection waits for checks): $RES" >&2
else
  echo "Auto-merge enabled."
fi

echo "Done. GitHub will merge when checks and protections allow."
