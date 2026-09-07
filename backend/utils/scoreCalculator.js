/**
 * ============================================================================
 * ASSESSMENT SCORING & CAREER MATCHING ALGORITHM (scoreCalculator.js)
 * ============================================================================
 * Purpose: Computes aggregated domain trait scores (Aptitude, Personality,
 * Interest, EQ, Skills) from user question responses and matches candidate
 * trait profiles against career qualification requirements to generate a ranked
 * percentage match list of recommended career pathways.
 * ============================================================================
 */

/**
 * Calculates domain aggregates and specific trait scores from user answer responses.
 * @param {Array<Object>} responses - User answer rows joined with question score weights
 * @returns {Object} { aggregates, traitScores }
 */
const calculateScores = (responses) => {
  // Initialize aggregate score buckets for 5 assessment dimensions
  const aggregates = { aptitude: 0, personality: 0, interest: 0, eq: 0, skills: 0 };
  const traitScores = {};

  // Helper function to extract option score weight from question row
  const scoreForOption = (row, opt) => {
    if (!opt) return 0;
    const key = String(opt).toLowerCase();
    if (key === 'a') return row.score_a || 0;
    if (key === 'b') return row.score_b || 0;
    if (key === 'c') return row.score_c || 0;
    if (key === 'd') return row.score_d || 0;
    return 0;
  };

  // Iterate over each recorded response and accumulate trait scores
  for (const r of responses) {
    const scoreWeight = scoreForOption(r, r.selected_option);
    const trait = (r.mapped_trait || '').toLowerCase();
    
    // Accumulate domain score into corresponding aggregate bucket
    if (trait === 'aptitude') aggregates.aptitude += scoreWeight;
    else if (trait === 'personality') aggregates.personality += scoreWeight;
    else if (trait === 'interest') aggregates.interest += scoreWeight;
    else if (trait === 'eq') aggregates.eq += scoreWeight;
    else if (trait === 'skills') aggregates.skills += scoreWeight;

    // Accumulate specific trait score
    if (trait) {
      traitScores[trait] = (traitScores[trait] || 0) + scoreWeight;
    }
  }

  // Round computed aggregate scores
  for (const k of Object.keys(aggregates)) {
    aggregates[k] = Math.round(aggregates[k]);
  }

  return { aggregates, traitScores };
};

/**
 * Matches calculated user trait profile against career catalog requirements.
 * @param {Object} traitScores - Calculated user trait scores object
 * @param {Array<Object>} careers - Career role records from DB
 * @returns {Array<Object>} Ranked career recommendations with match percentage
 */
const matchCareers = (traitScores, careers) => {
  const recommendations = [];

  for (const c of careers) {
    let req = [];
    try {
      req = JSON.parse(c.required_traits).traits || [];
    } catch (e) {
      req = [];
    }
    if (req.length === 0) continue;

    let sum = 0;
    let count = 0;

    // Sum scores for required traits
    for (const t of req) {
      const key = String(t).toLowerCase();
      if (traitScores[key]) {
        sum += traitScores[key];
        count++;
      }
    }

    // Calculate match percentage scaled to 100% max
    const matchPercent = count === 0 ? 0 : Math.min(100, Math.round((sum / (count * 5)) * 20));
    recommendations.push({ id: c.id, career_name: c.career_name, match: matchPercent });
  }

  // Sort career recommendations in descending order of match percentage
  recommendations.sort((a, b) => b.match - a.match);

  return recommendations;
};

// Export scoring and matching algorithm helper functions
module.exports = { calculateScores, matchCareers };
