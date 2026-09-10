import { Question } from '../App';

export const blankspaceMasterQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the core philosophy and focus of the Blankspace Community?',
    options: [
      'Theoretical lectures with zero practical building',
      'Selling textbooks and certificates',
      'Empowering students with hands-on tech, design & real builds',
      'Exclusive private memberships for professors only',
    ],
    correctAnswer: 2,
    timeLimit: 20,
  },
  {
    id: '2',
    text: 'Which domain focuses on engineering scalable web architectures like Next.js & React?',
    options: [
      'Web Engineering',
      'Legacy COBOL',
      'Hardware Soldering',
      'Manual Accounting',
    ],
    correctAnswer: 0,
    timeLimit: 20,
  },
  {
    id: '3',
    text: 'What is the standout flagship build sprint and hackathon event at Blankspace?',
    options: [
      'Lecture Marathon',
      'Annual Fee Day',
      'Paper Exam Series',
      'BuildX Project Sprint',
    ],
    correctAnswer: 3,
    timeLimit: 20,
  },
  {
    id: '4',
    text: 'How can any student join and contribute to Blankspace initiatives?',
    options: [
      'Only with 10+ years of corporate industry experience',
      'Through open workshops, projects, and active participation',
      'By invitation from government officials only',
      'It is permanently closed to all college students',
    ],
    correctAnswer: 1,
    timeLimit: 15,
  },
  {
    id: '5',
    text: 'What programming language is widely recognized as the foundation of interactive web development?',
    options: [
      'Fortran 77',
      'Visual Basic 6',
      'JavaScript',
      'Assembly 8086',
    ],
    correctAnswer: 2,
    timeLimit: 15,
  },
  {
    id: '6',
    text: 'In Git version control, which command creates a new feature branch and switches to it?',
    options: [
      'git push origin master',
      'git checkout -b <branch>',
      'git reset --hard HEAD~1',
      'git remote remove origin',
    ],
    correctAnswer: 1,
    timeLimit: 20,
  },
  {
    id: '7',
    text: 'What is the primary superpower gained by building real projects in student teams?',
    options: [
      'Memorizing syntax without understanding it',
      'Passing standardized multiple-choice tests',
      'Collecting dusty participation certificates',
      'Practical problem-solving, collaboration & ship mentality',
    ],
    correctAnswer: 3,
    timeLimit: 15,
  },
  {
    id: '8',
    text: 'Which modern runtime allows executing JavaScript & TypeScript with ultra-fast native performance?',
    options: [
      'Bun / Node.js',
      'Internet Explorer 6 Engine',
      'Flash Player',
      'Silverlight',
    ],
    correctAnswer: 0,
    timeLimit: 15,
  },
  {
    id: '9',
    text: 'What does "API" stand for in software and backend architectures?',
    options: [
      'Automated Personal Information',
      'Analog Processor Integration',
      'Application Programming Interface',
      'Advanced Program Instruction',
    ],
    correctAnswer: 2,
    timeLimit: 15,
  },
  {
    id: '10',
    text: 'Which Blankspace vertical specializes in UI/UX typography, prototyping, and visual brand identity?',
    options: [
      'Mechanical Thermodynamics',
      'Product & Design Domain',
      'Bureaucratic Documentation',
      'Database Auditing',
    ],
    correctAnswer: 1,
    timeLimit: 15,
  },
  {
    id: '11',
    text: 'What is the fastest way to get your questions answered and collaborate in Blankspace?',
    options: [
      'Sending physical handwritten letters via post',
      'Filing a formal notary request',
      'Waiting until graduation day',
      'Engaging in active Discord & WhatsApp community channels',
    ],
    correctAnswer: 3,
    timeLimit: 15,
  },
  {
    id: '12',
    text: 'What is the ultimate rule when shipping projects at Blankspace hackathons?',
    options: [
      'Build fast, break limits, learn constantly & showcase live!',
      'Never touch a computer before reading 10 books',
      'Copy paste without understanding any line of code',
      'Keep your idea completely secret forever',
    ],
    correctAnswer: 0,
    timeLimit: 15,
  },
];

// Helper to randomly shuffle question options for dynamic sessions while preserving correct answer
export function shuffleQuestionOptions(q: Question): Question {
  const correctText = q.options[q.correctAnswer];
  const shuffledOptions = [...q.options];
  
  // Fisher-Yates shuffle
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  const newCorrectIndex = shuffledOptions.indexOf(correctText);

  return {
    ...q,
    options: shuffledOptions,
    correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

