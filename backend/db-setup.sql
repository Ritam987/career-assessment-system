-- ============================================================
-- Career Assessment System — Full Database Setup Script
-- Run: node run-db-setup.js
-- ============================================================

CREATE DATABASE IF NOT EXISTS career_assessment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE career_assessment_db;

-- Drop in reverse FK order so constraints don't block
DROP TABLE IF EXISTS assessment_results;
DROP TABLE IF EXISTS user_responses;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS careers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_settings;

-- ============================================================
-- TABLE 1: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(100)  UNIQUE NOT NULL,
    phone_number    VARCHAR(20),
    education_level VARCHAR(50),
    age             INT,
    password_hash   VARCHAR(255)  NOT NULL,
    profile_picture VARCHAR(500)  DEFAULT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(100)  UNIQUE NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    role            ENUM('SuperAdmin','Counselor') DEFAULT 'SuperAdmin',
    company_id      VARCHAR(100)  DEFAULT NULL,
    profile_picture VARCHAR(500)  DEFAULT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 3: categories  (4 fixed assessment categories)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    description TEXT
);

INSERT INTO categories (name, description) VALUES
('Personality', 'Measures core personality traits like leadership, teamwork, empathy, communication, and social behaviour.'),
('Skills',      'Measures practical, technical, numerical, and analytical abilities the user has or enjoys using.'),
('Interests',   'Measures what domains, activities, and types of work the user finds enjoyable and engaging.'),
('Work Style',  'Measures how the user prefers to work — routine vs creative, independent vs team, indoor vs outdoor.');

-- ============================================================
-- TABLE 4: questions  (80 total — 20 per category)
-- Scoring: A=5, B=4, C=2, D=1  (4-point forced-choice Likert)
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT          NOT NULL,
    question_text   TEXT         NOT NULL,
    question_type   VARCHAR(20)  DEFAULT 'Likert',
    mapped_trait    VARCHAR(100) DEFAULT NULL,
    option_a        VARCHAR(255) DEFAULT 'Strongly Agree',
    option_b        VARCHAR(255) DEFAULT 'Agree',
    option_c        VARCHAR(255) DEFAULT 'Disagree',
    option_d        VARCHAR(255) DEFAULT 'Strongly Disagree',
    correct_answer  VARCHAR(10)  DEFAULT NULL,
    score_a         INT          DEFAULT 5,
    score_b         INT          DEFAULT 4,
    score_c         INT          DEFAULT 2,
    score_d         INT          DEFAULT 1,
    status          ENUM('Active','Inactive') DEFAULT 'Active',
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- PERSONALITY (Category 1 — 20 Questions)
INSERT INTO questions (category_id, question_text, mapped_trait) VALUES
(1, 'I enjoy meeting and talking to new people.', 'extroversion'),
(1, 'I find it easy to understand how others are feeling.', 'empathy'),
(1, 'I stay calm and patient when things are not going my way.', 'patience'),
(1, 'I like taking charge and leading a group when needed.', 'leadership'),
(1, 'I am comfortable speaking in front of a group of people.', 'communication'),
(1, 'I try to help others even when it is not my responsibility.', 'helpfulness'),
(1, 'I keep trying even when a task becomes difficult.', 'persistence'),
(1, 'I take responsibility for my mistakes without blaming others.', 'accountability'),
(1, 'I can adjust easily when my plans suddenly change.', 'adaptability'),
(1, 'I pay close attention to small details to avoid errors.', 'attention_to_detail'),
(1, 'I enjoy motivating and encouraging people around me.', 'motivation'),
(1, 'I find it easy to trust people I work with.', 'trust'),
(1, 'I remain polite even when dealing with a difficult person.', 'patience'),
(1, 'I prefer to finish what I start before moving to the next task.', 'discipline'),
(1, 'I regularly show up on time and keep my commitments.', 'reliability'),
(1, 'I enjoy sharing my knowledge and skills with others.', 'helpfulness'),
(1, 'I feel confident in my ability to handle new situations.', 'confidence'),
(1, 'I can listen carefully without interrupting when someone speaks.', 'communication'),
(1, 'I treat everyone fairly regardless of their background.', 'fairness'),
(1, 'I remain positive even when facing difficult challenges.', 'resilience');

