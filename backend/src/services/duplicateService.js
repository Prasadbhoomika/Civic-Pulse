/**
 * Duplicate Complaint Detection Service
 * Calculates distance between coordinates and checks category & keyword overlap
 */

// Haversine formula to calculate distance in meters
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

// Calculate text keyword similarity ratio (Jaccard similarity)
function getTextSimilarity(text1 = '', text2 = '') {
  const words1 = new Set(text1.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function detectDuplicates(newComplaint, existingComplaints, radiusMeters = 200) {
  const [newLng, newLat] = newComplaint.location?.coordinates || [0, 0];
  const duplicates = [];

  for (const item of existingComplaints) {
    if (item._id && newComplaint._id && item._id.toString() === newComplaint._id.toString()) continue;
    // Only compare against unresolved complaints
    if (['resolved', 'closed', 'rejected'].includes(item.status)) continue;

    const [itemLng, itemLat] = item.location?.coordinates || [0, 0];
    const distanceMeters = getHaversineDistance(newLat, newLng, itemLat, itemLng);

    if (distanceMeters <= radiusMeters) {
      const categoryMatch = item.category === newComplaint.category;
      const similarityScore = getTextSimilarity(newComplaint.title + ' ' + newComplaint.description, item.title + ' ' + item.description);

      let matchConfidence = 0;
      if (categoryMatch) matchConfidence += 50;
      matchConfidence += Math.round(similarityScore * 50);

      // If distance is extremely close (< 50m), boost confidence
      if (distanceMeters < 50) matchConfidence += 20;

      if (categoryMatch || matchConfidence >= 40) {
        duplicates.push({
          complaint: item,
          distanceMeters,
          confidencePercent: Math.min(99, matchConfidence),
          reason: `A similar ${item.category} issue was reported ${distanceMeters}m away from your location.`
        });
      }
    }
  }

  // Sort by highest confidence first
  return duplicates.sort((a, b) => b.confidencePercent - a.confidencePercent);
}

module.exports = {
  getHaversineDistance,
  getTextSimilarity,
  detectDuplicates
};
