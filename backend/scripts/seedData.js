/**
 * ============================================================================
 * CAREER ASSESSMENT SYSTEM - DATA SEEDING SCRIPT
 * ============================================================================
 * Purpose: Populates categories, questions, and careers tables with initial data
 * Usage: npm run seed
 * ============================================================================
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration from environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

// 1. CATEGORIES - 5 Assessment Dimensions
const categories = [
    {
        name: 'Aptitude',
        description: 'Logical & Analytical Thinking - Tests reasoning, problem-solving, and numerical ability'
    },
    {
        name: 'Personality',
        description: 'Traits & Work Style - Assesses behavioral preferences, work approach, and interpersonal style'
    },
    {
        name: 'Interest',
        description: 'Career Interests - Identifies preferences for different work environments and activities'
    },
    {
        name: 'Emotional Intelligence',
        description: 'Emotional Intelligence - Measures self-awareness, empathy, and emotional regulation skills'
    },
    {
        name: 'Skills',
        description: 'Skills & Abilities - Evaluates practical competencies and technical proficiencies'
    }
];

// 2. QUESTIONS - 50 Psychometric Assessment Questions
// Section 1: APTITUDE QUESTIONS (10 questions)
const aptitudeQuestions = [
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'A train travels 120 km in 2 hours. At this speed, how far will it travel in 5 hours?',
        option_a: '240 km',
        option_b: '300 km',
        option_c: '360 km',
        option_d: '400 km',
        score_a: 0,
        score_b: 1,
        score_c: 0,
        score_d: 0,
        correct_answer: 'B',
        correct_option: 'B',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'If x + 5 = 12, what is x?',
        option_a: '5',
        option_b: '6',
        option_c: '7',
        option_d: '8',
        score_a: 0,
        score_b: 0,
        score_c: 1,
        score_d: 0,
        correct_answer: 'C',
        correct_option: 'C',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'If today is Monday, what day will it be 100 days from now?',
        option_a: 'Monday',
        option_b: 'Tuesday',
        option_c: 'Wednesday',
        option_d: 'Thursday',
        score_a: 0,
        score_b: 1,
        score_c: 0,
        score_d: 0,
        correct_answer: 'B',
        correct_option: 'B',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'Find the missing number in the pattern: 2, 4, 8, 16, ?',
        option_a: '24',
        option_b: '28',
        option_c: '32',
        option_d: '36',
        score_a: 0,
        score_b: 0,
        score_c: 1,
        score_d: 0,
        correct_answer: 'C',
        correct_option: 'C',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'A father is 30 years older than his son. In 10 years, the father will be twice as old as his son. How old is the son now?',
        option_a: '10 years',
        option_b: '15 years',
        option_c: '20 years',
        option_d: '25 years',
        score_a: 0,
        score_b: 0,
        score_c: 1,
        score_d: 0,
        correct_answer: 'C',
        correct_option: 'C',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'If all roses are flowers and some flowers are red, which statement must be true?',
        option_a: 'All roses are red',
        option_b: 'Some roses may be red',
        option_c: 'No roses are red',
        option_d: 'All red things are roses',
        score_a: 0,
        score_b: 1,
        score_c: 0,
        score_d: 0,
        correct_answer: 'B',
        correct_option: 'B',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'Which of the following does NOT belong: Dog, Cat, Tiger, Table?',
        option_a: 'Dog',
        option_b: 'Cat',
        option_c: 'Tiger',
        option_d: 'Table',
        score_a: 0,
        score_b: 0,
        score_c: 0,
        score_d: 1,
        correct_answer: 'D',
        correct_option: 'D',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'Brother is to Sister as Nephew is to:',
        option_a: 'Cousin',
        option_b: 'Niece',
        option_c: 'Aunt',
        option_d: 'Mother',
        score_a: 0,
        score_b: 1,
        score_c: 0,
        score_d: 0,
        correct_answer: 'B',
        correct_option: 'B',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
        option_a: '0 degrees',
        option_b: '7.5 degrees',
        option_c: '15 degrees',
        option_d: '30 degrees',
        score_a: 0,
        score_b: 1,
        score_c: 0,
        score_d: 0,
        correct_answer: 'B',
        correct_option: 'B',
        score_weight: 1,
        mapped_trait: 'aptitude'
    },
    {
        category: 'Aptitude',
        question_type: 'MCQ',
        question_text: 'Complete the sequence: 1, 1, 2, 3, 5, 8, ?',
        option_a: '11',
        option_b: '12',
        option_c: '13',
        option_d: '14',
        score_a: 0,
        score_b: 0,
        score_c: 1,
        score_d: 0,
        correct_answer: 'C',
        correct_option: 'C',
        score_weight: 1,
        mapped_trait: 'aptitude'
    }
];

// Section 2: PERSONALITY QUESTIONS (10 questions) - Rating Scale 1-5
const personalityQuestions = [
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I enjoy working with a team rather than working alone.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I prefer tasks that are well-structured with clear guidelines.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I am comfortable taking risks and trying new things.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I enjoy solving complex problems that require deep thinking.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I can work well under pressure and meet tight deadlines.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I prefer working with numbers and data over creative tasks.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I feel comfortable speaking in front of large groups.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I prefer to follow instructions rather than create my own methods.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I naturally take charge and lead in group situations.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    },
    {
        category: 'Personality',
        question_type: 'Rating',
        question_text: 'I pay close attention to small details in my work.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'personality'
    }
];

// Section 3: INTEREST QUESTIONS (10 questions)
const interestQuestions = [
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'What type of work environment appeals to you most?',
        option_a: 'Office with computer work',
        option_b: 'Outdoor physical work',
        option_c: 'Workshop/Technical environment',
        option_d: 'Customer-facing service',
        score_a: 2,
        score_b: 1,
        score_c: 2,
        score_d: 2,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'How comfortable are you with using technology and computers?',
        option_a: 'Very uncomfortable',
        option_b: 'Somewhat uncomfortable',
        option_c: 'Comfortable',
        option_d: 'Very comfortable',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'Do you prefer indoor or outdoor work?',
        option_a: 'Strongly prefer indoor',
        option_b: 'Prefer indoor',
        option_c: 'Prefer outdoor',
        option_d: 'Strongly prefer outdoor',
        score_a: 2,
        score_b: 1,
        score_c: 1,
        score_d: 2,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'Would you rather work independently or as part of a team?',
        option_a: 'Strongly prefer independent',
        option_b: 'Prefer independent',
        option_c: 'Prefer team',
        option_d: 'Strongly prefer team',
        score_a: 1,
        score_b: 1,
        score_c: 2,
        score_d: 2,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'Which subject area interests you most?',
        option_a: 'Mathematics & Science',
        option_b: 'Languages & Communication',
        option_c: 'Arts & Creativity',
        option_d: 'Business & Finance',
        score_a: 2,
        score_b: 2,
        score_c: 1,
        score_d: 2,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'How do you feel about communicating with customers or clients?',
        option_a: 'Very uncomfortable',
        option_b: 'Somewhat uncomfortable',
        option_c: 'Comfortable',
        option_d: 'Very comfortable',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'What is most important to you in a career?',
        option_a: 'High salary',
        option_b: 'Job security',
        option_c: 'Personal growth',
        option_d: 'Helping others',
        score_a: 2,
        score_b: 2,
        score_c: 2,
        score_d: 2,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'Which work environment suits you best?',
        option_a: 'Fast-paced and dynamic',
        option_b: 'Structured and predictable',
        option_c: 'Flexible and varied',
        option_d: 'Calm and steady',
        score_a: 2,
        score_b: 2,
        score_c: 2,
        score_d: 1,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'How do you feel about working with numbers and calculations?',
        option_a: 'Very uncomfortable',
        option_b: 'Somewhat uncomfortable',
        option_c: 'Comfortable',
        option_d: 'Very comfortable',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    },
    {
        category: 'Interest',
        question_type: 'Preference',
        question_text: 'Do you prefer physical work or mental work?',
        option_a: 'Strongly prefer physical',
        option_b: 'Prefer physical',
        option_c: 'Prefer mental',
        option_d: 'Strongly prefer mental',
        score_a: 1,
        score_b: 1,
        score_c: 2,
        score_d: 2,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'interest'
    }
];

// Section 4: EMOTIONAL INTELLIGENCE QUESTIONS (10 questions)
const eqQuestions = [
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I stay calm and composed even in stressful situations.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I am aware of my emotions and understand why I feel a certain way.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I can easily understand how others are feeling.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I handle criticism well and use it to improve myself.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I can effectively resolve conflicts with others.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I am a good listener and pay attention when others speak.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I stay motivated even when faced with setbacks.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I adapt easily to changing situations and new environments.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I can control my emotions and avoid impulsive reactions.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    },
    {
        category: 'Emotional Intelligence',
        question_type: 'Rating',
        question_text: 'I am willing to learn from mistakes and continuously improve.',
        option_a: 'Strongly Disagree',
        option_b: 'Disagree',
        option_c: 'Agree',
        option_d: 'Strongly Agree',
        score_a: 1,
        score_b: 2,
        score_c: 3,
        score_d: 4,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'eq'
    }
];

// Section 5: SKILLS & ABILITIES QUESTIONS (10 questions)
const skillsQuestions = [
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Are you comfortable using computers and basic software?',
        option_a: 'No',
        option_b: 'Somewhat',
        option_c: 'Yes',
        option_d: 'Very comfortable',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Can you communicate effectively in English (speaking and writing)?',
        option_a: 'No',
        option_b: 'Basic level',
        option_c: 'Intermediate',
        option_d: 'Advanced',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Do you have experience handling money or financial transactions?',
        option_a: 'No experience',
        option_b: 'Little experience',
        option_c: 'Some experience',
        option_d: 'Significant experience',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Are you creative and good at designing or making things?',
        option_a: 'Not at all',
        option_b: 'Somewhat',
        option_c: 'Yes',
        option_d: 'Very creative',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Do you have technical skills like repairing electronics or machinery?',
        option_a: 'No',
        option_b: 'Basic knowledge',
        option_c: 'Some skills',
        option_d: 'Advanced skills',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Are you confident speaking in front of groups or presenting?',
        option_a: 'Not confident',
        option_b: 'Slightly confident',
        option_c: 'Confident',
        option_d: 'Very confident',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Can you manage time effectively and meet deadlines?',
        option_a: 'Struggle with it',
        option_b: 'Sometimes',
        option_c: 'Usually',
        option_d: 'Always',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Do you have teaching or training experience?',
        option_a: 'No',
        option_b: 'Informal experience',
        option_c: 'Some experience',
        option_d: 'Significant experience',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Are you good at organizing and planning events or tasks?',
        option_a: 'Not good',
        option_b: 'Somewhat',
        option_c: 'Good',
        option_d: 'Excellent',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    },
    {
        category: 'Skills',
        question_type: 'Boolean',
        question_text: 'Can you type quickly and accurately on a keyboard?',
        option_a: 'No',
        option_b: 'Slow',
        option_c: 'Moderate speed',
        option_d: 'Fast and accurate',
        score_a: 0,
        score_b: 1,
        score_c: 2,
        score_d: 3,
        correct_answer: null,
        correct_option: null,
        score_weight: 1,
        mapped_trait: 'skills'
    }
];

// 3. CAREERS - 11 Skill Domain & Job Roles
const careers = [
    {
        career_name: 'Banking & Financial Services',
        skill_domain: 'BFSI',
        course_training: 'Banking Operations, Financial Products, Customer Service',
        description: 'Work in banks, financial institutions handling customer accounts, loans, and financial transactions. Requires numerical skills and customer interaction.',
        required_traits: JSON.stringify({
            traits: ['aptitude', 'personality', 'interest', 'skills'],
            weights: { aptitude: 30, personality: 25, interest: 25, skills: 20 }
        })
    },
    {
        career_name: 'IT & Digital Skills',
        skill_domain: 'Information Technology',
        course_training: 'Computer fundamentals, Programming, Web Development, Digital Marketing',
        description: 'Technology-focused roles including software development, IT support, digital marketing, and data entry. High growth potential with tech skills.',
        required_traits: JSON.stringify({
            traits: ['aptitude', 'skills', 'interest'],
            weights: { aptitude: 35, skills: 35, interest: 30 }
        })
    },
    {
        career_name: 'Customer Relationship Management',
        skill_domain: 'CRM & Customer Service',
        course_training: 'Communication Skills, CRM Software, Customer Handling',
        description: 'Customer-facing roles in call centers, help desks, and customer support. Requires excellent communication and problem-solving skills.',
        required_traits: JSON.stringify({
            traits: ['personality', 'eq', 'skills', 'interest'],
            weights: { personality: 25, eq: 30, skills: 25, interest: 20 }
        })
    },
    {
        career_name: 'Retail Management',
        skill_domain: 'Retail & Sales',
        course_training: 'Retail Operations, Sales Techniques, Inventory Management',
        description: 'Retail store operations, sales, inventory management, and customer service in shops, malls, and supermarkets.',
        required_traits: JSON.stringify({
            traits: ['personality', 'interest', 'skills', 'eq'],
            weights: { personality: 30, interest: 25, skills: 25, eq: 20 }
        })
    },
    {
        career_name: 'Warehouse & Logistics',
        skill_domain: 'Supply Chain & Logistics',
        course_training: 'Warehouse Operations, Inventory Control, Supply Chain Management',
        description: 'Warehouse operations, inventory management, packaging, and logistics coordination. Physical work with organizational skills.',
        required_traits: JSON.stringify({
            traits: ['skills', 'personality', 'interest'],
            weights: { skills: 35, personality: 35, interest: 30 }
        })
    },
    {
        career_name: 'Healthcare - General Duty Assistant',
        skill_domain: 'Healthcare',
        course_training: 'Patient Care, Basic Medical Knowledge, Hospital Operations',
        description: 'Healthcare support roles assisting doctors and nurses with patient care, medical equipment handling, and hospital operations.',
        required_traits: JSON.stringify({
            traits: ['eq', 'personality', 'skills', 'interest'],
            weights: { eq: 35, personality: 25, skills: 20, interest: 20 }
        })
    },
    {
        career_name: 'Electrical & Technical Services',
        skill_domain: 'Electrical & Electronics',
        course_training: 'Electrical Wiring, Electronics Repair, Electrical Safety',
        description: 'Technical roles in electrical installation, maintenance, and repair. Includes electrician, electronics technician positions.',
        required_traits: JSON.stringify({
            traits: ['aptitude', 'skills', 'interest'],
            weights: { aptitude: 30, skills: 40, interest: 30 }
        })
    },
    {
        career_name: 'Beauty & Wellness',
        skill_domain: 'Beauty & Personal Care',
        course_training: 'Cosmetology, Hair Styling, Skincare, Makeup',
        description: 'Beauty services including hair styling, makeup, skincare treatments, and spa services. Creative and customer-focused work.',
        required_traits: JSON.stringify({
            traits: ['skills', 'personality', 'interest', 'eq'],
            weights: { skills: 30, personality: 25, interest: 25, eq: 20 }
        })
    },
    {
        career_name: 'Apparel & Tailoring',
        skill_domain: 'Fashion & Garments',
        course_training: 'Tailoring, Garment Construction, Fashion Design Basics',
        description: 'Tailoring, stitching, garment alteration, and basic fashion design. Skilled craft with creative elements.',
        required_traits: JSON.stringify({
            traits: ['skills', 'interest', 'personality'],
            weights: { skills: 40, interest: 30, personality: 30 }
        })
    },
    {
        career_name: 'Garment Production',
        skill_domain: 'Manufacturing',
        course_training: 'Sewing Machine Operation, Quality Control, Production Management',
        description: 'Factory-based garment production, sewing machine operation, quality checking, and production line work.',
        required_traits: JSON.stringify({
            traits: ['skills', 'personality', 'interest'],
            weights: { skills: 40, personality: 30, interest: 30 }
        })
    },
    {
        career_name: 'Facility Management',
        skill_domain: 'Facility & Maintenance',
        course_training: 'Building Maintenance, Facility Operations, Safety Management',
        description: 'Facility maintenance, housekeeping supervision, security, and building operations management.',
        required_traits: JSON.stringify({
            traits: ['personality', 'skills', 'interest'],
            weights: { personality: 35, skills: 35, interest: 30 }
        })
    }
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedDatabase() {
    let connection;
    try {
        console.log('🌱 Starting database seeding process...\n');
        
        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection established\n');

        // ========================================================================
        // TASK 1: SEED CATEGORIES
        // ========================================================================
        console.log('📁 TASK 1: Seeding Categories...');
        
        // Clear existing test category if needed
        await connection.query('DELETE FROM categories WHERE name = "General"');
        
        for (const category of categories) {
            const [existing] = await connection.query(
                'SELECT id FROM categories WHERE name = ?',
                [category.name]
            );
            
            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO categories (name, description) VALUES (?, ?)',
                    [category.name, category.description]
                );
                console.log(`   ✓ Added category: ${category.name}`);
            } else {
                console.log(`   ⊙ Category already exists: ${category.name}`);
            }
        }
        console.log('✅ Categories seeded successfully\n');

        // ========================================================================
        // TASKS 2-5: SEED ALL 50 QUESTIONS
        // ========================================================================
        console.log('❓ TASKS 2-5: Seeding Questions...');
        
        // Get category IDs
        const [categoryRows] = await connection.query('SELECT id, name FROM categories');
        const categoryMap = {};
        categoryRows.forEach(row => {
            categoryMap[row.name] = row.id;
        });

        // Clear existing test questions if needed
        await connection.query('DELETE FROM questions WHERE question_text LIKE "%test%"');

        // Combine all question arrays
        const allQuestions = [
            ...aptitudeQuestions,
            ...personalityQuestions,
            ...interestQuestions,
            ...eqQuestions,
            ...skillsQuestions
        ];

        let questionCount = 0;
        for (const question of allQuestions) {
            const categoryId = categoryMap[question.category];
            
            // Check if question already exists
            const [existing] = await connection.query(
                'SELECT id FROM questions WHERE question_text = ?',
                [question.question_text]
            );
            
            if (existing.length === 0) {
                await connection.query(
                    `INSERT INTO questions (
                        category_id, question_type, question_text,
                        option_a, option_b, option_c, option_d,
                        score_a, score_b, score_c, score_d,
                        correct_answer, correct_option, score_weight, mapped_trait, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        categoryId,
                        question.question_type,
                        question.question_text,
                        question.option_a,
                        question.option_b,
                        question.option_c,
                        question.option_d,
                        question.score_a,
                        question.score_b,
                        question.score_c,
                        question.score_d,
                        question.correct_answer,
                        question.correct_option,
                        question.score_weight,
                        question.mapped_trait,
                        'Active'
                    ]
                );
                questionCount++;
            }
        }
        console.log(`   ✓ Added ${questionCount} new questions`);
        console.log('✅ All 50 questions seeded successfully\n');

        // ========================================================================
        // TASK 6: SEED CAREERS
        // ========================================================================
        console.log('💼 TASK 6: Seeding Careers...');
        
        for (const career of careers) {
            const [existing] = await connection.query(
                'SELECT id FROM careers WHERE career_name = ?',
                [career.career_name]
            );
            
            if (existing.length === 0) {
                await connection.query(
                    `INSERT INTO careers (
                        career_name, skill_domain, course_training, description, required_traits
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        career.career_name,
                        career.skill_domain,
                        career.course_training,
                        career.description,
                        career.required_traits
                    ]
                );
                console.log(`   ✓ Added career: ${career.career_name}`);
            } else {
                console.log(`   ⊙ Career already exists: ${career.career_name}`);
            }
        }
        console.log('✅ All 11 careers seeded successfully\n');

        // ========================================================================
        // VERIFICATION
        // ========================================================================
        console.log('📊 Verification Summary:');
        const [categoriesCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
        const [questionsCount] = await connection.query('SELECT COUNT(*) as count FROM questions');
        const [careersCount] = await connection.query('SELECT COUNT(*) as count FROM careers');
        
        console.log(`   Categories: ${categoriesCount[0].count}`);
        console.log(`   Questions: ${questionsCount[0].count}`);
        console.log(`   Careers: ${careersCount[0].count}`);
        
        console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
        
    } catch (error) {
        console.error('❌ Error during database seeding:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Execute seeding
seedDatabase();
