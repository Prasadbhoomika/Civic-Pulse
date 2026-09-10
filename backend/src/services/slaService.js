/**
 * SLA Calculation and Monitoring Service for CivicPulse
 */

const SLA_HOURS = {
  Critical: 24,
  High: 48,
  Medium: 72,
  Low: 168 // 7 days
};

function calculateSlaDeadline(priority = 'Medium', startDate = new Date()) {
  const hours = SLA_HOURS[priority] || 72;
  const deadline = new Date(startDate);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

function getSlaStatus(deadline, currentStatus = 'submitted') {
  if (['resolved', 'closed', 'rejected'].includes(currentStatus)) {
    return { status: 'within_sla', timeRemainingHours: 0, isBreached: false };
  }

  const now = new Date();
  const diffMs = new Date(deadline) - now;
  const timeRemainingHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

  if (diffMs <= 0) {
    return { status: 'breached', timeRemainingHours: 0, isBreached: true };
  } else if (timeRemainingHours <= 6) {
    return { status: 'due_soon', timeRemainingHours, isBreached: false };
  } else {
    return { status: 'within_sla', timeRemainingHours, isBreached: false };
  }
}

module.exports = {
  SLA_HOURS,
  calculateSlaDeadline,
  getSlaStatus
};
