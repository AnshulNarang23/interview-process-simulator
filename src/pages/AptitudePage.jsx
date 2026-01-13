import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAptitudeScore, saveCurrentRound, getCandidate } from '../utils/localStorageService';

// Expanded question pool - will randomly select 10 questions
const APTITUDE_QUESTION_POOL = [
  {
    id: 1,
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correct: 1
  },
  {
    id: 2,
    question: 'Which data structure follows LIFO principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correct: 1
  },
  {
    id: 3,
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Standard Query Language',
      'Sequential Query Language'
    ],
    correct: 0
  },
  {
    id: 4,
    question: 'Which sorting algorithm has the best average time complexity?',
    options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'],
    correct: 2
  },
  {
    id: 5,
    question: 'What is the default port for HTTP?',
    options: ['80', '443', '8080', '3000'],
    correct: 0
  },
  {
    id: 6,
    question: 'Which HTTP method is used to create a new resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correct: 1
  },
  {
    id: 7,
    question: 'What is the purpose of an index in a database?',
    options: [
      'To store data',
      'To improve query performance',
      'To delete records',
      'To create tables'
    ],
    correct: 1
  },
  {
    id: 8,
    question: 'What is REST API?',
    options: [
      'A programming language',
      'An architectural style for web services',
      'A database',
      'A framework'
    ],
    correct: 1
  },
  {
    id: 9,
    question: 'What is the maximum number of nodes in a binary tree of height h?',
    options: ['2^h', '2^h - 1', 'h^2', '2h'],
    correct: 1
  },
  {
    id: 10,
    question: 'Which is not a valid JavaScript data type?',
    options: ['undefined', 'number', 'character', 'boolean'],
    correct: 2
  },
  {
    id: 11,
    question: 'What is the time complexity of merge sort?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
    correct: 2
  },
  {
    id: 12,
    question: 'Which is a NoSQL database?',
    options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'],
    correct: 2
  },
  {
    id: 13,
    question: 'What does API stand for?',
    options: [
      'Application Programming Interface',
      'Advanced Programming Interface',
      'Automated Programming Interface',
      'Application Process Integration'
    ],
    correct: 0
  },
  {
    id: 14,
    question: 'What is the default port for HTTPS?',
    options: ['80', '443', '8080', '3000'],
    correct: 1
  },
  {
    id: 15,
    question: 'Which data structure follows FIFO principle?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correct: 1
  },
  {
    id: 16,
    question: 'What is the time complexity of linear search?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
    correct: 0
  },
  {
    id: 17,
    question: 'Which HTTP status code means "Not Found"?',
    options: ['200', '404', '500', '301'],
    correct: 1
  },
  {
    id: 18,
    question: 'What is Git?',
    options: [
      'A programming language',
      'A version control system',
      'A database',
      'A web framework'
    ],
    correct: 1
  },
  {
    id: 19,
    question: 'Which is a JavaScript framework?',
    options: ['Python', 'React', 'Java', 'C++'],
    correct: 1
  },
  {
    id: 20,
    question: 'What does DOM stand for?',
    options: [
      'Document Object Model',
      'Data Object Model',
      'Document Oriented Model',
      'Data Oriented Model'
    ],
    correct: 0
  },
  {
    id: 21,
    question: 'Which HTTP method is used to update a resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correct: 2
  },
  {
    id: 22,
    question: 'What is the time complexity of bubble sort?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
    correct: 3
  },
  {
    id: 23,
    question: 'Which is a relational database?',
    options: ['MongoDB', 'Redis', 'PostgreSQL', 'Elasticsearch'],
    correct: 2
  },
  {
    id: 24,
    question: 'What does CSS stand for?',
    options: [
      'Cascading Style Sheets',
      'Computer Style Sheets',
      'Creative Style Sheets',
      'Colorful Style Sheets'
    ],
    correct: 0
  },
  {
    id: 25,
    question: 'Which HTTP status code means "OK"?',
    options: ['200', '404', '500', '301'],
    correct: 0
  }
];

// Function to shuffle array and get random questions
const getRandomQuestions = (pool, count) => {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const AptitudePage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [showValidationError, setShowValidationError] = useState(false);

  useEffect(() => {
    const candidateData = getCandidate();
    if (!candidateData) {
      navigate('/');
      return;
    }
    setCandidate(candidateData);
    
    // Generate random questions for this session
    const randomQuestions = getRandomQuestions(APTITUDE_QUESTION_POOL, 10);
    setQuestions(randomQuestions);
  }, [navigate]);

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion]: optionIndex
      }));
    }
  };

  // Move to next question
  const handleNext = () => {
    // Check if current question is answered
    if (selectedAnswers[currentQuestion] === undefined) {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
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

  // Calculate and submit score
  const handleSubmit = () => {
    // Validate that all questions are answered
    if (questions.length === 0) return;
    
    const unansweredQuestions = questions.filter((_, index) => selectedAnswers[index] === undefined);
    
    if (unansweredQuestions.length > 0) {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
      return;
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correctCount++;
      }
    });

    const calculatedScore = (correctCount / questions.length) * 100;
    setScore(calculatedScore);
    setIsSubmitted(true);

    // Save score to localStorage
    saveAptitudeScore(calculatedScore, selectedAnswers);
    saveCurrentRound('coding');
  };

  // Navigate to next round
  const handleContinue = () => {
    navigate('/coding');
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
            ✅
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Aptitude Round Completed!
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
            Continue to Coding Round
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Aptitude Round
          </h1>
          {candidate && (
            <p className="text-gray-600">
              Candidate: {candidate.name} | Role: {candidate.role}
            </p>
          )}
        </div>

        {/* Validation Error */}
        {showValidationError && (
          <motion.div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-medium">⚠️ Please answer all questions before proceeding!</p>
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

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            variants={questionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {question.question}
            </h2>

            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-medium text-gray-700">{option}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AptitudePage;

