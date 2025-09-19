-- ============================================================================
-- Migration: Invoice Dashboard Enhancements (ID-002 & ID-003)
-- Description: Adds materialized views, functions, indexes, and tables to
--              support dashboard KPI accuracy and advanced invoice filtering
--              plus export job orchestration.
-- ============================================================================

-- Safety: enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- 1. Dashboard KPI materialized view + helper function
-- ---------------------------------------------------------------------------

drop materialized view if exists dashboard_invoice_metrics_mv;
create materialized view dashboard_invoice_metrics_mv as
select
    date_trunc('day', coalesce("invoice_date", "created_at")) as metric_day,
    count(*)                                                     as total_invoices,
    count(*) filter (where "amount_due" is null or "amount_due" > 0)                             as pending_count,
    count(*) filter (where "amount_due" = 0)                                                        as paid_count,
    count(*) filter (
      where "amount_due" is not null
        and "amount_due" > 0
        and "due_date" is not null
        and "due_date" < now()
    )                                                                                              as overdue_count,
    coalesce(sum("total"), 0)::numeric(18,2)                                                      as total_amount,
    coalesce(sum("total") filter (where "amount_due" is null or "amount_due" > 0), 0)::numeric(18,2) as pending_amount,
    coalesce(sum("total") filter (
      where "amount_due" is not null
        and "amount_due" > 0
        and "due_date" is not null
        and "due_date" < now()
    ), 0)::numeric(18,2)                                                                            as overdue_amount,
    coalesce(sum("total") filter (where "amount_due" = 0), 0)::numeric(18,2)                       as paid_amount
from "Invoice"
group by 1
with data;

create unique index if not exists idx_dashboard_invoice_metrics_day
    on dashboard_invoice_metrics_mv(metric_day);

comment on materialized view dashboard_invoice_metrics_mv is
    'Aggregated invoice metrics per day for dashboard KPI rendering.';

-- Helper function to refresh the materialized view (for cron or manual trigger)
create or replace function rpc_refresh_dashboard_metrics()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    refresh materialized view concurrently dashboard_invoice_metrics_mv;
end;
$$;

comment on function rpc_refresh_dashboard_metrics is
    'Triggers a concurrent refresh of dashboard_invoice_metrics_mv.';