-- SKILLS (Category 2 — 20 Questions)
INSERT INTO questions (category_id, question_text, mapped_trait) VALUES
(2, 'I can perform basic calculations and handle numbers confidently.', 'numerical'),
(2, 'I am comfortable using a computer or mobile phone for work tasks.', 'digital_literacy'),
(2, 'I can read, understand, and write in my language clearly.', 'literacy'),
(2, 'I am good at organising information, files, or materials neatly.', 'organisation'),
(2, 'I can learn how to use a new tool or machine with some practice.', 'technical_learning'),
(2, 'I can explain things clearly so others understand easily.', 'communication_skill'),
(2, 'I can identify problems and come up with practical solutions.', 'problem_solving'),
(2, 'I can follow step-by-step instructions accurately.', 'instruction_following'),
(2, 'I am able to manage my time and complete tasks before the deadline.', 'time_management'),
(2, 'I can handle small amounts of money and give correct change.', 'numerical'),
(2, 'I can prepare basic reports or write down important information.', 'documentation'),
(2, 'I can work carefully with my hands to produce accurate results.', 'manual_dexterity'),
(2, 'I understand the importance of hygiene and cleanliness at work.', 'hygiene_awareness'),
(2, 'I can multitask and manage more than one job at the same time.', 'multitasking'),
(2, 'I am able to memorise procedures or rules quickly.', 'memory'),
(2, 'I can repair or fix simple things when they stop working.', 'technical_skill'),
(2, 'I am comfortable standing or being physically active for long hours.', 'physical_endurance'),
(2, 'I can draw, sketch, or design things with a sense of style.', 'creativity'),
(2, 'I can measure, cut, or assemble items with precision.', 'manual_dexterity'),
(2, 'I can handle customer queries and resolve complaints politely.', 'customer_service');

-- INTERESTS (Category 3 — 20 Questions)
INSERT INTO questions (category_id, question_text, mapped_trait) VALUES
(3, 'I enjoy helping people solve their problems or improve their situation.', 'social_service'),
(3, 'I like working with technology, gadgets, or computers.', 'technology'),
(3, 'I enjoy creating things with my hands such as sewing, cooking, or crafts.', 'hands_on_making'),
(3, 'I like working with numbers, accounts, or financial information.', 'finance'),
(3, 'I enjoy taking care of people who need support — children, elderly, or sick.', 'caregiving'),
(3, 'I am interested in buying, selling, or persuading others to purchase things.', 'sales_commerce'),
(3, 'I enjoy keeping spaces clean, organised, and well-maintained.', 'maintenance'),
(3, 'I like learning about health, medicine, or personal hygiene.', 'healthcare'),
(3, 'I am interested in fashion, beauty, and personal styling.', 'beauty_fashion'),
(3, 'I enjoy office work such as managing files, records, and communication.', 'administration'),
(3, 'I like teaching or explaining things to others so they understand.', 'teaching'),
(3, 'I enjoy physical work such as lifting, moving, or building things.', 'physical_work'),
(3, 'I am interested in food preparation and cooking for others.', 'food_service'),
(3, 'I like working outdoors or in the field rather than in an office.', 'outdoor_work'),
(3, 'I enjoy creative activities like art, design, or decoration.', 'creative_arts'),
(3, 'I am interested in community work and social development activities.', 'community_development'),
(3, 'I like driving or operating vehicles and machinery.', 'transport_logistics'),
(3, 'I enjoy research, reading, and gathering information on new topics.', 'research'),
(3, 'I am interested in security, discipline, and maintaining order.', 'security'),
(3, 'I like attending to customers and making them feel welcomed.', 'customer_relations');

-- WORK STYLE (Category 4 — 20 Questions)
INSERT INTO questions (category_id, question_text, mapped_trait) VALUES
(4, 'I prefer to follow a fixed daily routine rather than a changing schedule.', 'routine_preference'),
(4, 'I am comfortable working in a team and sharing responsibilities.', 'teamwork'),
(4, 'I prefer working indoors in a clean and controlled environment.', 'indoor_preference'),
(4, 'I am happy to work morning shifts starting early in the day.', 'morning_shift'),
(4, 'I prefer jobs where I can sit down for most of the working hours.', 'sedentary_work'),
(4, 'I like working closely with customers or members of the public daily.', 'customer_facing'),
(4, 'I am comfortable handling the same type of task repeatedly each day.', 'repetitive_tasks'),
(4, 'I prefer a job with a fixed monthly salary over one with commissions.', 'fixed_income'),
(4, 'I work well under supervision and value regular feedback from a manager.', 'supervised_work'),
(4, 'I am comfortable using a uniform or following a dress code at work.', 'professional_appearance'),
(4, 'I prefer a job where I can work independently without constant guidance.', 'independence'),
(4, 'I am willing to work evenings or weekends if required.', 'flexible_hours'),
(4, 'I enjoy jobs that involve physical movement and activity throughout the day.', 'physical_active'),
(4, 'I prefer a job that allows me to be creative and try new approaches.', 'creative_work'),
(4, 'I am comfortable working in a noisy or busy environment.', 'busy_environment'),
(4, 'I prefer roles where my work directly impacts other people positively.', 'impact_driven'),
(4, 'I am comfortable travelling short distances as part of my job.', 'travel_willingness'),
(4, 'I prefer to complete one task fully before taking on another.', 'focused_work'),
(4, 'I am motivated by recognition and appreciation for my work.', 'recognition_driven'),
(4, 'I prefer working for an organisation rather than being self-employed.', 'employment_preference');

