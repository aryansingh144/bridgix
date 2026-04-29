require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const College = require('./models/College');
const Post = require('./models/Post');
const Discussion = require('./models/Discussion');
const Message = require('./models/Message');
const Event = require('./models/Event');
const Connection = require('./models/Connection');
const Detection = require('./models/Detection');
const { hashPassword } = require('./services/auth');

const DEFAULT_PASSWORD = 'password123';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bridgix';

const avatarColors = ['#2BC0B4', '#FF8C42', '#6C63FF', '#E91E63', '#4CAF50', '#FF5722', '#2196F3', '#9C27B0'];

const generateAvatar = (name, i) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${avatarColors[i % avatarColors.length].replace('#','')}&color=fff&size=128`;
};

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    College.deleteMany({}),
    Post.deleteMany({}),
    Discussion.deleteMany({}),
    Message.deleteMany({}),
    Event.deleteMany({}),
    Connection.deleteMany({}),
    Detection.deleteMany({})
  ]);
  console.log('Cleared existing data');

  const defaultPasswordHash = await hashPassword(DEFAULT_PASSWORD);

  // Create users
  const usersData = [
    {
      name: 'Aryan Singh',
      email: 'aryan.singh@example.com',
      role: 'student',
      age: 21,
      education: 'B.Tech Computer Science',
      status: 'Active',
      yearOfStudy: '3rd Year',
      location: 'New Delhi, India',
      topSkills: ['React', 'Node.js', 'Python'],
      bio: 'Passionate computer science student with a keen interest in full-stack development and AI. Currently exploring the intersection of machine learning and web technologies.',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Git'],
      coreNeeds: ['Mentorship in AI/ML', 'Internship Opportunities', 'Career Guidance', 'Industry Connections'],
      points: 55,
      college: 'IIT Delhi',
      quote: '"The best way to predict the future is to invent it." — Alan Kay'
    },
    {
      name: 'Dhruv Baliyan',
      email: 'dhruv.baliyan@example.com',
      role: 'student',
      age: 20,
      education: 'B.Tech Information Technology',
      status: 'Active',
      yearOfStudy: '2nd Year',
      location: 'Gurugram, India',
      topSkills: ['Java', 'Spring Boot', 'MySQL'],
      bio: 'A dedicated IT student with strong fundamentals in backend development. Love solving algorithmic problems and building scalable systems.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Data Structures', 'Algorithms', 'REST APIs'],
      coreNeeds: ['Backend Development Guidance', 'Interview Preparation', 'Project Collaboration'],
      points: 72,
      college: 'IIT Delhi',
      quote: '"Code is like humor. When you have to explain it, it\'s bad." — Cory House'
    },
    {
      name: 'Suprapti Srivastava',
      email: 'suprapti.srivastava@example.com',
      role: 'student',
      age: 22,
      education: 'B.Tech Electronics & Communication',
      status: 'Active',
      yearOfStudy: '4th Year',
      location: 'Lucknow, India',
      topSkills: ['Embedded Systems', 'C++', 'IoT'],
      bio: 'Final year ECE student passionate about IoT and embedded systems. Working on smart home automation projects and exploring edge computing.',
      skills: ['C++', 'Embedded C', 'IoT', 'Arduino', 'MATLAB', 'PCB Design'],
      coreNeeds: ['Research Collaboration', 'Graduate Studies Guidance', 'Industry Internship'],
      points: 86,
      college: 'IIT Kanpur',
      quote: '"Innovation distinguishes between a leader and a follower." — Steve Jobs'
    },
    {
      name: 'Rajat Kumar',
      email: 'rajat.kumar@example.com',
      role: 'student',
      age: 21,
      education: 'B.Sc Computer Science',
      status: 'Active',
      yearOfStudy: '3rd Year',
      location: 'Jaipur, India',
      topSkills: ['Python', 'Data Science', 'Machine Learning'],
      bio: 'Data science enthusiast with a passion for uncovering insights from complex datasets. Currently working on NLP projects and contributing to open source.',
      skills: ['Python', 'TensorFlow', 'scikit-learn', 'Pandas', 'NumPy', 'SQL'],
      coreNeeds: ['Data Science Projects', 'Research Guidance', 'Portfolio Development'],
      points: 44,
      college: 'University of Rajasthan',
      quote: '"Data is the new oil." — Clive Humby'
    },
    {
      name: 'Mohit Singh',
      email: 'mohit.singh@example.com',
      role: 'alumni',
      age: 28,
      education: 'B.Tech Computer Science',
      status: 'Working',
      occupation: 'Senior Software Engineer at Google',
      location: 'Bengaluru, India',
      topSkills: ['System Design', 'Distributed Systems', 'Go'],
      techLiteracy: 'Expert',
      bio: 'Senior Software Engineer at Google with 5+ years of experience in distributed systems and large-scale infrastructure. Passionate about mentoring students and giving back to the community.',
      services: ['Technical Interviews Preparation', 'Resume Review', 'Career Counseling', 'System Design Guidance', 'Code Reviews'],
      workExperience: ['Senior Software Engineer - Google (2021-Present)', 'Software Engineer - Amazon (2019-2021)', 'Software Engineer Intern - Microsoft (2018)'],
      points: 105,
      college: 'IIT Delhi',
      quote: '"The journey of a thousand miles begins with one step."'
    },
    {
      name: 'Paresh Talwa',
      email: 'paresh.talwa@example.com',
      role: 'alumni',
      age: 26,
      education: 'B.Tech Information Technology',
      status: 'Working',
      occupation: 'Product Manager at Flipkart',
      location: 'Mumbai, India',
      topSkills: ['Product Management', 'Agile', 'User Research'],
      techLiteracy: 'Intermediate',
      bio: 'Product Manager at Flipkart leading the seller experience team. Transitioned from engineering to product management and passionate about building user-centric products.',
      services: ['PM Interview Prep', 'Career Transition Guidance', 'Product Strategy', 'Startup Advising'],
      workExperience: ['Product Manager - Flipkart (2022-Present)', 'Associate PM - Zomato (2020-2022)', 'Software Developer - TCS (2019-2020)'],
      points: 38,
      college: 'NSIT Delhi',
      quote: '"Fall seven times, stand up eight."'
    },
    {
      name: 'Ritwik Jadeja',
      email: 'ritwik.jadeja@example.com',
      role: 'alumni',
      age: 27,
      education: 'B.Tech Mechanical Engineering',
      status: 'Working',
      occupation: 'Co-Founder at TechBridge Startup',
      location: 'Pune, India',
      topSkills: ['Entrepreneurship', 'Business Development', 'Angular'],
      techLiteracy: 'Advanced',
      bio: 'Co-founder of TechBridge, a startup focused on bridging the gap between fresh graduates and the tech industry. Former software developer turned entrepreneur.',
      services: ['Startup Mentoring', 'Fundraising Guidance', 'Business Model Development', 'Technical Architecture'],
      workExperience: ['Co-Founder - TechBridge (2022-Present)', 'Software Engineer - Infosys (2020-2022)', 'Mechanical Engineer Intern - TATA Motors (2018)'],
      points: 29,
      college: 'College of Engineering Pune',
      quote: '"The secret to getting ahead is getting started."'
    },
    {
      name: 'Shivansh Sharma',
      email: 'shivansh.sharma@example.com',
      role: 'alumni',
      age: 25,
      education: 'B.Tech Computer Science',
      status: 'Working',
      occupation: 'Data Scientist at Razorpay',
      location: 'Bengaluru, India',
      topSkills: ['Machine Learning', 'Deep Learning', 'Python'],
      techLiteracy: 'Expert',
      bio: 'Data Scientist at Razorpay working on fraud detection and risk models. Research background with publications in ML conferences. Loves teaching and mentoring aspiring data scientists.',
      services: ['ML Project Guidance', 'Research Paper Writing', 'Data Science Roadmap', 'Interview Preparation'],
      workExperience: ['Data Scientist - Razorpay (2022-Present)', 'ML Engineer - Swiggy (2020-2022)', 'Research Intern - IISc (2019)'],
      points: 61,
      college: 'IIT Delhi',
      quote: '"In God we trust. All others must bring data." — W. Edwards Deming'
    },
    {
      name: 'IIT Delhi Admin',
      email: 'admin@iitd.ac.in',
      role: 'college',
      status: 'Active',
      location: 'New Delhi, India',
      bio: 'Official admin account for IIT Delhi — manages alumni events, student onboarding, and platform oversight.',
      college: 'IIT Delhi'
    }
  ];

  const users = await User.insertMany(usersData.map((u, i) => ({
    ...u,
    avatar: generateAvatar(u.name, i),
    passwordHash: defaultPasswordHash
  })));
  console.log(`Users created: ${users.length} (default password: "${DEFAULT_PASSWORD}")`);

  const [aryan, dhruv, suprapti, rajat, mohit, paresh, ritwik, shivansh, collegeAdmin] = users;

  // Create college
  const college = await College.create({
    name: 'IIT Delhi',
    email: 'admin@iitd.ac.in',
    aicteCode: 'AICTE-1-1234567890',
    // Wikimedia blocks hotlinks (HTTP 400). Use ui-avatars as a reliable
    // placeholder — same service the rest of the app uses for user avatars.
    logo: 'https://ui-avatars.com/api/?name=IIT+Delhi&background=2BC0B4&color=fff&size=200&bold=true',
    students: [aryan._id, dhruv._id, suprapti._id, rajat._id],
    alumni: [mohit._id, paresh._id, ritwik._id, shivansh._id]
  });
  console.log('College created');

  // Create events
  const eventsData = [
    {
      title: 'International Conference on Advanced Computer Science and Information Technology 8908',
      date: new Date('2026-04-15'),
      location: 'IIT Delhi Auditorium, New Delhi',
      description: 'A premier conference bringing together researchers, practitioners, and educators in computer science and information technology from around the globe.',
      highlights: [
        'Keynote by Dr. Rahul Sharma (Google Research)',
        'Paper presentations in AI, ML, and Systems',
        'Panel discussion on Future of Tech',
        'Networking sessions with industry leaders',
        'Workshop on Quantum Computing'
      ],
      speakers: ['Dr. Rahul Sharma', 'Prof. Anita Verma', 'Mr. Karan Mehta', 'Dr. Priya Nair'],
      entryFee: '₹500 (Students Free)',
      turnout: '500+ Expected',
      attendees: [aryan._id, dhruv._id, mohit._id],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
    },
    {
      title: 'Annual Alumni Meetup 2026',
      date: new Date('2026-03-28'),
      location: 'Le Meridien, New Delhi',
      description: 'Annual gathering of IIT Delhi alumni to reconnect, share experiences, and create new opportunities for current students and recent graduates.',
      highlights: [
        'Alumni achievement awards',
        'Startup showcase by alumni',
        'Student-Alumni mentoring sessions',
        'Cultural evening and gala dinner'
      ],
      speakers: ['Mohit Singh (Google)', 'Paresh Talwa (Flipkart)', 'Ritwik Jadeja (TechBridge)'],
      entryFee: 'Free for Students',
      turnout: '300+ Expected',
      attendees: [mohit._id, paresh._id, aryan._id, suprapti._id],
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
    },
    {
      title: 'Tech Seminar: Future of AI in India',
      date: new Date('2026-04-05'),
      location: 'Online (Zoom)',
      description: 'An insightful seminar exploring the trajectory of Artificial Intelligence in India, covering applications in healthcare, finance, and governance.',
      highlights: [
        'Live demonstrations of AI tools',
        'Q&A with AI researchers',
        'Career opportunities in AI/ML',
        'Free certification for attendees'
      ],
      speakers: ['Shivansh Sharma (Razorpay)', 'Dr. Meera Krishnamurthy', 'Aditya Patel'],
      entryFee: 'Free',
      turnout: '1000+ Expected',
      attendees: [aryan._id, dhruv._id, rajat._id, shivansh._id, suprapti._id],
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'
    }
  ];

  const events = await Event.insertMany(eventsData);
  console.log('Events created:', events.length);

  // Update college with events
  await College.findByIdAndUpdate(college._id, { events: events.map(e => e._id) });

  // Create posts
  const postsData = [
    {
      author: mohit._id,
      content: "Excited to share that I've just completed my 5th year at Google! 🎉 The journey has been incredible — from a fresh IIT grad to leading a distributed systems team. To all students: keep learning, stay curious, and don't be afraid to fail. The best is yet to come! #GoogleLife #TechJourney #AlumniStory",
      image: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=600',
      likes: [aryan._id, dhruv._id, suprapti._id, rajat._id],
    },
    {
      author: aryan._id,
      content: "Just finished building my first full-stack project using React and Node.js! It's a task management app with real-time features using Socket.io. Would love some feedback from alumni who've worked on similar projects. Check it out on my GitHub! #WebDev #React #NodeJS #StudentProject",
      image: '',
      likes: [mohit._id, shivansh._id],
    },
    {
      author: shivansh._id,
      content: "Resources for aspiring Data Scientists 📊\n\n1. Start with Python basics — don't skip this\n2. Learn statistics properly — it's the foundation\n3. Practice on Kaggle competitions\n4. Read research papers — ArXiv is your friend\n5. Build real projects with real data\n\nThe roadmap seems long but each step is worth it. Feel free to reach out for guidance! #DataScience #MachineLearning #CareerTips",
      image: '',
      likes: [aryan._id, rajat._id, dhruv._id, suprapti._id, paresh._id],
    },
    {
      author: suprapti._id,
      content: "Our IoT project won 2nd place at the National Hackathon! We built a smart irrigation system that reduces water usage by 40% using ML-based weather prediction. So proud of my team! Huge thanks to Prof. Kapoor and our senior mentors. #IoT #Hackathon #SmartAgriculture",
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
      likes: [mohit._id, ritwik._id, aryan._id, dhruv._id],
    },
    {
      author: paresh._id,
      content: "How I transitioned from Software Engineer to Product Manager 🚀\n\nA lot of people ask me how I made this switch. Here's my honest take:\n\n• Engineering background is a HUGE advantage in PM\n• Learn to empathize with users, not just systems\n• Practice product sense through case studies daily\n• Network with PMs and shadow their work\n• The transition takes 1-2 years of intentional preparation\n\nDM me if you want to chat about your PM journey! #ProductManagement #CareerChange #Flipkart",
      image: '',
      likes: [aryan._id, rajat._id, ritwik._id],
    },
    {
      author: dhruv._id,
      content: "Cracked my first internship at a product company! 🎯 After 3 months of consistent DSA practice and 20+ interviews, finally got an offer from a top fintech startup in Bengaluru. The key was: consistency over intensity. 2 problems every day, every day. #Internship #DSA #CompetitiveProgramming #CampusPlacement",
      image: '',
      likes: [aryan._id, mohit._id, suprapti._id, rajat._id, shivansh._id],
    },
    {
      author: ritwik._id,
      content: "TechBridge is hiring! We're looking for passionate freshers and recent graduates (2024-2025 batch) for the following roles:\n\n🔹 Frontend Developer (React/Next.js)\n🔹 Backend Developer (Node.js/Python)\n🔹 ML Engineer\n🔹 Business Development Executive\n\nSalary: 6-10 LPA + ESOPs\nLocation: Pune (Hybrid)\n\nDM me your resume or apply at techbridge.io/careers #Hiring #FresherJobs #Startup",
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
      likes: [aryan._id, dhruv._id, rajat._id, suprapti._id],
    },
    {
      author: rajat._id,
      content: "Completed the 30-day ML challenge! Built models for:\n• Sentiment Analysis on Twitter data\n• Stock Price Prediction\n• Image Classification with CNNs\n• Customer Churn Prediction\n\nAll code is on GitHub. Looking for feedback from experienced data scientists. Any takers? #MachineLearning #Python #DataScience #30DayChallenge",
      image: '',
      likes: [shivansh._id, mohit._id],
    },
    {
      author: mohit._id,
      content: "The questions I wish someone had asked me before joining Big Tech:\n\n1. What does your typical day look like?\n2. How is performance measured?\n3. What's the culture around work-life balance?\n4. How are promotions decided?\n5. What are the growth opportunities?\n\nAlways ask these in your final round interviews. You're interviewing them too! #BigTech #CareerAdvice #JobInterview #Google",
      image: '',
      likes: [aryan._id, dhruv._id, suprapti._id, rajat._id, paresh._id, ritwik._id],
    },
    {
      author: shivansh._id,
      content: "Published my first ML research paper! 📄 'Federated Learning for Privacy-Preserving Fraud Detection in Real-time Payment Systems' is now live on ArXiv. This work came out of my experience at Razorpay dealing with large-scale fraud detection. Grateful to my co-authors and the team! #Research #MachineLearning #FederatedLearning #Publication",
      image: 'https://images.unsplash.com/photo-1532094349884-543290c39e23?w=600',
      likes: [mohit._id, aryan._id, rajat._id],
    }
  ];

  const posts = await Post.insertMany(postsData);
  console.log('Posts created:', posts.length);

  // Create discussions
  const discussionsData = [
    {
      title: 'Best resources for cracking FAANG interviews in 2026?',
      author: aryan._id,
      category: 'Placement Assistance',
      content: 'Hey everyone! I\'m a 3rd year CSE student targeting FAANG companies for my placement next year. I\'ve heard the landscape has changed a lot. What resources (books, platforms, courses) are you all using? I\'ve started with LeetCode but not sure if that\'s enough. Any advice from seniors who\'ve been through this process recently would be amazing!',
      replies: [
        { author: mohit._id, content: 'LeetCode is essential but not enough alone. Also focus on: 1) System Design (read "Designing Data-Intensive Applications"), 2) Behavioral interviews (STAR method), 3) Company-specific patterns. I did 400+ LC problems, 50 system design problems, and lots of mock interviews before my Google interview.', createdAt: new Date(Date.now() - 2 * 3600000) },
        { author: shivansh._id, content: 'Great advice from Mohit. I\'d add: don\'t just solve problems, understand the patterns. NeetCode roadmap is excellent for this. Also, Grokking the System Design Interview is worth every rupee.', createdAt: new Date(Date.now() - 1 * 3600000) },
        { author: dhruv._id, content: 'Currently in the same boat! I\'ve been following the Blind 75 list first, then moving to NeetCode 150. Also joined a study group which helps a lot with accountability.', createdAt: new Date(Date.now() - 30 * 60000) }
      ],
      views: 245,
      tags: ['FAANG', 'interviews', 'placement', 'DSA'],
      createdAt: new Date(Date.now() - 3 * 3600000)
    },
    {
      title: 'How to approach open source contributions as a student?',
      author: dhruv._id,
      category: 'Career Guidance',
      content: 'I want to start contributing to open source projects but don\'t know where to begin. Most projects seem too complex for a 2nd year student. How did you all start? Any beginner-friendly projects you recommend? Also, does open source contribution really help in placements?',
      replies: [
        { author: ritwik._id, content: 'Start with "good first issue" labels on GitHub. Projects like freeCodeCamp, React, and VS Code have tons of beginner issues. Open source absolutely helps — it shows you can work in large codebases and collaborate with distributed teams.', createdAt: new Date(Date.now() - 5 * 3600000) },
        { author: aryan._id, content: 'I started with documentation fixes, then small bug fixes. It builds confidence! Also, Google Summer of Code is amazing for students — great stipend and a prestigious addition to your resume.', createdAt: new Date(Date.now() - 4 * 3600000) }
      ],
      views: 189,
      tags: ['open-source', 'github', 'career', 'students'],
      createdAt: new Date(Date.now() - 6 * 3600000)
    },
    {
      title: 'Machine Learning vs Deep Learning — which to focus on first?',
      author: rajat._id,
      category: 'Academic Support',
      content: 'I\'m planning to build a career in AI/ML. Should I focus on classical machine learning first (linear regression, decision trees, SVMs) or jump straight into deep learning (neural networks, transformers)? I know Python and basic statistics. Looking for a structured learning path.',
      replies: [
        { author: shivansh._id, content: 'Always start with classical ML. It builds intuition for when and why things work. Understand bias-variance tradeoff, overfitting, regularization first. Then move to deep learning. The Scikit-learn ecosystem is perfect for starting. After that, PyTorch > TensorFlow for learning.', createdAt: new Date(Date.now() - 8 * 3600000) },
        { author: mohit._id, content: 'Agreed. Andrew Ng\'s ML Specialization on Coursera is still the gold standard for starting. Follow it up with the Deep Learning Specialization. Theory + practice = unstoppable.', createdAt: new Date(Date.now() - 7 * 3600000) },
        { author: aryan._id, content: 'I followed this path and it made a huge difference. Understanding how gradient descent actually works makes deep learning so much more intuitive later!', createdAt: new Date(Date.now() - 6 * 3600000) }
      ],
      views: 312,
      tags: ['machine-learning', 'deep-learning', 'AI', 'roadmap'],
      createdAt: new Date(Date.now() - 10 * 3600000)
    },
    {
      title: 'Internship experience at startups vs big companies — pros and cons?',
      author: suprapti._id,
      category: 'Placement Assistance',
      content: 'I have offers from a Series B startup (2x stipend) and an MNC (well-known brand name). I\'m in my 3rd year. Which would be better for my career long-term? The startup role is more technical but less structured. The MNC has a structured program but less ownership. What would you choose?',
      replies: [
        { author: paresh._id, content: 'Both have value, but at early career, I\'d lean startup for the ownership and learning speed. You\'ll likely wear multiple hats, which accelerates your growth enormously. Brand name matters less if you have solid projects to show.', createdAt: new Date(Date.now() - 12 * 3600000) },
        { author: ritwik._id, content: 'I\'m biased as a startup founder, but startups teach you to be resourceful. You\'ll ship faster, make decisions earlier, and have a real impact. That said, if it\'s truly a top MNC (Google, Microsoft level), the brand does open doors.', createdAt: new Date(Date.now() - 11 * 3600000) },
        { author: mohit._id, content: 'Depends on what you want long-term. Want to start your own company? Startup. Want to go deep in a technical domain? Big company might give you better resources and mentorship infrastructure.', createdAt: new Date(Date.now() - 10 * 3600000) }
      ],
      views: 178,
      tags: ['internship', 'startup', 'MNC', 'career'],
      createdAt: new Date(Date.now() - 14 * 3600000)
    },
    {
      title: 'Tips for building a standout LinkedIn profile as a student?',
      author: aryan._id,
      category: 'Career Guidance',
      content: 'Recruiters often check LinkedIn before even looking at resumes. What are the key elements that make a student LinkedIn profile stand out? Should I worry about this in 2nd-3rd year or only in final year?',
      replies: [
        { author: paresh._id, content: 'Start NOW, not final year. Key elements: 1) Professional headshot, 2) Compelling headline (not just "Student at XYZ"), 3) About section telling your story, 4) Every project with results, 5) Skills endorsed by people, 6) Recommendations from professors/internship managers. Post content regularly about your learning journey.', createdAt: new Date(Date.now() - 20 * 3600000) },
        { author: mohit._id, content: 'I\'d add: connect with people in companies you want to join. LinkedIn is about networking, not just a digital resume. Engage with their posts genuinely. Recruiters DO look at who you\'re connected with.', createdAt: new Date(Date.now() - 18 * 3600000) }
      ],
      views: 203,
      tags: ['linkedin', 'networking', 'career', 'profile'],
      createdAt: new Date(Date.now() - 22 * 3600000)
    },
    {
      title: 'Understanding System Design — where to start as a junior?',
      author: dhruv._id,
      category: 'Academic Support',
      content: 'System design interviews seem overwhelming. I\'m in 2nd year and see juniors failing these rounds. Should I start learning system design now or focus only on DSA? What foundational concepts should I understand first?',
      replies: [
        { author: mohit._id, content: 'In 2nd year, focus 80% on DSA and 20% on understanding how websites work at a high level (HTTP, databases, caching basics). Start proper system design prep in 3rd year. Read "The Pragmatic Programmer" and work on real projects — that\'s the best system design prep.', createdAt: new Date(Date.now() - 25 * 3600000) },
        { author: shivansh._id, content: 'Build things! A simple web app teaches you more system design than reading books. Understand what happens when you hit "send" on WhatsApp. Trace the full data flow. That curiosity is what system design prep is really about.', createdAt: new Date(Date.now() - 24 * 3600000) },
        { author: ritwik._id, content: 'Second everything above. Also, the "System Design Interview" book by Alex Xu is excellent once you\'re ready for structured prep. But building real projects first is key.', createdAt: new Date(Date.now() - 23 * 3600000) }
      ],
      views: 267,
      tags: ['system-design', 'architecture', 'DSA', 'interviews'],
      createdAt: new Date(Date.now() - 28 * 3600000)
    }
  ];

  const discussions = await Discussion.insertMany(discussionsData);
  console.log('Discussions created:', discussions.length);

  // Create messages
  const messagesData = [
    { sender: aryan._id, receiver: mohit._id, content: 'Hi Mohit! I\'m Aryan, a 3rd year CSE student at IIT Delhi. I\'ve seen your posts and would love some guidance on preparing for Google interviews. Would you be open to a 30-min chat?', read: true, createdAt: new Date(Date.now() - 2 * 24 * 3600000) },
    { sender: mohit._id, receiver: aryan._id, content: 'Hey Aryan! Happy to help. I remember being in your position. Let\'s schedule a call this weekend. What time works for you?', read: true, createdAt: new Date(Date.now() - 2 * 24 * 3600000 + 3600000) },
    { sender: aryan._id, receiver: mohit._id, content: 'That would be amazing! Saturday at 4 PM IST works perfectly for me. Should I prepare any specific questions?', read: true, createdAt: new Date(Date.now() - 1 * 24 * 3600000) },
    { sender: mohit._id, receiver: aryan._id, content: 'Perfect. Yes, come with your current prep status — which topics you\'ve covered, problems you\'re stuck on, and your target timeline. See you Saturday!', read: false, createdAt: new Date(Date.now() - 23 * 3600000) },
    { sender: dhruv._id, receiver: shivansh._id, content: 'Hi Shivansh! I\'m working on a fraud detection project for my final year and saw your research paper. It\'s incredibly relevant to what I\'m building. Could you share some insights on the model architecture?', read: true, createdAt: new Date(Date.now() - 3 * 24 * 3600000) },
    { sender: shivansh._id, receiver: dhruv._id, content: 'Hi Dhruv! Great to hear you\'re working in this space. The key insight is using ensemble methods with temporal features. I\'d recommend starting with XGBoost before moving to neural approaches. What\'s your current dataset like?', read: true, createdAt: new Date(Date.now() - 3 * 24 * 3600000 + 2 * 3600000) },
    { sender: dhruv._id, receiver: shivansh._id, content: 'We have synthetic transaction data with about 500K records, 2% fraud rate. Already handling class imbalance with SMOTE. Would love to discuss the temporal feature engineering aspect.', read: true, createdAt: new Date(Date.now() - 2 * 24 * 3600000) },
    { sender: shivansh._id, receiver: dhruv._id, content: 'That\'s a great dataset size. For temporal features: rolling aggregates (last 1hr, 24hr, 7day), velocity features, and device fingerprinting patterns are gold. Let\'s do a Zoom call sometime this week?', read: false, createdAt: new Date(Date.now() - 20 * 3600000) },
    { sender: suprapti._id, receiver: paresh._id, content: 'Hello Paresh! I\'ve been considering a transition to product management after my graduation. As someone who made the switch from engineering, what\'s your honest advice?', read: true, createdAt: new Date(Date.now() - 4 * 24 * 3600000) },
    { sender: paresh._id, receiver: suprapti._id, content: 'Hi Suprapti! It\'s a great path but requires genuine preparation. The transition is easier from a technical background. Start with: 1) PM case study practice, 2) Understanding product metrics, 3) Build your own product (even a simple app). What domain interests you?', read: true, createdAt: new Date(Date.now() - 4 * 24 * 3600000 + 3 * 3600000) },
    { sender: suprapti._id, receiver: paresh._id, content: 'I\'m really interested in EdTech and IoT products. My ECE background feels like an advantage there. Should I do a PM certification course?', read: true, createdAt: new Date(Date.now() - 3 * 24 * 3600000) },
    { sender: paresh._id, receiver: suprapti._id, content: 'Certifications are nice but not necessary. Practical experience matters more. Try to get a PM internship, even at a small startup. Also, Product School and Exponent have free resources that are excellent.', read: false, createdAt: new Date(Date.now() - 2 * 24 * 3600000 + 3600000) },
    { sender: rajat._id, receiver: ritwik._id, content: 'Hi Ritwik! I saw your hiring post and I\'m very interested in the ML Engineer role at TechBridge. I\'ve been working on NLP and computer vision projects for the past year. Could I send you my portfolio?', read: true, createdAt: new Date(Date.now() - 5 * 24 * 3600000) },
    { sender: ritwik._id, receiver: rajat._id, content: 'Hey Rajat! Absolutely, please send it over. We\'re looking for someone who can work on our recommendation systems. What\'s your experience with collaborative filtering and embedding models?', read: true, createdAt: new Date(Date.now() - 5 * 24 * 3600000 + 4 * 3600000) },
    { sender: rajat._id, receiver: ritwik._id, content: 'I\'ve built a movie recommendation system using matrix factorization and a content-based system using sentence transformers. Currently exploring Graph Neural Networks for recommendations. Here\'s my GitHub: github.com/rajatkumar-ml', read: true, createdAt: new Date(Date.now() - 4 * 24 * 3600000) },
    { sender: ritwik._id, receiver: rajat._id, content: 'Impressive! GNNs are exactly where we\'re headed. Let\'s schedule a technical interview. Our CTO would love to talk to you. Are you available next week?', read: false, createdAt: new Date(Date.now() - 3 * 24 * 3600000 + 2 * 3600000) },
    { sender: aryan._id, receiver: shivansh._id, content: 'Hi Shivansh! Your post about the ML roadmap was incredibly helpful. I\'m planning to focus on data science after my BTech. Is it possible to get into ML research roles at companies like Razorpay without an MTech?', read: true, createdAt: new Date(Date.now() - 6 * 24 * 3600000) },
    { sender: shivansh._id, receiver: aryan._id, content: 'Hi Aryan! Absolutely possible without MTech. What matters: strong portfolio of real ML projects, contribution to research (even just reading and implementing papers), and the ability to explain your work clearly. Start a blog, put your projects on GitHub with good READMEs. Companies care about what you can do, not your degree.', read: true, createdAt: new Date(Date.now() - 6 * 24 * 3600000 + 5 * 3600000) },
    { sender: dhruv._id, receiver: mohit._id, content: 'Hi Mohit! I\'m Dhruv, a 2nd year student preparing for placements. Your LinkedIn post about FAANG prep resonated with me. Would you be willing to do a mock interview session? I\'ve been solving LeetCode but I\'m not sure if my communication during problem-solving is up to the mark.', read: true, createdAt: new Date(Date.now() - 7 * 24 * 3600000) },
    { sender: mohit._id, receiver: dhruv._id, content: 'Hey Dhruv! Communication is often what separates candidates at the same technical level. I\'d be happy to do a mock interview. Weekends usually work for me. Drop me a Google Meet link when you\'re ready!', read: false, createdAt: new Date(Date.now() - 7 * 24 * 3600000 + 6 * 3600000) }
  ];

  await Message.insertMany(messagesData);
  console.log('Messages created:', messagesData.length);

  // Create connections
  const connectionsData = [
    { requester: aryan._id, recipient: mohit._id, status: 'accepted' },
    { requester: aryan._id, recipient: shivansh._id, status: 'accepted' },
    { requester: dhruv._id, recipient: mohit._id, status: 'pending' },
    { requester: dhruv._id, recipient: shivansh._id, status: 'accepted' },
    { requester: suprapti._id, recipient: paresh._id, status: 'accepted' },
    { requester: rajat._id, recipient: ritwik._id, status: 'accepted' },
    { requester: aryan._id, recipient: dhruv._id, status: 'accepted' },
    { requester: suprapti._id, recipient: aryan._id, status: 'accepted' },
    { requester: rajat._id, recipient: suprapti._id, status: 'pending' },
    { requester: mohit._id, recipient: paresh._id, status: 'accepted' }
  ];

  await Connection.insertMany(connectionsData);
  console.log('Connections created:', connectionsData.length);

  console.log('\n✅ Database seeded successfully!');
  console.log('Users IDs for reference:');
  users.forEach(u => console.log(`  ${u.name} (${u.role}): ${u._id}`));

  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
