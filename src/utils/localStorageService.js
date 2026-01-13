/**
 * LocalStorage Service
 * Handles all data persistence operations for the interview simulator
 */

// Keys for localStorage
const STORAGE_KEYS = {
  CANDIDATE: 'interview_candidate',
  APTITUDE_SCORE: 'interview_aptitude_score',
  APTITUDE_ANSWERS: 'interview_aptitude_answers',
  CODING_SCORE: 'interview_coding_score',
  HR_SCORE: 'interview_hr_score',
  HR_ANSWERS: 'interview_hr_answers',
  CURRENT_ROUND: 'interview_current_round',
};

/**
 * Save candidate profile
 */
export const saveCandidate = (candidateData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CANDIDATE, JSON.stringify(candidateData));
    return true;
  } catch (error) {
    console.error('Error saving candidate:', error);
    return false;
  }
};

/**
 * Get candidate profile
 */
export const getCandidate = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CANDIDATE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting candidate:', error);
    return null;
  }
};

/**
 * Save aptitude round score
 */
export const saveAptitudeScore = (score, answers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.APTITUDE_SCORE, JSON.stringify(score));
    localStorage.setItem(STORAGE_KEYS.APTITUDE_ANSWERS, JSON.stringify(answers));
    return true;
  } catch (error) {
    console.error('Error saving aptitude score:', error);
    return false;
  }
};

/**
 * Get aptitude round score
 */
export const getAptitudeScore = () => {
  try {
    const score = localStorage.getItem(STORAGE_KEYS.APTITUDE_SCORE);
    return score ? JSON.parse(score) : null;
  } catch (error) {
    console.error('Error getting aptitude score:', error);
    return null;
  }
};

/**
 * Save coding round score
 */
export const saveCodingScore = (score) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CODING_SCORE, JSON.stringify(score));
    return true;
  } catch (error) {
    console.error('Error saving coding score:', error);
    return false;
  }
};

/**
 * Get coding round score
 */
export const getCodingScore = () => {
  try {
    const score = localStorage.getItem(STORAGE_KEYS.CODING_SCORE);
    return score ? JSON.parse(score) : null;
  } catch (error) {
    console.error('Error getting coding score:', error);
    return null;
  }
};

/**
 * Save HR round score and answers
 */
export const saveHRScore = (score, answers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HR_SCORE, JSON.stringify(score));
    localStorage.setItem(STORAGE_KEYS.HR_ANSWERS, JSON.stringify(answers));
    return true;
  } catch (error) {
    console.error('Error saving HR score:', error);
    return false;
  }
};

/**
 * Get HR round score
 */
export const getHRScore = () => {
  try {
    const score = localStorage.getItem(STORAGE_KEYS.HR_SCORE);
    return score ? JSON.parse(score) : null;
  } catch (error) {
    console.error('Error getting HR score:', error);
    return null;
  }
};

/**
 * Save current round progress
 */
export const saveCurrentRound = (round) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROUND, round);
    return true;
  } catch (error) {
    console.error('Error saving current round:', error);
    return false;
  }
};

/**
 * Get current round progress
 */
export const getCurrentRound = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ROUND) || 'registration';
  } catch (error) {
    console.error('Error getting current round:', error);
    return 'registration';
  }
};

/**
 * Clear all interview data (for reset)
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Check if all rounds are completed
 */
export const isAllRoundsCompleted = () => {
  const aptitude = getAptitudeScore();
  const coding = getCodingScore();
  const hr = getHRScore();
  return aptitude !== null && coding !== null && hr !== null;
};

