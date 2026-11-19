/**
 * reseedNotices.js
 * Deletes old seeded notices and re-inserts with plain text (no markdown).
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Notice = require("./models/Notice");

dotenv.config();

function buildNotices(facultyMap) {
  const priya = facultyMap["priya@campus.edu"];
  const thamarai = facultyMap["thamarai@campus.edu"];
  const kavitha = facultyMap["kavitha@campus.edu"];

  const now = new Date();
  const days = (n) => new Date(now.getTime() + n * 86400000);
  const ago = (n) => new Date(now.getTime() - n * 86400000);

  return [
    {
      title: "Internal Hackathon 2026 — Registration Open!",
      content: `Campus Hackathon 2026 is here!\n\nTeam up (2-4 members) and build something amazing in 24 hours.\n\nThemes:\n- AI/ML for Social Good\n- Sustainable Tech\n- Healthcare Innovation\n- EdTech Solutions\n\nPrizes:\n- 1st Place: Rs.25,000 + Internship Opportunity\n- 2nd Place: Rs.15,000\n- 3rd Place: Rs.10,000\n\nDate: November 15-16, 2026\nVenue: CS Lab Block - 3rd Floor\n\nRegister your team at the CS Department Office or DM me.\n\nLast date to register: November 10, 2026`,
      department: "Computer Science",
      category: "Event",
      subType: "Hackathon",
      priority: "high",
      expiryDate: days(15),
      createdBy: priya,
      createdAt: ago(1),
      views: 142,
    },
    {
      title: "Machine Learning Lab - Mid Semester Exam Schedule",
      content: `Dear Students,\n\nThe ML Lab Mid Semester Practical Exam is scheduled as follows:\n\nBatch A - Nov 12, 2026 - 9:00 AM to 12:00 PM - AI Lab\nBatch B - Nov 12, 2026 - 2:00 PM to 5:00 PM - AI Lab\nBatch C - Nov 13, 2026 - 9:00 AM to 12:00 PM - AI Lab\n\nSyllabus: Experiments 1-6 (Linear Regression to SVM)\n\nImportant:\n- Bring your lab record (completed and signed)\n- College ID card is mandatory\n- No electronic devices except the lab computer\n\nAll the best!`,
      department: "Computer Science",
      category: "Exam",
      subType: "Lab Exam",
      priority: "high",
      expiryDate: days(10),
      createdBy: priya,
      createdAt: ago(2),
      views: 238,
    },
    {
      title: "Guest Lecture: Introduction to Large Language Models",
      content: `We are excited to announce a Guest Lecture by Dr. Arun Kumar, Senior Research Scientist at Google DeepMind.\n\nTopic: From Transformers to GPT — Understanding Large Language Models\n\nKey Takeaways:\n- How attention mechanisms work\n- Training pipeline of LLMs\n- Fine-tuning vs Prompt Engineering\n- Career opportunities in AI Research\n\nDate: November 8, 2026 (Friday)\nTime: 2:00 PM - 4:00 PM\nVenue: Seminar Hall - Block A\n\nOpen to all departments. Attendance will be given for CS students.\n\nRefreshments will be provided!`,
      department: "General",
      category: "Event",
      subType: "Guest Lecture",
      priority: "medium",
      expiryDate: days(5),
      createdBy: priya,
      createdAt: ago(3),
      views: 310,
    },
    {
      title: "Python Programming Workshop — Beginners Welcome!",
      content: `3-Day Python Bootcamp organized by the CS Department.\n\nWhat you will learn:\n- Day 1: Python Basics, Data Types, Control Flow\n- Day 2: OOP, File Handling, Libraries (NumPy, Pandas)\n- Day 3: Mini Project — Build a Student Management System\n\nWho can attend? Any student from any department!\n\nDates: Nov 18-20, 2026\nTime: 3:00 PM - 5:00 PM\nVenue: Computer Lab 2\nFee: FREE\n\nLimited to 60 seats — First come, first served!\n\nRegister at the CS Department Notice Board or contact any CS faculty.`,
      department: "Computer Science",
      category: "Workshop",
      priority: "medium",
      expiryDate: days(18),
      createdBy: priya,
      createdAt: ago(0),
      views: 87,
    },
    {
      title: "Congratulations — Smart India Hackathon Winners!",
      content: `Proud moment for our college!\n\nTeam CodeCrusaders from the CS Department has won the Smart India Hackathon 2026 (Software Edition)!\n\nTeam Members:\n- Arun Kumar (4th Year)\n- Deepika S (3rd Year)\n- Mohammed Farhan (3rd Year)\n- Sneha Reddy (4th Year)\n- Vikram Raj (3rd Year)\n- Anjali Menon (3rd Year)\n\nProblem Statement: AI-powered Early Warning System for Natural Disasters\nPrize: Rs.1,00,000 + Certificate from AICTE\n\nThe team will be felicitated in the upcoming college day celebration.\n\nCongratulations to the team and their mentor Dr. Priya Sharma!`,
      department: "General",
      category: "Achievement",
      priority: "medium",
      expiryDate: days(30),
      createdBy: priya,
      createdAt: ago(5),
      views: 456,
    },
    {
      title: "ECE Department — Semester Exam Timetable Released",
      content: `Dear ECE Students,\n\nThe End Semester Examination timetable for all years has been released.\n\nKey Dates:\n- 3rd Year: November 25 - December 5, 2026\n- 2nd Year: November 26 - December 6, 2026\n- 4th Year: November 24 - December 3, 2026\n\nInstructions:\n1. Download the detailed timetable from the ECE department portal\n2. Report 30 minutes before exam time\n3. Hall tickets are mandatory — collect from your class advisor\n4. No mobile phones allowed inside exam hall\n\nRevaluation for previous semester: Apply before November 10\n\nStudy hard and do your best!`,
      department: "Electronics & Communication",
      category: "Exam",
      subType: "Semester Exam",
      priority: "high",
      expiryDate: days(35),
      createdBy: thamarai,
      createdAt: ago(1),
      views: 389,
    },
    {
      title: "VLSI Design Workshop — Industry Collaboration with Texas Instruments",
      content: `The ECE Department in collaboration with Texas Instruments presents an Advanced VLSI Design Workshop.\n\nTopics Covered:\n- Digital IC Design Flow\n- FPGA Programming with Xilinx Vivado\n- Low Power Design Techniques\n- Industry Best Practices\n\nHands-on Sessions:\n- Design a 4-bit ALU on FPGA\n- Power analysis using Cadence tools\n\nDates: Nov 20-22, 2026\nTime: 9:30 AM - 4:30 PM\nVenue: VLSI Lab, ECE Block\nRegistration Fee: Rs.500 (includes lunch and certificate)\n\nEligibility: 3rd and 4th Year ECE students\nLimited seats: 40 only\n\nRegister at the ECE department office before Nov 15.`,
      department: "Electronics & Communication",
      category: "Workshop",
      priority: "medium",
      expiryDate: days(20),
      createdBy: thamarai,
      createdAt: ago(2),
      views: 178,
    },
    {
      title: "ECE Lab Equipment — Maintenance Schedule",
      content: `Notice to all ECE students and lab staff:\n\nThe following labs will be closed for maintenance next week:\n\nDigital Electronics Lab - Nov 10 (Mon) - Full Day\nMicroprocessor Lab - Nov 11 (Tue) - Morning Session\nCommunication Lab - Nov 12 (Wed) - Full Day\n\nReason: Annual calibration of oscilloscopes, function generators, and spectrum analyzers.\n\nAlternate arrangements:\n- Digital Electronics practicals shifted to VLSI Lab\n- Microprocessor practicals rescheduled to Thursday\n\nPlease check with your respective lab coordinators for the updated schedule.\n\nSorry for the inconvenience.`,
      department: "Electronics & Communication",
      category: "General",
      priority: "low",
      expiryDate: days(7),
      createdBy: thamarai,
      createdAt: ago(4),
      views: 95,
    },
    {
      title: "Campus Placement Drive — Qualcomm (ECE and CS Students)",
      content: `Qualcomm is visiting our campus for recruitment!\n\nEligible Branches: ECE, CS, IT\nBatch: 2027 Pass-out\n\nRoles Offered:\n- Hardware Design Engineer\n- Embedded Software Engineer\n- ASIC Verification Engineer\n\nPackage: 12-18 LPA (based on role)\n\nSelection Process:\n1. Online Test (Aptitude + Technical) — Nov 14\n2. Technical Interview (2 rounds) — Nov 15\n3. HR Interview — Nov 15\n\nEligibility Criteria:\n- CGPA >= 7.0\n- No active backlogs\n- Good knowledge of Digital Electronics / C/C++\n\nRegister on the Placement Portal before November 12.\n\nAll the best to the appearing students!`,
      department: "General",
      category: "Placement",
      subType: "Campus Drive",
      priority: "high",
      expiryDate: days(12),
      createdBy: thamarai,
      createdAt: ago(0),
      views: 512,
    },
    {
      title: "IoT Project Expo — Submit Your Innovations!",
      content: `The annual IoT Project Expo is back!\n\nShowcase your innovative IoT projects to industry experts and win exciting prizes.\n\nCategories:\n- Smart Home Automation\n- Agriculture and Environment\n- Healthcare Monitoring\n- Smart Transportation\n- Industrial IoT\n\nPrizes per category:\n- Best Project: Rs.10,000 + Certificate\n- Runner Up: Rs.5,000 + Certificate\n- Special Innovation Award: Rs.7,500\n\nSubmission Deadline: November 18, 2026\nExpo Date: November 22, 2026\nVenue: College Auditorium\n\nHow to participate:\n1. Form a team (2-3 members)\n2. Submit abstract (max 500 words) to thamarai@campus.edu\n3. Get approval and set up your demo\n\nOpen to all departments! Let's innovate!`,
      department: "Electronics & Communication",
      category: "Event",
      subType: "Project Expo",
      priority: "medium",
      expiryDate: days(22),
      createdBy: thamarai,
      createdAt: ago(3),
      views: 234,
    },
    {
      title: "Cybersecurity Awareness Week — Nov 11-15",
      content: `The IT Department announces Cybersecurity Awareness Week!\n\nDaily Events:\n- Mon: Seminar on Phishing and Social Engineering\n- Tue: Workshop on Ethical Hacking Basics\n- Wed: CTF (Capture The Flag) Competition\n- Thu: Panel Discussion — Careers in Cybersecurity\n- Fri: Cyber Quiz + Prize Distribution\n\nSpecial Attraction:\nLive demonstration of common cyber attacks and how to prevent them.\n\nVenue: IT Seminar Hall\nTime: 2:00 PM - 5:00 PM daily\n\nAll students and faculty are welcome!\nRegister at the IT Department to participate in CTF.\n\nCertificates for all participants!`,
      department: "Information Technology",
      category: "Event",
      priority: "medium",
      expiryDate: days(15),
      createdBy: kavitha,
      createdAt: ago(1),
      views: 198,
    },
    {
      title: "IT Department — Internal Assessment Marks Published",
      content: `Dear IT Students,\n\nThe Internal Assessment (IA-2) marks for all subjects have been uploaded to the student portal.\n\nHow to check:\n1. Login to the student portal\n2. Go to Academics then Internal Marks\n3. Select the current semester\n\nDiscrepancy deadline: If you find any errors, report to your subject faculty before November 12, 2026.\n\nAttendance Warning:\nStudents with attendance below 75% will not be eligible to sit for end semester exams. Check your attendance on the portal and meet your class advisor if needed.\n\nKeep up the good work!`,
      department: "Information Technology",
      category: "Academic",
      priority: "medium",
      expiryDate: days(10),
      createdBy: kavitha,
      createdAt: ago(2),
      views: 267,
    },
    {
      title: "Alumni Talk — From Campus to Microsoft",
      content: `We are honored to host our distinguished alumni Mr. Rajesh Kannan (Batch 2019), currently working as Senior Software Engineer at Microsoft, Seattle.\n\nTopic: My Journey — From Campus Placements to Big Tech\n\nHe will cover:\n- His experience at college and how it shaped his career\n- Technical interview preparation tips\n- Life as a software engineer at Microsoft\n- Open Q&A session\n\nDate: November 9, 2026 (Saturday)\nTime: 10:00 AM - 12:00 PM\nVenue: Main Auditorium\n\nDon't miss this opportunity to interact with someone who walked the same corridors as you!\n\nOpen to all departments and all years.`,
      department: "General",
      category: "Event",
      subType: "Alumni Talk",
      priority: "low",
      expiryDate: days(5),
      createdBy: kavitha,
      createdAt: ago(4),
      views: 345,
    },
    {
      title: "Library Extended Hours During Exam Season",
      content: `Good news for exam preparation!\n\nThe Central Library will operate with extended hours during the exam season:\n\nCurrent Timings: 8:30 AM - 5:30 PM\nExtended Timings: 7:00 AM - 9:00 PM\n\nDuration: November 15 - December 10, 2026\n\nAdditional Facilities:\n- Wi-Fi access in reading hall\n- Power outlets at every seat\n- Water dispenser on each floor\n- Study rooms available for group study (book at reception)\n\nRules:\n- Maintain silence in the reading areas\n- No food inside the library\n- Return borrowed books before the deadline to avoid fines\n\nMake the most of it! Study smart, not just hard.`,
      department: "General",
      category: "General",
      priority: "low",
      expiryDate: days(40),
      createdBy: kavitha,
      createdAt: ago(6),
      views: 189,
    },
    {
      title: "EMERGENCY: Water Supply Disruption — Campus Hostel",
      content: `URGENT NOTICE\n\nDue to a pipeline burst near the main water tank, water supply to the following hostels will be disrupted:\n\n- Boys Hostel Block A and B\n- Girls Hostel Block C\n\nDuration: Today (Nov 6) 2:00 PM - Tomorrow (Nov 7) 6:00 AM\n\nArrangements made:\n- Water tankers will be stationed near each hostel block\n- Drinking water dispensers are available at the mess\n- Bottled water available at the hostel office\n\nThe maintenance team is working to fix the issue at the earliest.\n\nEmergency Contact:\n- Hostel Office: 044-2345-6789\n- Maintenance: 044-2345-6790\n\nWe apologize for the inconvenience.`,
      department: "General",
      category: "General",
      priority: "emergency",
      expiryDate: days(2),
      createdBy: kavitha,
      createdAt: ago(0),
      views: 678,
    },
    {
      title: "Annual Sports Day — Registration Open",
      content: `Campus Sports Day 2026 is approaching!\n\nDate: November 28, 2026\nVenue: College Sports Ground\n\nTrack Events:\n- 100m, 200m, 400m Sprint\n- 4x100m Relay\n- 1500m Long Distance\n\nField Events:\n- Long Jump, High Jump\n- Shot Put, Discus Throw\n\nTeam Events:\n- Cricket (T10)\n- Football (5-a-side)\n- Basketball (3-on-3)\n- Volleyball\n- Badminton (Singles and Doubles)\n\nRegistration Deadline: November 20, 2026\n\nRegister at the Physical Education Department or your class representative.\n\nAll participants will receive participation certificates. Winners get trophies and medals!`,
      department: "General",
      category: "Event",
      subType: "Sports",
      priority: "low",
      expiryDate: days(25),
      createdBy: kavitha,
      createdAt: ago(2),
      views: 423,
    },
  ];
}

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!\n");

    // Find faculty
    const priya = await User.findOne({ email: "priya@campus.edu" });
    const thamarai = await User.findOne({ email: "thamarai@campus.edu" });
    const kavitha = await User.findOne({ email: "kavitha@campus.edu" });

    if (!priya || !thamarai || !kavitha) {
      console.error("Faculty users not found. Run seedNotices.js first.");
      process.exit(1);
    }

    // Delete all notices by these faculty
    const ids = [priya._id, thamarai._id, kavitha._id];
    const deleted = await Notice.deleteMany({ createdBy: { $in: ids } });
    console.log(`Deleted ${deleted.deletedCount} old notices.\n`);

    // Re-insert with clean text
    const facultyMap = {
      "priya@campus.edu": priya._id,
      "thamarai@campus.edu": thamarai._id,
      "kavitha@campus.edu": kavitha._id,
    };

    const notices = buildNotices(facultyMap);
    console.log(`Inserting ${notices.length} clean notices...\n`);

    for (const notice of notices) {
      const created = await Notice.create(notice);
      console.log(`  Done: "${created.title.substring(0, 55)}..." [${created.priority}]`);
    }

    console.log(`\nAll ${notices.length} notices re-seeded with plain text. No markdown.`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();

