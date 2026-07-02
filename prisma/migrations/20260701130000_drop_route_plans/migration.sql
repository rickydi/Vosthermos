-- Suppression du module Routes (jamais utilise: 0 plan de route cree).
ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "work_orders_routeId_fkey";

DROP INDEX IF EXISTS "work_orders_routeId_idx";

ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "routeId";

ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "routePosition";

DROP TABLE IF EXISTS "route_plans";
