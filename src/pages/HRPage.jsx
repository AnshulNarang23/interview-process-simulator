import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { saveHRScore, saveCurrentRound, getCandidate } from '../utils/localStorageService';
import { validateHRAnswer } from '../utils/hrValidationService';

// Role-specific HR question pools
const HR_QUESTIONS_BY_ROLE = {
  'Software Engineer': [
    {
      id: 1,
      question: 'Describe a challenging technical problem you solved. What was your approach and what did you learn?',
      category: 'Problem Solving'
    },
    {
      id: 2,
      question: 'How do you stay updated with the latest technologies and programming trends?',
      category: 'Learning & Growth'
    },
    {
      id: 3,
      question: 'Tell us about a time when you had to work under pressure to meet a deadline. How did you handle it?',
      category: 'Time Management'
    },
    {
      id: 4,
      question: 'Describe your experience working in a team on a software project. What role did you play?',
      category: 'Teamwork'
    },
    {
      id: 5,
      question: 'How do you approach debugging a complex issue in code? Walk us through your process.',
      category: 'Technical Skills'
    },
    {
      id: 6,
      question: 'What motivates you in software development? What projects excite you the most?',
      category: 'Motivation'
    },
    {
      id: 7,
      question: 'How do you handle code reviews and feedback from peers?',
      category: 'Receptiveness'
    },
    {
      id: 8,
      question: 'Describe a situation where you had to learn a new technology quickly for a project.',
      category: 'Adaptability'
    }
  ],
  'Data Analyst': [
    {
      id: 1,
      question: 'Describe a data analysis project you worked on. What insights did you discover?',
      category: 'Analytical Skills'
    },
    {
      id: 2,
      question: 'How do you ensure data quality and accuracy in your analysis?',
      category: 'Attention to Detail'
    },
    {
      id: 3,
      question: 'Tell us about a time when you had to present complex data findings to non-technical stakeholders.',
      category: 'Communication'
    },
    {
      id: 4,
      question: 'What tools and technologies do you use for data analysis? Why do you prefer them?',
      category: 'Technical Skills'
    },
    {
      id: 5,
      question: 'Describe a situation where your data analysis led to a significant business decision.',
      category: 'Impact'
    },
    {
      id: 6,
      question: 'How do you handle missing or incomplete data in your analysis?',
      category: 'Problem Solving'
    },
    {
      id: 7,
      question: 'What statistical methods or techniques do you use most frequently?',
      category: 'Technical Skills'
    },
    {
      id: 8,
      question: 'How do you stay current with data analysis trends and best practices?',
      category: 'Learning & Growth'
    }
  ],
  'Product Manager': [
    {
      id: 1,
      question: 'Describe a product feature you conceptualized and brought to market. What was your process?',
      category: 'Product Development'
    },
    {
      id: 2,
      question: 'How do you prioritize features in a product roadmap? What factors do you consider?',
      category: 'Strategic Thinking'
    },
    {
      id: 3,
      question: 'Tell us about a time when you had to make a difficult decision between competing stakeholder interests.',
      category: 'Decision Making'
    },
    {
      id: 4,
      question: 'How do you gather and incorporate user feedback into product decisions?',
      category: 'User-Centricity'
    },
    {
      id: 5,
      question: 'Describe your experience working with engineering and design teams. How do you facilitate collaboration?',
      category: 'Collaboration'
    },
    {
      id: 6,
      question: 'What metrics do you use to measure product success?',
      category: 'Analytics'
    },
    {
      id: 7,
      question: 'How do you handle product launches and manage expectations?',
      category: 'Project Management'
    },
    {
      id: 8,
      question: 'Tell us about a product failure or setback. What did you learn from it?',
      category: 'Learning & Growth'
    }
  ],
  'Designer': [
    {
      id: 1,
      question: 'Walk us through your design process from concept to final product.',
      category: 'Design Process'
    },
    {
      id: 2,
      question: 'How do you balance user needs with business requirements in your designs?',
      category: 'User-Centricity'
    },
    {
      id: 3,
      question: 'Describe a design challenge you faced and how you overcame it.',
      category: 'Problem Solving'
    },
    {
      id: 4,
      question: 'What design tools do you use and why? How do they fit into your workflow?',
      category: 'Technical Skills'
    },
    {
      id: 5,
      question: 'How do you handle feedback and criticism on your designs?',
      category: 'Receptiveness'
    },
    {
      id: 6,
      question: 'Tell us about a project where you had to work within tight constraints (time, budget, or technical).',
      category: 'Adaptability'
    },
    {
      id: 7,
      question: 'How do you stay inspired and keep up with design trends?',
      category: 'Learning & Growth'
    },
    {
      id: 8,
      question: 'Describe your experience collaborating with developers and product managers.',
      category: 'Collaboration'
    }
  ],
  'DevOps Engineer': [
    {
      id: 1,
      question: 'Describe your experience with CI/CD pipelines. What tools have you used?',
      category: 'Technical Skills'
    },
    {
      id: 2,
      question: 'How do you ensure system reliability and handle incidents?',
      category: 'Problem Solving'
    },
    {
      id: 3,
      question: 'Tell us about a time when you had to scale infrastructure quickly. How did you approach it?',
      category: 'Scalability'
    },
    {
      id: 4,
      question: 'What cloud platforms are you familiar with? Describe your experience.',
      category: 'Cloud Expertise'
    },
    {
      id: 5,
      question: 'How do you balance security with deployment speed?',
      category: 'Security'
    },
    {
      id: 6,
      question: 'Describe your experience with infrastructure as code. What tools do you prefer?',
      category: 'Automation'
    },
    {
      id: 7,
      question: 'How do you monitor and maintain system performance?',
      category: 'Monitoring'
    },
    {
      id: 8,
      question: 'Tell us about a challenging deployment or migration you handled.',
      category: 'Problem Solving'
    }
  ],
  // Default questions for other roles
  'default': [
    {
      id: 1,
      question: 'Tell us about yourself and why you are interested in this role.',
      category: 'Introduction'
    },
    {
      id: 2,
      question: 'Describe a challenging situation you faced at work or in a project. How did you handle it?',
      category: 'Problem Solving'
    },
    {
      id: 3,
      question: 'How do you work in a team environment? Give an example.',
      category: 'Teamwork'
    },
    {
      id: 4,
      question: 'What are your strengths and how do they relate to this position?',
      category: 'Self-Awareness'
    },
    {
      id: 5,
      question: 'How do you handle stress and pressure in the workplace?',
      category: 'Stress Management'
    },
    {
      id: 6,
      question: 'Where do you see yourself in 5 years?',
      category: 'Career Goals'
    },
    {
      id: 7,
      question: 'How do you stay motivated and continue learning?',
      category: 'Learning & Growth'
    },
    {
      id: 8,
      question: 'Why do you want to work for our company?',
      category: 'Company Fit'
    }
  ]
};

