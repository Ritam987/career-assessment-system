-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: career_assessment_db
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (8,'Aptitude','Logical & Analytical Thinking - Tests reasoning, problem-solving, and numerical ability'),(9,'Personality','Traits & Work Style - Assesses behavioral preferences, work approach, and interpersonal style'),(10,'Interest','Career Interests - Identifies preferences for different work environments and activities'),(11,'Emotional Intelligence','Emotional Intelligence - Measures self-awareness, empathy, and emotional regulation skills'),(12,'Skills','Skills & Abilities - Evaluates practical competencies and technical proficiencies');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `question_type` enum('Aptitude','Rating','Preference','Boolean','MCQ') DEFAULT 'MCQ',
  `question_text` text NOT NULL,
  `option_a` varchar(255) DEFAULT NULL,
  `option_b` varchar(255) DEFAULT NULL,
  `option_c` varchar(255) DEFAULT NULL,
  `option_d` varchar(255) DEFAULT NULL,
  `score_a` int DEFAULT '0',
  `score_b` int DEFAULT '0',
  `score_c` int DEFAULT '0',
  `score_d` int DEFAULT '0',
  `correct_answer` varchar(255) DEFAULT NULL,
  `score_weight` int DEFAULT '1',
  `mapped_trait` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `correct_option` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (12,8,'MCQ','A train travels 120 km in 2 hours. At this speed, how far will it travel in 5 hours?','240 km','300 km','360 km','400 km',0,1,0,0,'B',1,'aptitude','Active','B'),(13,8,'MCQ','If x + 5 = 12, what is x?','5','6','7','8',0,0,1,0,'C',1,'aptitude','Active','C'),(14,8,'MCQ','If today is Monday, what day will it be 100 days from now?','Monday','Tuesday','Wednesday','Thursday',0,1,0,0,'B',1,'aptitude','Active','B'),(15,8,'MCQ','Find the missing number in the pattern: 2, 4, 8, 16, ?','24','28','32','36',0,0,1,0,'C',1,'aptitude','Active','C'),(16,8,'MCQ','A father is 30 years older than his son. In 10 years, the father will be twice as old as his son. How old is the son now?','10 years','15 years','20 years','25 years',0,0,1,0,'C',1,'aptitude','Active','C'),(17,8,'MCQ','If all roses are flowers and some flowers are red, which statement must be true?','All roses are red','Some roses may be red','No roses are red','All red things are roses',0,1,0,0,'B',1,'aptitude','Active','B'),(18,8,'MCQ','Which of the following does NOT belong: Dog, Cat, Tiger, Table?','Dog','Cat','Tiger','Table',0,0,0,1,'D',1,'aptitude','Active','D'),(19,8,'MCQ','Brother is to Sister as Nephew is to:','Cousin','Niece','Aunt','Mother',0,1,0,0,'B',1,'aptitude','Active','B'),(20,8,'MCQ','A clock shows 3:15. What is the angle between the hour and minute hands?','0 degrees','7.5 degrees','15 degrees','30 degrees',0,1,0,0,'B',1,'aptitude','Active','B'),(21,8,'MCQ','Complete the sequence: 1, 1, 2, 3, 5, 8, ?','11','12','13','14',0,0,1,0,'C',1,'aptitude','Active','C'),(22,9,'Rating','I enjoy working with a team rather than working alone.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(23,9,'Rating','I prefer tasks that are well-structured with clear guidelines.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(24,9,'Rating','I am comfortable taking risks and trying new things.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(25,9,'Rating','I enjoy solving complex problems that require deep thinking.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(26,9,'Rating','I can work well under pressure and meet tight deadlines.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(27,9,'Rating','I prefer working with numbers and data over creative tasks.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(28,9,'Rating','I feel comfortable speaking in front of large groups.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(29,9,'Rating','I prefer to follow instructions rather than create my own methods.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(30,9,'Rating','I naturally take charge and lead in group situations.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(31,9,'Rating','I pay close attention to small details in my work.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'personality','Active',NULL),(32,10,'Preference','What type of work environment appeals to you most?','Office with computer work','Outdoor physical work','Workshop/Technical environment','Customer-facing service',2,1,2,2,NULL,1,'interest','Active',NULL),(33,10,'Preference','How comfortable are you with using technology and computers?','Very uncomfortable','Somewhat uncomfortable','Comfortable','Very comfortable',0,1,2,3,NULL,1,'interest','Active',NULL),(34,10,'Preference','Do you prefer indoor or outdoor work?','Strongly prefer indoor','Prefer indoor','Prefer outdoor','Strongly prefer outdoor',2,1,1,2,NULL,1,'interest','Active',NULL),(35,10,'Preference','Would you rather work independently or as part of a team?','Strongly prefer independent','Prefer independent','Prefer team','Strongly prefer team',1,1,2,2,NULL,1,'interest','Active',NULL),(36,10,'Preference','Which subject area interests you most?','Mathematics & Science','Languages & Communication','Arts & Creativity','Business & Finance',2,2,1,2,NULL,1,'interest','Active',NULL),(37,10,'Preference','How do you feel about communicating with customers or clients?','Very uncomfortable','Somewhat uncomfortable','Comfortable','Very comfortable',0,1,2,3,NULL,1,'interest','Active',NULL),(38,10,'Preference','What is most important to you in a career?','High salary','Job security','Personal growth','Helping others',2,2,2,2,NULL,1,'interest','Active',NULL),(39,10,'Preference','Which work environment suits you best?','Fast-paced and dynamic','Structured and predictable','Flexible and varied','Calm and steady',2,2,2,1,NULL,1,'interest','Active',NULL),(40,10,'Preference','How do you feel about working with numbers and calculations?','Very uncomfortable','Somewhat uncomfortable','Comfortable','Very comfortable',0,1,2,3,NULL,1,'interest','Active',NULL),(41,10,'Preference','Do you prefer physical work or mental work?','Strongly prefer physical','Prefer physical','Prefer mental','Strongly prefer mental',1,1,2,2,NULL,1,'interest','Active',NULL),(42,11,'Rating','I stay calm and composed even in stressful situations.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(43,11,'Rating','I am aware of my emotions and understand why I feel a certain way.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(44,11,'Rating','I can easily understand how others are feeling.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(45,11,'Rating','I handle criticism well and use it to improve myself.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(46,11,'Rating','I can effectively resolve conflicts with others.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(47,11,'Rating','I am a good listener and pay attention when others speak.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(48,11,'Rating','I stay motivated even when faced with setbacks.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(49,11,'Rating','I adapt easily to changing situations and new environments.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(50,11,'Rating','I can control my emotions and avoid impulsive reactions.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(51,11,'Rating','I am willing to learn from mistakes and continuously improve.','Strongly Disagree','Disagree','Agree','Strongly Agree',1,2,3,4,NULL,1,'eq','Active',NULL),(52,12,'Boolean','Are you comfortable using computers and basic software?','No','Somewhat','Yes','Very comfortable',0,1,2,3,NULL,1,'skills','Active',NULL),(53,12,'Boolean','Can you communicate effectively in English (speaking and writing)?','No','Basic level','Intermediate','Advanced',0,1,2,3,NULL,1,'skills','Active',NULL),(54,12,'Boolean','Do you have experience handling money or financial transactions?','No experience','Little experience','Some experience','Significant experience',0,1,2,3,NULL,1,'skills','Active',NULL),(55,12,'Boolean','Are you creative and good at designing or making things?','Not at all','Somewhat','Yes','Very creative',0,1,2,3,NULL,1,'skills','Active',NULL),(56,12,'Boolean','Do you have technical skills like repairing electronics or machinery?','No','Basic knowledge','Some skills','Advanced skills',0,1,2,3,NULL,1,'skills','Active',NULL),(57,12,'Boolean','Are you confident speaking in front of groups or presenting?','Not confident','Slightly confident','Confident','Very confident',0,1,2,3,NULL,1,'skills','Active',NULL),(58,12,'Boolean','Can you manage time effectively and meet deadlines?','Struggle with it','Sometimes','Usually','Always',0,1,2,3,NULL,1,'skills','Active',NULL),(59,12,'Boolean','Do you have teaching or training experience?','No','Informal experience','Some experience','Significant experience',0,1,2,3,NULL,1,'skills','Active',NULL),(60,12,'Boolean','Are you good at organizing and planning events or tasks?','Not good','Somewhat','Good','Excellent',0,1,2,3,NULL,1,'skills','Active',NULL),(61,12,'Boolean','Can you type quickly and accurately on a keyboard?','No','Slow','Moderate speed','Fast and accurate',0,1,2,3,NULL,1,'skills','Active',NULL);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `careers`
--

DROP TABLE IF EXISTS `careers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `careers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `career_name` varchar(255) NOT NULL,
  `skill_domain` varchar(255) DEFAULT NULL,
  `course_training` varchar(255) DEFAULT NULL,
  `description` text,
  `required_traits` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `careers`
--

LOCK TABLES `careers` WRITE;
/*!40000 ALTER TABLE `careers` DISABLE KEYS */;
INSERT INTO `careers` VALUES (4,'Banking & Financial Services','BFSI','Banking Operations, Financial Products, Customer Service','Work in banks, financial institutions handling customer accounts, loans, and financial transactions. Requires numerical skills and customer interaction.','{\"traits\":[\"aptitude\",\"personality\",\"interest\",\"skills\"],\"weights\":{\"aptitude\":30,\"personality\":25,\"interest\":25,\"skills\":20}}'),(5,'IT & Digital Skills','Information Technology','Computer fundamentals, Programming, Web Development, Digital Marketing','Technology-focused roles including software development, IT support, digital marketing, and data entry. High growth potential with tech skills.','{\"traits\":[\"aptitude\",\"skills\",\"interest\"],\"weights\":{\"aptitude\":35,\"skills\":35,\"interest\":30}}'),(6,'Customer Relationship Management','CRM & Customer Service','Communication Skills, CRM Software, Customer Handling','Customer-facing roles in call centers, help desks, and customer support. Requires excellent communication and problem-solving skills.','{\"traits\":[\"personality\",\"eq\",\"skills\",\"interest\"],\"weights\":{\"personality\":25,\"eq\":30,\"skills\":25,\"interest\":20}}'),(7,'Retail Management','Retail & Sales','Retail Operations, Sales Techniques, Inventory Management','Retail store operations, sales, inventory management, and customer service in shops, malls, and supermarkets.','{\"traits\":[\"personality\",\"interest\",\"skills\",\"eq\"],\"weights\":{\"personality\":30,\"interest\":25,\"skills\":25,\"eq\":20}}'),(8,'Warehouse & Logistics','Supply Chain & Logistics','Warehouse Operations, Inventory Control, Supply Chain Management','Warehouse operations, inventory management, packaging, and logistics coordination. Physical work with organizational skills.','{\"traits\":[\"skills\",\"personality\",\"interest\"],\"weights\":{\"skills\":35,\"personality\":35,\"interest\":30}}'),(9,'Healthcare - General Duty Assistant','Healthcare','Patient Care, Basic Medical Knowledge, Hospital Operations','Healthcare support roles assisting doctors and nurses with patient care, medical equipment handling, and hospital operations.','{\"traits\":[\"eq\",\"personality\",\"skills\",\"interest\"],\"weights\":{\"eq\":35,\"personality\":25,\"skills\":20,\"interest\":20}}'),(10,'Electrical & Technical Services','Electrical & Electronics','Electrical Wiring, Electronics Repair, Electrical Safety','Technical roles in electrical installation, maintenance, and repair. Includes electrician, electronics technician positions.','{\"traits\":[\"aptitude\",\"skills\",\"interest\"],\"weights\":{\"aptitude\":30,\"skills\":40,\"interest\":30}}'),(11,'Beauty & Wellness','Beauty & Personal Care','Cosmetology, Hair Styling, Skincare, Makeup','Beauty services including hair styling, makeup, skincare treatments, and spa services. Creative and customer-focused work.','{\"traits\":[\"skills\",\"personality\",\"interest\",\"eq\"],\"weights\":{\"skills\":30,\"personality\":25,\"interest\":25,\"eq\":20}}'),(12,'Apparel & Tailoring','Fashion & Garments','Tailoring, Garment Construction, Fashion Design Basics','Tailoring, stitching, garment alteration, and basic fashion design. Skilled craft with creative elements.','{\"traits\":[\"skills\",\"interest\",\"personality\"],\"weights\":{\"skills\":40,\"interest\":30,\"personality\":30}}'),(13,'Garment Production','Manufacturing','Sewing Machine Operation, Quality Control, Production Management','Factory-based garment production, sewing machine operation, quality checking, and production line work.','{\"traits\":[\"skills\",\"personality\",\"interest\"],\"weights\":{\"skills\":40,\"personality\":30,\"interest\":30}}'),(14,'Facility Management','Facility & Maintenance','Building Maintenance, Facility Operations, Safety Management','Facility maintenance, housekeeping supervision, security, and building operations management.','{\"traits\":[\"personality\",\"skills\",\"interest\"],\"weights\":{\"personality\":35,\"skills\":35,\"interest\":30}}');
/*!40000 ALTER TABLE `careers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-12 10:10:05
