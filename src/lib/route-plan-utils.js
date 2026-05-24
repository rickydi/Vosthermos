export const ROUTABLE_WORK_ORDER_STATUSES = ["quote_accepted", "scheduled", "in_progress"];

const CLIENT_ROUTE_SELECT = {
  id: true,
  name: true,
  phone: true,
  secondaryPhone: true,
  address: true,
  city: true,
  postalCode: true,
};

const TECHNICIAN_ROUTE_SELECT = {
  id: true,
  name: true,
  phone: true,
};

export const ROUTE_WORK_ORDER_INCLUDE = {
  client: { select: CLIENT_ROUTE_SELECT },
  technician: { select: TECHNICIAN_ROUTE_SELECT },
  route: {
    select: {
      id: true,
      name: true,
      date: true,
      area: true,
      startCity: true,
      status: true,
    },
  },
};

export const ROUTE_PLAN_INCLUDE = {
  technician: { select: TECHNICIAN_ROUTE_SELECT },
  workOrders: {
    include: {
      client: { select: CLIENT_ROUTE_SELECT },
      technician: { select: TECHNICIAN_ROUTE_SELECT },
    },
    orderBy: [{ routePosition: "asc" }, { arrivalAt: "asc" }, { id: "asc" }],
  },
};

function numberOrNull(value) {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function isoOrNull(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

export function serializeRouteWorkOrder(wo) {
  if (!wo) return null;
  return {
    ...wo,
    date: isoOrNull(wo.date),
    arrivalAt: isoOrNull(wo.arrivalAt),
    departureAt: isoOrNull(wo.departureAt),
    createdAt: isoOrNull(wo.createdAt),
    updatedAt: isoOrNull(wo.updatedAt),
    totalPieces: numberOrNull(wo.totalPieces),
    totalLabor: numberOrNull(wo.totalLabor),
    laborRate: numberOrNull(wo.laborRate),
    subtotal: numberOrNull(wo.subtotal),
    tps: numberOrNull(wo.tps),
    tvq: numberOrNull(wo.tvq),
    total: numberOrNull(wo.total),
    route: wo.route
      ? {
          ...wo.route,
          date: isoOrNull(wo.route.date),
        }
      : null,
  };
}

export function serializeRoutePlan(route) {
  if (!route) return null;
  const workOrders = (route.workOrders || []).map(serializeRouteWorkOrder);
  const revenueTotal = workOrders.reduce((sum, wo) => sum + Number(wo?.total || 0), 0);
  return {
    ...route,
    date: isoOrNull(route.date),
    createdAt: isoOrNull(route.createdAt),
    updatedAt: isoOrNull(route.updatedAt),
    targetRevenue: numberOrNull(route.targetRevenue),
    workOrders,
    revenueTotal,
  };
}