// Function to shuffle array and get random questions
const getRandomHRQuestions = (pool, count) => {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const HRPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [candidate, setCandidate] = useState(() => getCandidate());
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const candidateData = getCandidate();
    if (!candidateData) {
      navigate('/');
      return;
    }
    
    // Get role-specific questions
    const role = candidateData.role || 'default';
    const questionPool = HR_QUESTIONS_BY_ROLE[role] || HR_QUESTIONS_BY_ROLE['default'];
    
    // Generate random questions for this session (5 questions)
    const randomQuestions = getRandomHRQuestions(questionPool, 5);
    setQuestions(randomQuestions);
  }, [navigate]);

  // Handle answer change
  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
    // Clear validation error when user starts typing
    if (showValidationError) {
      setShowValidationError(false);
    }
  };

  // Move to next question
  const handleNext = () => {
    const currentAnswer = answers[currentQuestion] || '';
    
    // Check if current question is answered (minimum 50 characters)
    if (currentAnswer.trim().length < 50) {
      setShowValidationError(true);
      setValidationMessage('Please provide a detailed answer (at least 50 characters) before proceeding.');
      setTimeout(() => {
        setShowValidationError(false);
        setValidationMessage('');
      }, 3000);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowValidationError(false);
    } else {
      // On last question, check if all are answered before submitting
      handleSubmit();
    }
  };

  // Move to previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Calculate and submit HR score
  const handleSubmit = async () => {
    // Validate that all questions are answered
    if (questions.length === 0) return;
    
    const unansweredQuestions = questions.filter((_, index) => {
      const answer = answers[index] || '';
      return answer.trim().length < 50;
    });
    
    if (unansweredQuestions.length > 0) {
      setShowValidationError(true);
      setValidationMessage('Please provide detailed answers for all questions (minimum 50 characters each).');
      setTimeout(() => {
        setShowValidationError(false);
        setValidationMessage('');
      }, 3000);
      return;
    }

    setIsValidating(true);
    setValidationMessage('Evaluating your answers... Please wait.');

    try {
      // Validate each answer
      const validationResults = [];
      let totalScore = 0;

      for (let i = 0; i < questions.length; i++) {
        const answer = answers[i];
        const question = questions[i].question;
        const role = candidate?.role || 'default';

        const result = await validateHRAnswer(answer, question, role);
        validationResults.push(result);
        totalScore += result.score;
      }

      // Calculate average score
      const averageScore = totalScore / questions.length;
      
      setScore(averageScore);
      setIsSubmitted(true);

      // Save score to localStorage
      saveHRScore(averageScore, answers);
      saveCurrentRound('dashboard');
      setValidationMessage(`✅ Evaluation complete! Average score: ${averageScore.toFixed(1)}%`);
    } catch (error) {
      console.error('Validation error:', error);
      setIsValidating(false);
      setShowValidationError(true);
      setValidationMessage('Error evaluating answers. Please try again or check your API key configuration.');
    } finally {
      setIsValidating(false);
    }
  };

  // Navigate to dashboard
  const handleContinue = () => {
    navigate('/dashboard');
  };

  // Don't render until questions are loaded
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading questions...</div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion] || '';

  // Animation variants
  const questionVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
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
            🤝
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            HR Round Completed!
          </h2>
          <p className="text-gray-600 mb-6">
            Your answers have been submitted successfully.
          </p>
          <motion.button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Final Results
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            HR Round - Behavioral Assessment
          </h1>
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

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            variants={questionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-6">
              <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                {question.category}
              </p>
              <h2 className="text-xl font-semibold text-gray-800">
                {question.question}
              </h2>
            </div>

            {/* Text Answer Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer (Minimum 50 characters)
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Type your detailed answer here..."
                disabled={isSubmitted || isValidating}
              />
              <p className="text-xs text-gray-500 mt-2">
                {currentAnswer.length} characters (minimum 50 required)
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || isValidating}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentQuestion === 0 || isValidating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={isValidating}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isValidating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : currentAnswer.trim().length < 50
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRPage;
