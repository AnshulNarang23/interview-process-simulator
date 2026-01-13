/**
 * HR Answer Validation Service
 * Validates text-based HR answers using AI
 * Evaluates answers based on role requirements
 */

/**
 * Validate HR answer using AI
 * @param {string} answer - The text answer to validate
 * @param {string} question - The question asked
 * @param {string} role - The role applied for
 * @returns {Promise<{score: number, feedback: string}>}
 */
export const validateHRAnswer = async (answer, question, role) => {
  // Check if OpenAI API key is configured
  const apiKey = localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    // For development/demo: Use mock validation
    return mockValidateHRAnswer(answer, question, role);
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
            content: `You are an HR interviewer evaluating a candidate's answer for the role: ${role}. 
            Evaluate the answer based on relevance, clarity, professionalism, and role-specific capabilities. 
            Return a JSON object with: score (0-100), feedback (string explaining your assessment).`
          },
          {
            role: 'user',
            content: `Role: ${role}\n\nQuestion: ${question}\n\nAnswer: ${answer}\n\nEvaluate this answer and provide a score (0-100) and feedback.`
          }
        ],
        temperature: 0.3,
        max_tokens: 300
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
        score: result.score || 0,
        feedback: result.feedback || 'Answer evaluated'
      };
    } catch {
      // If not JSON, extract information from text
      const scoreMatch = content.match(/(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      
      return {
        score: Math.min(score, 100),
        feedback: content
      };
    }
  } catch (error) {
    console.error('AI validation error:', error);
    // Fallback to mock validation
    return mockValidateHRAnswer(answer, question, role);
  }
};

/**
 * Mock validation for development/demo
 */
const mockValidateHRAnswer = (answer, question, role) => {
  const answerLength = answer.trim().length;
  
  // Basic validation: Check if answer has meaningful content
  if (answerLength < 50) {
    return {
      score: 40,
      feedback: 'Answer is too brief. Please provide more detailed response demonstrating your capabilities.'
    };
  }
  
  // Check for role-relevant keywords
  const roleKeywords = {
    'Software Engineer': ['code', 'programming', 'development', 'algorithm', 'software', 'technical', 'project'],
    'Data Analyst': ['data', 'analysis', 'analytics', 'insights', 'statistics', 'reporting', 'visualization'],
    'Product Manager': ['product', 'strategy', 'stakeholder', 'roadmap', 'user', 'market', 'business'],
    'Designer': ['design', 'user experience', 'ui', 'ux', 'prototype', 'wireframe', 'visual'],
    'DevOps Engineer': ['deployment', 'infrastructure', 'ci/cd', 'cloud', 'automation', 'monitoring'],
  };
  
  const keywords = roleKeywords[role] || [];
  const hasRelevantKeywords = keywords.some(keyword => 
    answer.toLowerCase().includes(keyword.toLowerCase())
  );
  
  let score = 60; // Base score
  
  if (answerLength > 100) score += 10;
  if (answerLength > 200) score += 10;
  if (hasRelevantKeywords) score += 15;
  if (answerLength > 300) score += 5;
  
  return {
    score: Math.min(score, 100),
    feedback: `Answer demonstrates ${hasRelevantKeywords ? 'good' : 'basic'} understanding. Score: ${Math.min(score, 100)}%`
  };
};

