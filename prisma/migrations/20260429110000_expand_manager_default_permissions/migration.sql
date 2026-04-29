ALTER TABLE "manager_clients"
ALTER COLUMN "permissions"
SET DEFAULT ARRAY[
  'view_work_orders',
  'view_invoices',
  'view_quotes',
  'request_intervention',
  'approve_quotes',
  'manage_units',
  'manage_openings'
]::TEXT[];

UPDATE "manager_clients"
SET "permissions" = (
  SELECT ARRAY(
    SELECT DISTINCT permission
    FROM unnest(
      "manager_clients"."permissions" || ARRAY[
        'view_work_orders',
        'view_invoices',
        'view_quotes',
        'request_intervention',
        'approve_quotes',
        'manage_units',
        'manage_openings'
      ]::TEXT[]
    ) AS p(permission)
  )
);