-- ============================================================
-- TABLE 5: assessments  (one row per user attempt)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessments (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    user_id                     INT NOT NULL,
    status                      ENUM('In-Progress','Completed') DEFAULT 'In-Progress',
    last_answered_question_id   INT DEFAULT NULL,
    scoring_version             VARCHAR(20) DEFAULT 'v1.0',
    started_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at                TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 6: user_responses  (one row per question answered)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_responses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id   INT NOT NULL,
    user_id         INT NOT NULL,
    question_id     INT NOT NULL,
    selected_option VARCHAR(10) NOT NULL,
    score_earned    INT DEFAULT 0,
    UNIQUE KEY unique_response (assessment_id, question_id),
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (question_id)   REFERENCES questions(id)
);

-- ============================================================
-- TABLE 7: careers  (11 NGO skill domains with job roles)
-- required_traits weights must add up to 1.0
-- job_roles is a JSON array of specific job titles in that domain
-- ============================================================
CREATE TABLE IF NOT EXISTS careers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    career_name     VARCHAR(100) NOT NULL,
    skill_domain    VARCHAR(200),
    description     TEXT,
    course_training TEXT,
    required_traits JSON,
    job_roles       JSON,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO careers (career_name, skill_domain, description, course_training, required_traits, job_roles) VALUES

('BFSI',
 'Banking, Financial Services & Insurance',
 'Works in banks, insurance companies, or financial institutions handling customer accounts, sales, loans, and financial services. Strong numerical and communication skills are essential.',
 'Banking, Financial Services & Insurance',
 '{"personality":0.25,"skills":0.40,"interests":0.15,"work_style":0.20}',
 '["Banking Executive","Banking Associate","Customer Service Executive","Relationship Executive","Relationship Officer","Sales Executive","Field Sales Executive","Insurance Executive","Insurance Advisor","Loan/Collection Executive","Financial Services Associate"]'),

('IT & Digital Skills',
 'Information Technology & Digital Literacy',
 'Works with computers, data, and digital systems performing data entry, MIS reporting, office operations, and computer-based tasks. Strong computer and analytical skills are required.',
 'Basic Computer with Advanced Excel',
 '{"personality":0.15,"skills":0.45,"interests":0.20,"work_style":0.20}',
 '["Data Entry Operator","Computer Operator","MIS Executive","MIS Assistant","Back Office Executive","Data Processing Executive","Office Assistant","Documentation Executive","Computer Assistant","Operations Executive"]'),

('CRM & Customer Service',
 'Customer Relationship Management',
 'Manages customer relationships through non-voice channels like email, chat, and back-office operations. Requires strong communication, patience, and attention to detail.',
 'Customer Relationship Management (Non-Voice)',
 '{"personality":0.40,"skills":0.20,"interests":0.25,"work_style":0.15}',
 '["Customer Support Executive","CRM Executive","Customer Service Associate","Customer Relationship Executive","Back Office Executive","Non-Voice Process Associate","Chat Support Executive","Email Support Executive","Process Associate","Client Support Executive"]'),

('Retail Management',
 'Retail & Sales Operations',
 'Works on the shop floor in retail stores assisting customers, managing stock, completing sales, and maintaining store displays. Good energy and interpersonal skills are key.',
 'Retail Management',
 '{"personality":0.30,"skills":0.20,"interests":0.35,"work_style":0.15}',
 '["Retail Sales Associate","Sales Executive","Store Associate","Store Executive","Customer Service Associate","Cashier","Retail Associate","Sales Promoter","Store Assistant","Visual Merchandising Assistant","Stock Associate","Department Associate"]'),

('Warehouse & Logistics',
 'Warehouse Operations & Supply Chain',
 'Handles goods receiving, storage, dispatching, and inventory in warehouses and logistics centres. Requires physical fitness, discipline, and organisational skills.',
 'Warehouse Associate',
 '{"personality":0.15,"skills":0.25,"interests":0.20,"work_style":0.40}',
 '["Warehouse Associate","Warehouse Executive","Logistics Assistant","Inventory Assistant","Store Assistant","Store Keeper","Picker","Packer","Dispatch Executive","Loading/Unloading Associate","Inventory Executive","Material Handling Associate","Supply Chain Assistant"]'),

