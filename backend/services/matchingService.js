const calculateMatchScore = (candidateSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  if (!candidateSkills || candidateSkills.length === 0) return 0;

  const normalizedCandidate = candidateSkills.map((s) => s.trim().toLowerCase());
  const normalizedRequired = requiredSkills.map((s) => s.trim().toLowerCase());

  const matchedSkills = normalizedRequired.filter((skill) =>
    normalizedCandidate.some((cs) => {
      if (cs === skill) return true;
      if (cs.includes(skill) || skill.includes(cs)) return true;
      return false;
    })
  );

  const score = Math.round((matchedSkills.length / normalizedRequired.length) * 100);
  return Math.min(score, 100);
};

const getMatchedSkills = (candidateSkills, requiredSkills) => {
  if (!requiredSkills || !candidateSkills) return { matched: [], missing: [] };

  const normalizedCandidate = candidateSkills.map((s) => s.trim().toLowerCase());
  const normalizedRequired = requiredSkills.map((s) => s.trim().toLowerCase());

  const matched = [];
  const missing = [];

  normalizedRequired.forEach((skill) => {
    const isMatch = normalizedCandidate.some((cs) => {
      if (cs === skill) return true;
      if (cs.includes(skill) || skill.includes(cs)) return true;
      return false;
    });

    if (isMatch) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  return { matched, missing };
};

module.exports = { calculateMatchScore, getMatchedSkills };
