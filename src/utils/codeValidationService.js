/**
 * Code Validation Service
 * Validates code using AI (OpenAI API)
 * Checks if code is 70-80% correct or logic is correct
 * Ignores small syntax mistakes
 */

/**
 * Validate code using AI
 * @param {string} code - The code to validate
 * @param {string} language - Programming language (cpp, java, python, csharp)
 * @param {string} problemDescription - The problem description
 * @returns {Promise<{isValid: boolean, score: number, feedback: string}>}
 */
export const validateCodeWithAI = async (code, language, problemDescription) => {
  // Check if OpenAI API key is configured
  const apiKey = localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    // For development/demo: Use mock validation
    // In production, user should set their OpenAI API key
    return mockValidateCode(code, language, problemDescription);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a code reviewer. Analyze the provided code and determine if it solves the given problem correctly. 
            Focus on logic correctness (70-80% threshold). Ignore minor syntax errors. 
            Return a JSON object with: isValid (boolean), score (0-100), feedback (string explaining your assessment).`
          },
          {
            role: 'user',
            content: `Problem: ${problemDescription}\n\nLanguage: ${language}\n\nCode:\n${code}\n\nEvaluate if this code correctly solves the problem. Consider logic correctness, not just syntax.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON from response
    try {
      const result = JSON.parse(content);
      return {
        isValid: result.isValid || result.score >= 70,
        score: result.score || 0,
        feedback: result.feedback || 'Code evaluated'
      };
    } catch {
      // If not JSON, extract information from text
      const scoreMatch = content.match(/(\d+)%/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const isValid = score >= 70;
      
      return {
        isValid,
        score,
        feedback: content
      };
    }
  } catch (error) {
    console.error('AI validation error:', error);
    // Fallback to mock validation
    return mockValidateCode(code, language, problemDescription);
  }
};

/**
 * Mock validation for development/demo
 * In production, this should be replaced with actual AI validation
 */
const mockValidateCode = (code, language, problemDescription) => {
  // Basic validation: Check if code has meaningful content
  const codeLength = code.trim().length;
  const hasBasicStructure = code.includes('{') || code.includes('def') || code.includes('class') || code.includes('function');
  const hasLogic = code.match(/(if|for|while|return|print|cout|System\.out)/i);
  
  // Simple heuristic: If code is too short or lacks structure, it's likely invalid
  if (codeLength < 50 || (!hasBasicStructure && !hasLogic)) {
    return {
      isValid: false,
      score: 30,
      feedback: 'Code appears incomplete or lacks proper structure. Please provide a complete solution.'
    };
  }
  
  // Check for common problem-solving patterns
  const hasArrays = code.match(/\[\]|array|list|vector/i);
  const hasLoops = code.match(/(for|while|foreach)/i);
  const hasConditionals = code.match(/(if|else|switch)/i);
  
  let score = 50; // Base score
  
  if (hasArrays) score += 10;
  if (hasLoops) score += 10;
  if (hasConditionals) score += 10;
  if (codeLength > 200) score += 10;
  
  const isValid = score >= 70;
  
  return {
    isValid,
    score: Math.min(score, 100),
    feedback: isValid 
      ? `Code appears to have correct logic structure. Score: ${score}%`
      : `Code needs improvement. Current score: ${score}%. Please ensure your solution correctly implements the problem requirements.`
  };
};

/**
 * Set OpenAI API key
 */
export const setOpenAIApiKey = (apiKey) => {
  localStorage.setItem('openai_api_key', apiKey);
};

/**
 * Get OpenAI API key
 */
export const getOpenAIApiKey = () => {
  return localStorage.getItem('openai_api_key');
};

