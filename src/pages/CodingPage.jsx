import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { saveCodingScore, saveCurrentRound, getCandidate } from '../utils/localStorageService';
import { validateCodeWithAI } from '../utils/codeValidationService';
import { CODE_TEMPLATES, LANGUAGE_NAMES } from '../utils/codeTemplates';

// Expanded coding question pool - will randomly select 2 questions
const CODING_QUESTION_POOL = [
  {
    id: 1,
    title: 'Two Sum Problem',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`
  },
  {
    id: 2,
    title: 'Reverse Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Example:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Note: You need to implement the solution in-place with O(1) extra memory.`
  },
  {
    id: 3,
    title: 'Valid Parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example:
Input: s = "()[]{}"
Output: true`
  },
  {
    id: 4,
    title: 'Maximum Subarray',
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

Example:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.`
  },
  {
    id: 5,
    title: 'Best Time to Buy and Sell Stock',
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Example:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.`
  },
  {
    id: 6,
    title: 'Contains Duplicate',
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Example:
Input: nums = [1,2,3,1]
Output: true`
  }
];

// Function to shuffle array and get random questions
const getRandomCodingQuestions = (pool, count) => {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const CodingPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  // Store code and language for each question
  const [codeSolutions, setCodeSolutions] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({});

  useEffect(() => {
    const candidateData = getCandidate();
    if (!candidateData) {
      navigate('/');
      return;
    }
    setCandidate(candidateData);
    
    // Generate random questions for this session
    const randomQuestions = getRandomCodingQuestions(CODING_QUESTION_POOL, 2);
    setQuestions(randomQuestions);
    
    // Initialize with default language (Python) and empty templates
    const initialLanguages = {};
    const initialCodes = {};
    randomQuestions.forEach((q, index) => {
      initialLanguages[index] = 'python';
      initialCodes[index] = CODE_TEMPLATES.python;
    });
    setSelectedLanguages(initialLanguages);
    setCodeSolutions(initialCodes);
  }, [navigate]);

  // Handle language change
  const handleLanguageChange = (questionIndex, language) => {
    setSelectedLanguages(prev => ({
      ...prev,
      [questionIndex]: language
    }));
    
    // Update code with template for selected language
    setCodeSolutions(prev => ({
      ...prev,
      [questionIndex]: CODE_TEMPLATES[language]
    }));
  };

  // Handle code change
  const handleCodeChange = (questionIndex, code) => {
    setCodeSolutions(prev => ({
      ...prev,
      [questionIndex]: code
    }));
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitted]);

  // Auto submit when timer reaches 0
  const handleAutoSubmit = async () => {
    if (!isSubmitted) {
      await submitCodingRound();
    }
  };

  // Submit coding round with AI validation
  const submitCodingRound = async () => {
    // Check if all questions have code
    const allHaveCode = questions.every((_, index) => {
      const code = codeSolutions[index] || '';
      return code.trim().length > 50; // Minimum code length
    });

    if (!allHaveCode) {
      setShowValidationError(true);
      setValidationMessage('Please write complete solutions for all problems before submitting.');
      setTimeout(() => {
        setShowValidationError(false);
        setValidationMessage('');
      }, 4000);
      return;
    }

    setIsValidating(true);
    setValidationMessage('Validating your code with AI... Please wait.');

    try {
      // Validate each solution
      const validationResults = [];
      let totalScore = 0;

      for (let i = 0; i < questions.length; i++) {
        const code = codeSolutions[i];
        const language = selectedLanguages[i];
        const problemDescription = questions[i].description;

        const result = await validateCodeWithAI(code, language, problemDescription);
        validationResults.push(result);
        totalScore += result.score;

        // If any solution is invalid, fail the round
        if (!result.isValid) {
          setIsValidating(false);
          setShowValidationError(true);
          setValidationMessage(
            `Problem ${i + 1} validation failed: ${result.feedback}. Score: ${result.score}%. ` +
            `Please ensure your code correctly solves the problem (70%+ required).`
          );
          return;
        }
      }

      // Calculate average score
      const averageScore = totalScore / questions.length;
      
      // Only pass if average score is 70% or higher
      if (averageScore >= 70) {
        setScore(averageScore);
        setIsSubmitted(true);
        saveCodingScore(averageScore);
        saveCurrentRound('hr');
        setValidationMessage(`✅ All solutions validated! Average score: ${averageScore.toFixed(1)}%`);
      } else {
        setIsValidating(false);
        setShowValidationError(true);
        setValidationMessage(
          `Validation failed. Average score: ${averageScore.toFixed(1)}%. ` +
          `You need at least 70% to pass. Please review and improve your solutions.`
        );
      }
    } catch (error) {
      console.error('Validation error:', error);
      setIsValidating(false);
      setShowValidationError(true);
      setValidationMessage('Error validating code. Please try again or check your API key configuration.');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle manual submit
  const handleSubmit = async () => {
    if (!isSubmitted && !isValidating) {
      await submitCodingRound();
    }
  };

  // Navigate to next round
  const handleContinue = () => {
    navigate('/hr');
  };

  // Animation variants
  const timerVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  if (isSubmitted && score !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            ✅
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Coding Round Completed!
          </h2>
          <p className="text-gray-600 mb-6">
            Your code has been submitted and validated successfully.
          </p>
          <motion.button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to HR Round
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Coding Round
            </h1>
            <motion.div
              className={`px-4 py-2 rounded-lg font-bold ${
                timeLeft < 300
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
              variants={timerVariants}
              animate={timeLeft < 300 ? 'pulse' : ''}
            >
              ⏱️ {formatTime(timeLeft)}
            </motion.div>
          </div>
          {candidate && (
            <p className="text-gray-600">
              Candidate: {candidate.name} | Role: {candidate.role}
            </p>
          )}
        </div>

        {/* Validation Error/Success */}
        {(showValidationError || isValidating || validationMessage) && (
          <motion.div
            className={`border-l-4 p-4 mb-4 rounded ${
              isValidating
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : showValidationError
                ? 'bg-red-100 border-red-500 text-red-700'
                : 'bg-green-100 border-green-500 text-green-700'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-medium">
              {isValidating ? '⏳ ' : showValidationError ? '⚠️ ' : '✅ '}
              {validationMessage}
            </p>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Instructions:</strong> Select your preferred programming language for each problem. 
            A code template will be provided. Write your solution and submit. Your code will be validated using AI. 
            You need at least 70% correctness to pass this round. You have 30 minutes.
          </p>
        </div>

        {/* Coding Questions */}
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : (
          <div className="space-y-8 mb-6">
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                className="border-2 border-gray-200 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Problem {index + 1}: {q.title}
                  </h2>
                  {/* Language Selector */}
                  <select
                    value={selectedLanguages[index] || 'python'}
                    onChange={(e) => handleLanguageChange(index, e.target.value)}
                    disabled={isSubmitted || isValidating}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    {Object.entries(LANGUAGE_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {q.description}
                  </pre>
                </div>
                <textarea
                  value={codeSolutions[index] || ''}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  placeholder="Write your solution here..."
                  disabled={isSubmitted || isValidating}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitted || isValidating}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              isSubmitted || isValidating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
            }`}
            whileHover={!isSubmitted && !isValidating ? { scale: 1.02 } : {}}
            whileTap={!isSubmitted && !isValidating ? { scale: 0.98 } : {}}
          >
            {isValidating ? 'Validating...' : isSubmitted ? 'Submitted' : 'Submit & Validate Code'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
