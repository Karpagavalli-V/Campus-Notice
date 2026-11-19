/**
 * seedNotices.js
 * ──────────────────────────────────────────────
 * Seeds realistic campus notices into MongoDB
 * using faculty accounts (Priya & Thamarai).
 *
 * Run:  node seedNotices.js
 * ──────────────────────────────────────────────
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");
const Notice = require("./models/Notice");

dotenv.config();

// ── Faculty profiles ────────────────────────────────────────────────
const facultyProfiles = [
  {
    name: "Dr. Priya Sharma",
    email: "priya@campus.edu",
    password: "faculty123",
    role: "faculty",
    department: "Computer Science",
    bio: "Associate Professor | AI & Machine Learning Researcher",
    specialization: "Artificial Intelligence",
    officeHours: "Mon-Wed, 10:00 AM - 12:00 PM",
  },
  {
    name: "Prof. Thamarai Selvi",
    email: "thamarai@campus.edu",
    password: "faculty123",
    role: "faculty",
    department: "Electronics & Communication",
    bio: "Professor & HOD | VLSI & Embedded Systems Expert",
    specialization: "VLSI Design",
    officeHours: "Tue-Thu, 2:00 PM - 4:00 PM",
  },
  {
    name: "Dr. Kavitha R",
    email: "kavitha@campus.edu",
    password: "faculty123",
    role: "faculty",
    department: "Information Technology",
    bio: "Assistant Professor | Cybersecurity Specialist",
    specialization: "Network Security",
    officeHours: "Mon-Fri, 11:00 AM - 1:00 PM",
  },
];

// ── Notices data ────────────────────────────────────────────────────
function buildNotices(facultyMap) {
  const priya = facultyMap["priya@campus.edu"];
  const thamarai = facultyMap["thamarai@campus.edu"];
  const kavitha = facultyMap["kavitha@campus.edu"];

  const now = new Date();
  const days = (n) => new Date(now.getTime() + n * 86400000);
  const ago = (n) => new Date(now.getTime() - n * 86400000);

  return [
    // ── Priya's Notices ───────────────────────────────────────────
    {
      title: "🚀 Internal Hackathon 2026 — Registration Open!",
      content: `**Campus Hackathon 2026** is here! 🎉\n\nTeam up (2-4 members) and build something amazing in 24 hours.\n\n**Themes:**\n- 🤖 AI/ML for Social Good\n- 🌱 Sustainable Tech\n- 🏥 Healthcare Innovation\n- 🎓 EdTech Solutions\n\n**Prizes:**\n- 🥇 1st Place: ₹25,000 + Internship Opportunity\n- 🥈 2nd Place: ₹15,000\n- 🥉 3rd Place: ₹10,000\n\n**Date:** November 15-16, 2026\n**Venue:** CS Lab Block - 3rd Floor\n\nRegister your team at the CS Department Office or DM me.\n\n*Last date to register: November 10, 2026*`,
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
      title: "📝 Machine Learning Lab - Mid Semester Exam Schedule",
      content: `Dear Students,\n\nThe **ML Lab Mid Semester Practical Exam** is scheduled as follows:\n\n| Batch | Date | Time | Lab |\n|-------|------|------|-----|\n| Batch A | Nov 12, 2026 | 9:00 AM - 12:00 PM | AI Lab |\n| Batch B | Nov 12, 2026 | 2:00 PM - 5:00 PM | AI Lab |\n| Batch C | Nov 13, 2026 | 9:00 AM - 12:00 PM | AI Lab |\n\n**Syllabus:** Experiments 1-6 (Linear Regression to SVM)\n\n**Important:**\n- Bring your lab record (completed & signed)\n- College ID card is mandatory\n- No electronic devices except the lab computer\n\nAll the best! 💪`,
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
      title: "📚 Guest Lecture: Introduction to Large Language Models",
      content: `We are excited to announce a **Guest Lecture** by **Dr. Arun Kumar**, Senior Research Scientist at Google DeepMind.\n\n**Topic:** *From Transformers to GPT — Understanding Large Language Models*\n\n**Key Takeaways:**\n- How attention mechanisms work\n- Training pipeline of LLMs\n- Fine-tuning vs Prompt Engineering\n- Career opportunities in AI Research\n\n📅 **Date:** November 8, 2026 (Friday)\n🕐 **Time:** 2:00 PM - 4:00 PM\n📍 **Venue:** Seminar Hall - Block A\n\nOpen to all departments. Attendance will be given for CS students.\n\n*Refreshments will be provided!* ☕`,
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
      title: "⚡ Python Programming Workshop — Beginners Welcome!",
      content: `**3-Day Python Bootcamp** organized by the CS Department 🐍\n\n**What you'll learn:**\n- Day 1: Python Basics, Data Types, Control Flow\n- Day 2: OOP, File Handling, Libraries (NumPy, Pandas)\n- Day 3: Mini Project — Build a Student Management System\n\n**Who can attend?** Any student from any department!\n\n📅 **Dates:** Nov 18-20, 2026\n🕐 **Time:** 3:00 PM - 5:00 PM\n📍 **Venue:** Computer Lab 2\n💰 **Fee:** FREE\n\n*Limited to 60 seats — First come, first served!*\n\nRegister here: CS Department Notice Board or contact any CS faculty.`,
      department: "Computer Science",
      category: "Workshop",
      priority: "medium",
      expiryDate: days(18),
      createdBy: priya,
      createdAt: ago(0),
      views: 87,
    },
    {
      title: "🏆 Congratulations — Smart India Hackathon Winners!",
      content: `Proud moment for our college! 🎊\n\nTeam **CodeCrusaders** from the CS Department has won the **Smart India Hackathon 2026** (Software Edition)!\n\n**Team Members:**\n- Arun Kumar (4th Year)\n- Deepika S (3rd Year)\n- Mohammed Farhan (3rd Year)\n- Sneha Reddy (4th Year)\n- Vikram Raj (3rd Year)\n- Anjali Menon (3rd Year)\n\n**Problem Statement:** AI-powered Early Warning System for Natural Disasters\n**Prize:** ₹1,00,000 + Certificate from AICTE\n\nThe team will be felicitated in the upcoming college day celebration.\n\nCongratulations to the team and their mentor Dr. Priya Sharma! 🙌`,
      department: "General",
      category: "Achievement",
      priority: "medium",
      expiryDate: days(30),
      createdBy: priya,
      createdAt: ago(5),
      views: 456,
    },

    // ── Thamarai's Notices ────────────────────────────────────────
    {
      title: "📢 ECE Department — Semester Exam Timetable Released",
      content: `Dear ECE Students,\n\nThe **End Semester Examination** timetable for all years has been released.\n\n**Key Dates:**\n- 3rd Year: November 25 - December 5, 2026\n- 2nd Year: November 26 - December 6, 2026\n- 4th Year: November 24 - December 3, 2026\n\n**Instructions:**\n1. Download the detailed timetable from the ECE department portal\n2. Report 30 minutes before exam time\n3. Hall tickets are mandatory — collect from your class advisor\n4. No mobile phones allowed inside exam hall\n\n**Revaluation for previous semester:** Apply before November 10\n\nStudy hard and do your best! 📖`,
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
      title: "🔬 VLSI Design Workshop — Industry Collaboration",
      content: `The ECE Department in collaboration with **Texas Instruments** presents:\n\n**Advanced VLSI Design Workshop**\n\n**Topics Covered:**\n- Digital IC Design Flow\n- FPGA Programming with Xilinx Vivado\n- Low Power Design Techniques\n- Industry Best Practices\n\n**Hands-on Sessions:**\n- Design a 4-bit ALU on FPGA\n- Power analysis using Cadence tools\n\n📅 **Dates:** Nov 20-22, 2026\n🕐 **Time:** 9:30 AM - 4:30 PM\n📍 **Venue:** VLSI Lab, ECE Block\n💰 **Registration Fee:** ₹500 (includes lunch & certificate)\n\n**Eligibility:** 3rd & 4th Year ECE students\n**Limited seats:** 40 only\n\nRegister at the ECE department office before Nov 15.`,
      department: "Electronics & Communication",
      category: "Workshop",
      priority: "medium",
      expiryDate: days(20),
      createdBy: thamarai,
      createdAt: ago(2),
      views: 178,
    },
    {
      title: "📋 ECE Lab Equipment — Maintenance Schedule",
      content: `**Notice to all ECE students and lab staff:**\n\nThe following labs will be **closed for maintenance** next week:\n\n| Lab | Date | Duration |\n|-----|------|----------|\n| Digital Electronics Lab | Nov 10 (Mon) | Full Day |\n| Microprocessor Lab | Nov 11 (Tue) | Morning Session |\n| Communication Lab | Nov 12 (Wed) | Full Day |\n\n**Reason:** Annual calibration of oscilloscopes, function generators, and spectrum analyzers.\n\n⚠️ **Alternate arrangements:**\n- Digital Electronics practicals shifted to VLSI Lab\n- Microprocessor practicals rescheduled to Thursday\n\nPlease check with your respective lab coordinators for the updated schedule.\n\nSorry for the inconvenience. 🙏`,
      department: "Electronics & Communication",
      category: "General",
      priority: "low",
      expiryDate: days(7),
      createdBy: thamarai,
      createdAt: ago(4),
      views: 95,
    },
    {
      title: "🎯 Campus Placement Drive — Qualcomm (ECE & CS Students)",
      content: `**Qualcomm** is visiting our campus for recruitment! 🏢\n\n**Eligible Branches:** ECE, CS, IT\n**Batch:** 2027 Pass-out\n\n**Roles Offered:**\n- Hardware Design Engineer\n- Embedded Software Engineer\n- ASIC Verification Engineer\n\n**Package:** ₹12-18 LPA (based on role)\n\n**Selection Process:**\n1. Online Test (Aptitude + Technical) — Nov 14\n2. Technical Interview (2 rounds) — Nov 15\n3. HR Interview — Nov 15\n\n**Eligibility Criteria:**\n- CGPA ≥ 7.0\n- No active backlogs\n- Good knowledge of Digital Electronics / C/C++\n\n📝 **Register on the Placement Portal before November 12.**\n\nAll the best to the appearing students! 🎉`,
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
      title: "🌐 IoT Project Expo — Submit Your Innovations!",
      content: `The annual **IoT Project Expo** is back! 🎪\n\nShowcase your innovative IoT projects to industry experts and win exciting prizes.\n\n**Categories:**\n- 🏠 Smart Home Automation\n- 🌾 Agriculture & Environment\n- 🏥 Healthcare Monitoring\n- 🚗 Smart Transportation\n- 🏭 Industrial IoT\n\n**Prizes per category:**\n- Best Project: ₹10,000 + Certificate\n- Runner Up: ₹5,000 + Certificate\n- Special Innovation Award: ₹7,500\n\n**Submission Deadline:** November 18, 2026\n**Expo Date:** November 22, 2026\n**Venue:** College Auditorium\n\n**How to participate:**\n1. Form a team (2-3 members)\n2. Submit abstract (max 500 words) to thamarai@campus.edu\n3. Get approval and set up your demo\n\nOpen to all departments! Let's innovate! 💡`,
      department: "Electronics & Communication",
      category: "Event",
      subType: "Project Expo",
      priority: "medium",
      expiryDate: days(22),
      createdBy: thamarai,
      createdAt: ago(3),
      views: 234,
    },

    // ── Kavitha's Notices ─────────────────────────────────────────
    {
      title: "🔒 Cybersecurity Awareness Week — Nov 11-15",
      content: `The IT Department announces **Cybersecurity Awareness Week**! 🛡️\n\n**Daily Events:**\n- **Mon:** Seminar on Phishing & Social Engineering\n- **Tue:** Workshop on Ethical Hacking Basics\n- **Wed:** CTF (Capture The Flag) Competition\n- **Thu:** Panel Discussion — Careers in Cybersecurity\n- **Fri:** Cyber Quiz + Prize Distribution\n\n**Special Attraction:**\nLive demonstration of common cyber attacks and how to prevent them.\n\n📍 **Venue:** IT Seminar Hall\n🕐 **Time:** 2:00 PM - 5:00 PM daily\n\nAll students and faculty are welcome!\nRegister at the IT Department to participate in CTF.\n\n*Certificates for all participants!* 🏅`,
      department: "Information Technology",
      category: "Event",
      priority: "medium",
      expiryDate: days(15),
      createdBy: kavitha,
      createdAt: ago(1),
      views: 198,
    },
    {
      title: "📊 IT Department — Internal Assessment Marks Published",
      content: `Dear IT Students,\n\nThe **Internal Assessment (IA-2) marks** for all subjects have been uploaded to the student portal.\n\n**How to check:**\n1. Login to the student portal\n2. Go to "Academics" → "Internal Marks"\n3. Select the current semester\n\n**Discrepancy deadline:** If you find any errors, report to your subject faculty **before November 12, 2026**.\n\n**Attendance Warning:** ⚠️\nStudents with attendance below 75% will not be eligible to sit for end semester exams. Check your attendance on the portal and meet your class advisor if needed.\n\nKeep up the good work! 📈`,
      department: "Information Technology",
      category: "Academic",
      priority: "medium",
      expiryDate: days(10),
      createdBy: kavitha,
      createdAt: ago(2),
      views: 267,
    },
    {
      title: "🎓 Alumni Talk — From Campus to Microsoft",
      content: `We are honored to host our distinguished alumni **Mr. Rajesh Kannan** (Batch 2019), currently working as **Senior Software Engineer at Microsoft, Seattle**.\n\n**Topic:** *My Journey — From Campus Placements to Big Tech*\n\n**He will cover:**\n- His experience at college and how it shaped his career\n- Technical interview preparation tips\n- Life as a software engineer at Microsoft\n- Open Q&A session\n\n📅 **Date:** November 9, 2026 (Saturday)\n🕐 **Time:** 10:00 AM - 12:00 PM\n📍 **Venue:** Main Auditorium\n\nDon't miss this opportunity to interact with someone who walked the same corridors as you! 🚀\n\nOpen to all departments & all years.`,
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
      title: "🏫 Library Extended Hours During Exam Season",
      content: `**Good news for exam preparation!** 📚\n\nThe Central Library will operate with **extended hours** during the exam season:\n\n**Current Timings:** 8:30 AM - 5:30 PM\n**Extended Timings:** 7:00 AM - 9:00 PM\n\n**Duration:** November 15 - December 10, 2026\n\n**Additional Facilities:**\n- Wi-Fi access in reading hall\n- Power outlets at every seat\n- Water dispenser on each floor\n- Study rooms available for group study (book at reception)\n\n**Rules:**\n- Maintain silence in the reading areas\n- No food inside the library\n- Return borrowed books before the deadline to avoid fines\n\nMake the most of it! Study smart, not just hard. 🧠`,
      department: "General",
      category: "General",
      priority: "low",
      expiryDate: days(40),
      createdBy: kavitha,
      createdAt: ago(6),
      views: 189,
    },
    {
      title: "⚠️ EMERGENCY: Water Supply Disruption — Campus Hostel",
      content: `**URGENT NOTICE**\n\nDue to a **pipeline burst** near the main water tank, water supply to the following hostels will be disrupted:\n\n- Boys Hostel Block A & B\n- Girls Hostel Block C\n\n**Duration:** Today (Nov 6) 2:00 PM - Tomorrow (Nov 7) 6:00 AM\n\n**Arrangements made:**\n- Water tankers will be stationed near each hostel block\n- Drinking water dispensers are available at the mess\n- Bottled water available at the hostel office\n\nThe maintenance team is working to fix the issue at the earliest.\n\n**Emergency Contact:**\n- Hostel Office: 044-2345-6789\n- Maintenance: 044-2345-6790\n\nWe apologize for the inconvenience. 🙏`,
      department: "General",
      category: "General",
      priority: "emergency",
      expiryDate: days(2),
      createdBy: kavitha,
      createdAt: ago(0),
      views: 678,
    },
    {
      title: "🏅 Annual Sports Day — Registration Open",
      content: `**Campus Sports Day 2026** is approaching! 🏃‍♂️🏃‍♀️\n\n**Date:** November 28, 2026\n**Venue:** College Sports Ground\n\n**Events:**\n\n🏃 **Track Events:**\n- 100m, 200m, 400m Sprint\n- 4x100m Relay\n- 1500m Long Distance\n\n🏅 **Field Events:**\n- Long Jump, High Jump\n- Shot Put, Discus Throw\n\n⚽ **Team Events:**\n- Cricket (T10)\n- Football (5-a-side)\n- Basketball (3-on-3)\n- Volleyball\n- Badminton (Singles & Doubles)\n\n**Registration Deadline:** November 20, 2026\n\nRegister at the Physical Education Department or your class representative.\n\n*All participants will receive participation certificates. Winners get trophies and medals!* 🏆`,
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

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!\n");

    // 1. Ensure faculty users exist
    const facultyMap = {};
    for (const profile of facultyProfiles) {
      let user = await User.findOne({ email: profile.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(profile.password, 10);
        user = await User.create({ ...profile, password: hashedPassword });
        console.log(`👩‍🏫 Created faculty: ${user.name} (${user.email})`);
      } else {
        console.log(`👩‍🏫 Found existing faculty: ${user.name} (${user.email})`);
      }
      facultyMap[profile.email] = user._id;
    }

    // 2. Build notices
    const notices = buildNotices(facultyMap);

    // 3. Insert notices
    console.log(`\n📝 Inserting ${notices.length} notices...\n`);
    for (const notice of notices) {
      const created = await Notice.create(notice);
      console.log(`  ✅ "${created.title.substring(0, 50)}..." [${created.priority}]`);
    }

    console.log(`\n🎉 Done! ${notices.length} notices seeded successfully.`);
    console.log("\n📋 Faculty Credentials:");
    console.log("   Email: priya@campus.edu    | Password: faculty123");
    console.log("   Email: thamarai@campus.edu | Password: faculty123");
    console.log("   Email: kavitha@campus.edu  | Password: faculty123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();

