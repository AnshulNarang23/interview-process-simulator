# Interview Process Simulator for Campus Hiring

A complete web application that simulates a real campus recruitment process with multiple interview rounds and generates candidate performance analytics.

## 🚀 Features

- **Candidate Registration**: Smooth form entry with validation
- **Aptitude Round**: 10 multiple-choice questions with auto-scoring
- **Coding Round**: 2 coding problems with 30-minute timer
- **HR Round**: 5 behavioral questions with self-rating (1-5 scale)
- **Results Dashboard**: Comprehensive analytics with charts
- **Data Persistence**: All data stored in browser LocalStorage
- **Smooth Animations**: Professional animations using Framer Motion
- **Responsive Design**: Works perfectly on all devices

## 🛠️ Tech Stack

- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Vite** - Build tool

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🏗️ Project Structure

```
interview-process-simulator/
├── src/
│   ├── components/          # Reusable components (if any)
│   ├── pages/              # Page components
│   │   ├── RegistrationPage.jsx
│   │   ├── AptitudePage.jsx
│   │   ├── CodingPage.jsx
│   │   ├── HRPage.jsx
│   │   └── DashboardPage.jsx
│   ├── utils/
│   │   └── localStorageService.js  # LocalStorage utilities
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎯 Usage Flow

1. **Registration**: Enter your name, email, and role applied for
2. **Aptitude Round**: Answer 10 multiple-choice questions
3. **Coding Round**: Review 2 coding problems (30-minute timer)
4. **HR Round**: Rate yourself on 5 behavioral questions
5. **Dashboard**: View your results with charts and final selection status

## 📊 Scoring System

- **Aptitude Round**: Based on correct answers (0-100%)
- **Coding Round**: Fixed sample score (75% for demonstration)
- **HR Round**: Average of self-ratings converted to percentage
- **Overall Score**: Average of all three rounds
- **Selection Criteria**: Pass if overall score ≥ 60%

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   - Option A: Use Vercel CLI
     ```bash
     vercel
     ```
   - Option B: Use Vercel Dashboard
     - Push your code to GitHub
     - Import project in Vercel
     - Deploy automatically

### Deploy to Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `dist`
3. **Push to GitHub and connect to Netlify**

## 🎨 Customization

### Change Questions

Edit the question arrays in:
- `src/pages/AptitudePage.jsx` - APTITUDE_QUESTIONS
- `src/pages/CodingPage.jsx` - CODING_QUESTIONS
- `src/pages/HRPage.jsx` - HR_QUESTIONS

### Modify Scoring

Adjust scoring logic in:
- `src/pages/AptitudePage.jsx` - handleSubmit function
- `src/pages/CodingPage.jsx` - submitCodingRound function
- `src/pages/HRPage.jsx` - handleSubmit function
- `src/pages/DashboardPage.jsx` - overall score calculation

### Styling

Modify Tailwind classes or update `tailwind.config.js` for theme customization.

## 📝 Notes

- All data is stored in browser LocalStorage
- Clearing browser data will reset the interview process
- The coding round uses a fixed sample score for demonstration
- Timer in coding round auto-submits when it reaches 0

## 🐛 Troubleshooting

**Issue**: Dependencies not installing
- Solution: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Issue**: Styles not loading
- Solution: Ensure Tailwind CSS is properly configured in `tailwind.config.js` and `postcss.config.js`

**Issue**: Routing not working
- Solution: For production builds, ensure your hosting platform is configured for SPA routing (e.g., add `_redirects` file for Netlify)

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Development

Built with ❤️ using React, Tailwind CSS, Framer Motion, and Recharts.

---

**Ready to start your interview journey?** 🚀