('Healthcare - GDA',
 'Healthcare & Patient Support',
 'Provides basic patient care, support, and assistance in hospitals, clinics, and home care settings. Requires empathy, patience, physical endurance, and hygiene awareness.',
 'General Duty Assistant',
 '{"personality":0.40,"skills":0.20,"interests":0.30,"work_style":0.10}',
 '["General Duty Assistant","Patient Care Assistant","Hospital Attendant","Healthcare Assistant","Patient Care Associate","Nursing Assistant","Home Care Assistant","Ward Assistant","Hospital Support Staff","Clinical Support Assistant","Caregiver"]'),

('Electrical & Technical Skills',
 'Electrical & Technical Maintenance',
 'Performs electrical installation, maintenance, and repair work at homes, offices, and industrial facilities. Requires technical aptitude, safety awareness, and hands-on skills.',
 'Junior Electrician',
 '{"personality":0.15,"skills":0.45,"interests":0.25,"work_style":0.15}',
 '["Junior Electrician","Electrical Assistant","Electrical Technician","Maintenance Assistant","Maintenance Technician","Field Technician","Service Technician","Wiring Technician","Installation Assistant","Electrical Helper","Facility Technician"]'),

('Beauty & Wellness',
 'Beauty, Salon & Personal Care',
 'Provides beauty and wellness treatments in salons, spas, and parlours including hair, skin, makeup, nails, and bridal services. Creative flair and interpersonal skills are important.',
 'Advanced Beautician',
 '{"personality":0.30,"skills":0.20,"interests":0.35,"work_style":0.15}',
 '["Beautician","Beauty Therapist","Salon Assistant","Beauty Consultant","Makeup Artist","Hair Stylist Assistant","Skin Care Therapist","Nail Care Assistant","Spa Assistant","Bridal Makeup Assistant","Salon Executive","Beauty Advisor"]'),

('Apparel & Tailoring',
 'Tailoring & Fashion Design',
 'Stitches, alters, and designs garments using hand and machine sewing. Includes boutique work and self-employment opportunities. Patience and precision are key.',
 'Tailoring',
 '{"personality":0.15,"skills":0.35,"interests":0.35,"work_style":0.15}',
 '["Tailor","Tailoring Assistant","Sewing Assistant","Garment Worker","Boutique Assistant","Alteration Assistant","Stitching Assistant","Production Assistant","Garment Finishing Assistant","Self-Employed Tailor"]'),

('Apparel & Garment Production',
 'Garment Manufacturing & Production',
 'Operates sewing machines and performs stitching, finishing, and quality tasks in garment factories and production units. Physical endurance and repetitive task tolerance are needed.',
 'Sewing Machine Operator',
 '{"personality":0.10,"skills":0.30,"interests":0.25,"work_style":0.35}',
 '["Sewing Machine Operator","Sewing Operator","Garment Production Assistant","Garment Worker","Stitching Operator","Production Operator","Sewing Assistant","Finishing Assistant","Quality Checking Assistant","Garment Factory Worker"]'),

('Facility Management',
 'Facility, Housekeeping & Maintenance',
 'Manages cleanliness, upkeep, and maintenance of buildings, offices, and properties. Requires discipline, reliability, attention to hygiene, and physical stamina.',
 'Facility Management',
 '{"personality":0.20,"skills":0.25,"interests":0.20,"work_style":0.35}',
 '["Facility Assistant","Facility Executive","Housekeeping Associate","Housekeeping Assistant","Maintenance Assistant","Cleaning Associate","Facility Support Staff","Office Support Assistant","Property Maintenance Assistant","Facility Operations Assistant"]');

-- ============================================================
-- TABLE 8: assessment_results  (final scored output)
-- career_matches stores the full ranked list as JSON
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_results (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL,
    assessment_id       INT NOT NULL UNIQUE,
    personality_score   DECIMAL(5,2) DEFAULT 0,
    skills_score        DECIMAL(5,2) DEFAULT 0,
    interest_score      DECIMAL(5,2) DEFAULT 0,
    work_style_score    DECIMAL(5,2) DEFAULT 0,
    career_matches      JSON         DEFAULT NULL,
    primary_career_id   INT          DEFAULT NULL,
    primary_career_name VARCHAR(100) DEFAULT NULL,
    primary_match_pct   DECIMAL(5,2) DEFAULT 0,
    scoring_version     VARCHAR(20)  DEFAULT 'v1.0',
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 9: system_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(500),
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value) VALUES
('scoring_version',   'v1.0'),
('total_questions',   '80'),
('questions_per_cat', '20'),
('max_score_per_q',   '5'),
('site_name',         'Career Assessment System'),
('maintenance_mode',  'false');

-- ============================================================
-- DONE. Tables: users, admins, categories, questions,
--              assessments, user_responses, careers,
--              assessment_results, system_settings
-- Seeded: 4 categories, 80 questions, 11 skill domains, settings
-- ============================================================