-- Public function to fetch aggregated metrics between dates with trend deltas
create or replace function rpc_dashboard_metrics(
    p_date_from timestamptz default now() - interval '30 days',
    p_date_to   timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    current_period record;
    previous_period record;
    result jsonb;
begin
    -- Aggregate current period
    select
        coalesce(sum(total_invoices), 0)   as total_invoices,
        coalesce(sum(pending_count), 0)    as pending_count,
        coalesce(sum(overdue_count), 0)    as overdue_count,
        coalesce(sum(paid_count), 0)       as paid_count,
        coalesce(sum(total_amount), 0)     as total_amount,
        coalesce(sum(pending_amount), 0)   as pending_amount,
        coalesce(sum(overdue_amount), 0)   as overdue_amount,
        coalesce(sum(paid_amount), 0)      as paid_amount
    into current_period
    from dashboard_invoice_metrics_mv
    where metric_day >= date_trunc('day', p_date_from)
      and metric_day <= date_trunc('day', p_date_to);

    -- Aggregate previous period (same length immediately preceding)
    select
        coalesce(sum(total_invoices), 0)   as total_invoices,
        coalesce(sum(pending_count), 0)    as pending_count,
        coalesce(sum(overdue_count), 0)    as overdue_count,
        coalesce(sum(paid_count), 0)       as paid_count,
        coalesce(sum(total_amount), 0)     as total_amount
    into previous_period
    from dashboard_invoice_metrics_mv
    where metric_day >= date_trunc('day', p_date_from) - (p_date_to - p_date_from)
      and metric_day <  date_trunc('day', p_date_from);

    result := jsonb_build_object(
        'totals', jsonb_build_object(
            'totalInvoices', current_period.total_invoices,
            'pending', current_period.pending_count,
            'overdue', current_period.overdue_count,
            'paid', current_period.paid_count,
            'totalAmount', current_period.total_amount,
            'pendingAmount', current_period.pending_amount,
            'overdueAmount', current_period.overdue_amount,
            'paidAmount', current_period.paid_amount
        ),
        'trends', jsonb_build_object(
            'invoiceDelta', case when previous_period.total_invoices = 0 then null
                                  else round(((current_period.total_invoices - previous_period.total_invoices)::numeric
                                               / nullif(previous_period.total_invoices,0)) * 100, 2) end,
            'amountDelta', case when previous_period.total_amount = 0 then null
                                 else round(((current_period.total_amount - previous_period.total_amount)::numeric
                                              / nullif(previous_period.total_amount,0)) * 100, 2) end
        )
    );

    return result;
end;
$$;

comment on function rpc_dashboard_metrics(timestamptz, timestamptz) is
    'Returns aggregated dashboard metrics (totals + trend deltas) as JSON.';

-- ---------------------------------------------------------------------------
-- 2. Invoice filter facets view
-- ---------------------------------------------------------------------------

create or replace view invoice_filter_facets_v as
with base as (
    select
        coalesce(source, 'Uncategorized')          as category,
        coalesce(supplier_name, 'Unknown Vendor') as vendor_name,
        coalesce(supplier_email, '')              as vendor_email,
        total,
        created_at,
        due_date,
        amount_due
    from "Invoice"
),
status_counts as (
    select
        count(*) filter (where amount_due is null or amount_due > 0)                             as pending_count,
        count(*) filter (where amount_due = 0)                                                    as paid_count,
        count(*) filter (
            where amount_due is not null
              and amount_due > 0
              and due_date is not null
              and due_date < now()
        )                                                                                          as overdue_count
    from base
),
category_counts as (
    select category, count(*) as category_count
    from base
    group by category
),
vendor_counts as (
    select
        vendor_name,
        max(nullif(vendor_email, '')) as vendor_email,
        count(*) as vendor_count
    from base
    group by vendor_name
)
select jsonb_build_object(
    'statuses', jsonb_build_array(
        jsonb_build_object('value', 'pending', 'count', pending_count),
        jsonb_build_object('value', 'paid', 'count', paid_count),
        jsonb_build_object('value', 'overdue', 'count', overdue_count)
    ),
    'categories', coalesce(
        (
            select jsonb_agg(jsonb_build_object('value', category, 'count', category_count) order by category)
            from category_counts
        ),
        '[]'::jsonb
    ),
    'vendors', coalesce(
        (
            select jsonb_agg(jsonb_build_object('value', vendor_name, 'email', vendor_email, 'count', vendor_count) order by vendor_name)
            from vendor_counts
        ),
        '[]'::jsonb
    ),
    'amountRange', jsonb_build_object(
        'min', (select coalesce(min(total), 0) from base),
        'max', (select coalesce(max(total), 0) from base)
    ),
    'dateRange', jsonb_build_object(
        'min', (select min(created_at) from base),
        'max', (select max(created_at) from base)
    )
) as facets;

comment on view invoice_filter_facets_v is
    'Precomputed facets (status/category/vendor/amount/date) for invoice filters.';

-- ---------------------------------------------------------------------------
-- 3. Saved views + export job tables & functions
-- ---------------------------------------------------------------------------

create table if not exists invoice_saved_views (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null,
    name          text not null,
    filters       jsonb not null,
    is_default    boolean not null default false,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create unique index if not exists idx_invoice_saved_views_user_name
    on invoice_saved_views(user_id, lower(name));

create index if not exists idx_invoice_saved_views_default
    on invoice_saved_views(user_id)
    where is_default = true;

comment on table invoice_saved_views is
    'Stores user-defined saved filter configurations for the invoices dashboard.';

create table if not exists invoice_export_jobs (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null,
    status             text not null default 'pending',
    requested_filters  jsonb not null default '{}'::jsonb,
    row_count          integer,
    file_path          text,
    error_message      text,
    created_at         timestamptz not null default now(),
    started_at         timestamptz,
    completed_at       timestamptz
);

create index if not exists idx_invoice_export_jobs_user
    on invoice_export_jobs(user_id, created_at desc);

comment on table invoice_export_jobs is
    'Tracks CSV export requests and their processing state.';

create or replace function rpc_enqueue_invoice_export(
    p_user_id uuid,
    p_filters jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id uuid;
begin
    insert into invoice_export_jobs(user_id, requested_filters)
    values (p_user_id, coalesce(p_filters, '{}'::jsonb))
    returning id into v_id;

    -- background job trigger placeholder (handled externally)
    return v_id;
end;
$$;

comment on function rpc_enqueue_invoice_export(uuid, jsonb) is
    'Enqueues an invoice export job and returns the job id. External worker consumes the job queue.';

-- ---------------------------------------------------------------------------
-- 4. Supporting indexes on Invoice table
-- ---------------------------------------------------------------------------

create index if not exists idx_invoice_total_amount
    on "Invoice" (total);

create index if not exists idx_invoice_supplier_name_trgm
    on "Invoice" using gin (supplier_name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 5. Metadata
-- ---------------------------------------------------------------------------

comment on function rpc_enqueue_invoice_export is
    'Queue helper used by the invoices UI to initiate CSV exports.';

-- ============================================================================
-- End of migration
-- ============================================================================
