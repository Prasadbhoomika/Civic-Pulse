/**
 * Intelligent Priority Scoring Algorithm for CivicPulse
 * 
 * Formula:
 * Score = Severity Weight (0-30) 
 *       + Category Urgency (0-25) 
 *       + Support Bonus (0-20) 
 *       + Time Pending (0-15) 
 *       + Location Risk (0-10)
 * Total Score = 0 - 100
 */

const SEVERITY_WEIGHTS = {
  low: 10,
  medium: 18,
  high: 25,
  critical: 30
};

const CATEGORY_URGENCY = {
  'Electrical Hazards': 25,
  'Water Leakage': 22,
  'Potholes & Roads': 20,
  'Drainage & Waterlogging': 20,
  'Traffic Signals': 18,
  'Fallen Trees': 15,
  'Garbage & Sanitation': 12,
  'Streetlights': 10,
  'Public Infrastructure': 10,
  'Other': 8
};

function calculatePriority({ severity = 'medium', category = 'Other', supportCount = 1, createdAt = new Date(), locationRisk = 5 }) {
  // 1. Severity weight
  const sevScore = SEVERITY_WEIGHTS[severity.toLowerCase()] || 18;

  // 2. Category urgency
  const catScore = CATEGORY_URGENCY[category] || 10;

  // 3. Support count (up to 20 points, +2 pts per supporter up to 10 supporters)
  const supScore = Math.min(20, Math.max(0, (supportCount - 1) * 2 + 4));

  // 4. Time pending factor (older unresolved issues get higher priority up to 15 points)
  const ageInHours = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
  const timeScore = Math.min(15, Math.floor(ageInHours / 12));

  // 5. Location risk (5-10 default)
  const locScore = Math.min(10, Math.max(1, locationRisk));

  const totalScore = Math.min(100, sevScore + catScore + supScore + timeScore + locScore);

  let label = 'Low';
  if (totalScore >= 81) label = 'Critical';
  else if (totalScore >= 61) label = 'High';
  else if (totalScore >= 31) label = 'Medium';

  return {
    score: totalScore,
    label,
    breakdown: {
      severityWeight: sevScore,
      categoryUrgency: catScore,
      supportBonus: supScore,
      timePending: timeScore,
      locationRisk: locScore
    },
    explanation: `Calculated priority ${totalScore}/100 (${label}): Severity (${sevScore}), Category Urgency (${catScore}), Supporters (${supScore}), Time Pending (${timeScore}), Location Risk (${locScore})`
  };
}

module.exports = {
  calculatePriority
};
