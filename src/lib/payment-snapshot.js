function moneyTotal(payments = []) {
  return Math.round(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) * 100) / 100;
}

export function scopeWorkOrderThroughPayment(workOrder, paymentId) {
  const targetId = Number(paymentId);
  const payments = Array.isArray(workOrder?.payments) ? workOrder.payments : [];

  if (!Number.isInteger(targetId) || targetId <= 0) {
    return { workOrder, payment: null, payments };
  }

  const index = payments.findIndex((payment) => Number(payment.id) === targetId);
  if (index < 0) return { workOrder, payment: null, payments };

  const scopedPayments = payments.slice(0, index + 1);
  const paidTotal = moneyTotal(scopedPayments);
  const total = Number(workOrder?.total || 0);
  const isPaidSnapshot = total > 0 && paidTotal >= total - 0.005;
  const payment = scopedPayments[index];

  return {
    payment,
    payments: scopedPayments,
    workOrder: {
      ...workOrder,
      payments: scopedPayments,
      statut: isPaidSnapshot ? "paid" : (workOrder?.invoiceSentAt ? "sent" : "invoiced"),
      paidAt: isPaidSnapshot ? (payment?.paidAt || payment?.createdAt || workOrder?.paidAt || null) : null,
    },
  };
}
