import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getCandidate, getAptitudeScore, getCodingScore, getHRScore, clearAllData } from '../utils/localStorageService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [scores, setScores] = useState({
    aptitude: null,
    coding: null,
    hr: null
  });
  const [finalStatus, setFinalStatus] = useState(null);
  const [overallScore, setOverallScore] = useState(null);

  useEffect(() => {
    const candidateData = getCandidate();
    if (!candidateData) {
      navigate('/');
      return;
    }
    setCandidate(candidateData);

    // Get all scores
    const aptitudeScore = getAptitudeScore();
    const codingScore = getCodingScore();
    const hrScore = getHRScore();

    setScores({
      aptitude: aptitudeScore,
      coding: codingScore,
      hr: hrScore
    });

    // Calculate overall score (average of all rounds)
    if (aptitudeScore !== null && codingScore !== null && hrScore !== null) {
      const overall = (aptitudeScore + codingScore + hrScore) / 3;
      setOverallScore(overall);
      setFinalStatus(overall >= 60 ? 'Selected' : 'Not Selected');
    }
  }, [navigate]);

  // Prepare data for bar chart
  const barChartData = [
    { name: 'Aptitude', Score: scores.aptitude || 0 },
    { name: 'Coding', Score: scores.coding || 0 },
    { name: 'HR', Score: scores.hr || 0 }
  ];

  // Prepare data for pie chart
  const pieChartData = [
    { name: 'Pass', value: finalStatus === 'Selected' ? 1 : 0 },
    { name: 'Fail', value: finalStatus === 'Not Selected' ? 1 : 0 }
  ];

  const COLORS = ['#8b5cf6', '#ef4444'];

  // Handle reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new interview process? This will clear all your data.')) {
      clearAllData();
      navigate('/');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  if (!candidate || overallScore === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            variants={cardVariants}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Interview Results Dashboard
            </h1>
            <p className="text-white/80">
              {candidate.name} | {candidate.role}
            </p>
          </motion.div>

          {/* Final Status Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 mb-8 text-center"
            variants={cardVariants}
          >
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {finalStatus === 'Selected' ? '🎉' : '📋'}
            </motion.div>
            <h2 className={`text-3xl font-bold mb-2 ${
              finalStatus === 'Selected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {finalStatus}
            </h2>
            <p className="text-gray-600 mb-4">Overall Score</p>
            <motion.div
              className="text-5xl font-bold text-purple-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {overallScore.toFixed(1)}%
            </motion.div>
          </motion.div>

          {/* Round Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              variants={cardVariants}
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aptitude Round
              </h3>
              <div className="text-3xl font-bold text-purple-600">
                {scores.aptitude?.toFixed(1)}%
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              variants={cardVariants}
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Coding Round
              </h3>
              <div className="text-3xl font-bold text-purple-600">
                {scores.coding?.toFixed(1)}%
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              variants={cardVariants}
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                HR Round
              </h3>
              <div className="text-3xl font-bold text-purple-600">
                {scores.hr?.toFixed(1)}%
              </div>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              variants={cardVariants}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Round-wise Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Score" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              variants={cardVariants}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Selection Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="flex justify-center gap-4"
            variants={cardVariants}
          >
            <motion.button
              onClick={handleReset}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start New Interview
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;

