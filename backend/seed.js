const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const { calculateMatchScore } = require('./services/matchingService');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[SEED] Clearing existing data...');

    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
    ]);

    console.log('[SEED] Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hirenest.com',
      password: 'Admin@1234',
      role: 'admin',
      isApproved: true,
      isVerified: true,
      bio: 'Platform administrator for HireNest Elite.',
      location: 'San Francisco, CA',
    });

    const recruiter1 = await User.create({
      name: 'Sarah Johnson',
      email: 'recruiter@hirenest.com',
      password: 'Recruiter@1234',
      role: 'recruiter',
      isApproved: true,
      isVerified: true,
      companyName: 'TechVision Inc.',
      companySize: '201-500',
      companyWebsite: 'https://techvision.example.com',
      companyDescription: 'Leading technology company specializing in AI-driven enterprise solutions. We build products that transform how businesses operate.',
      bio: 'Senior Technical Recruiter with 8+ years of experience in hiring top tech talent.',
      location: 'San Francisco, CA',
      phone: '+1-555-0101',
    });

    const recruiter2 = await User.create({
      name: 'Michael Chen',
      email: 'michael.chen@hirenest.com',
      password: 'Recruiter@1234',
      role: 'recruiter',
      isApproved: true,
      isVerified: true,
      companyName: 'CloudScale Solutions',
      companySize: '51-200',
      companyWebsite: 'https://cloudscale.example.com',
      companyDescription: 'Cloud infrastructure company providing scalable solutions for modern applications.',
      bio: 'Hiring Manager at CloudScale. Passionate about building diverse engineering teams.',
      location: 'Seattle, WA',
      phone: '+1-555-0102',
    });

    const recruiter3 = await User.create({
      name: 'Emily Rodriguez',
      email: 'emily.r@hirenest.com',
      password: 'Recruiter@1234',
      role: 'recruiter',
      isApproved: false,
      isVerified: true,
      companyName: 'DataFlow Analytics',
      companySize: '11-50',
      companyWebsite: 'https://dataflow.example.com',
      companyDescription: 'Data analytics startup helping businesses make smarter decisions.',
      bio: 'Co-founder and Head of People at DataFlow.',
      location: 'Austin, TX',
    });

    const candidate1 = await User.create({
      name: 'Alex Thompson',
      email: 'candidate@hirenest.com',
      password: 'Candidate@1234',
      role: 'candidate',
      isVerified: true,
      skills: ['javascript', 'react', 'node.js', 'mongodb', 'typescript', 'express', 'redux', 'html', 'css', 'git'],
      experience: '3-5',
      education: 'B.S. Computer Science - Stanford University',
      bio: 'Full-stack developer passionate about building scalable web applications. Open source contributor and tech blogger.',
      location: 'San Francisco, CA',
      phone: '+1-555-0201',
    });

    const candidate2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@hirenest.com',
      password: 'Candidate@1234',
      role: 'candidate',
      isVerified: true,
      skills: ['python', 'django', 'react', 'postgresql', 'aws', 'docker', 'kubernetes', 'machine learning'],
      experience: '5-8',
      education: 'M.S. Computer Science - MIT',
      bio: 'Senior software engineer with expertise in cloud architecture and ML. Former Amazon engineer.',
      location: 'Seattle, WA',
      phone: '+1-555-0202',
    });

    const candidate3 = await User.create({
      name: 'James Wilson',
      email: 'james.w@hirenest.com',
      password: 'Candidate@1234',
      role: 'candidate',
      isVerified: true,
      skills: ['java', 'spring boot', 'microservices', 'sql', 'kafka', 'redis', 'docker'],
      experience: '8+',
      education: 'B.S. Software Engineering - Georgia Tech',
      bio: 'Backend architect specializing in distributed systems and real-time data processing.',
      location: 'New York, NY',
      phone: '+1-555-0203',
    });

    const candidate4 = await User.create({
      name: 'Lisa Park',
      email: 'lisa.park@hirenest.com',
      password: 'Candidate@1234',
      role: 'candidate',
      isVerified: true,
      skills: ['react', 'vue.js', 'tailwind css', 'figma', 'typescript', 'next.js', 'graphql'],
      experience: '3-5',
      education: 'B.A. Design & Computer Science - Carnegie Mellon',
      bio: 'Frontend developer and UI/UX enthusiast. Love crafting beautiful, accessible interfaces.',
      location: 'Los Angeles, CA',
      phone: '+1-555-0204',
    });

    console.log('[SEED] Creating jobs...');

    const jobs = await Job.create([
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced Full Stack Developer to join our engineering team. You will architect, develop, and maintain web applications using modern JavaScript frameworks. Work closely with product and design teams to deliver outstanding user experiences.\n\nResponsibilities:\n- Design and implement scalable web applications\n- Write clean, maintainable code with comprehensive tests\n- Mentor junior developers and conduct code reviews\n- Collaborate with cross-functional teams on product features\n- Participate in architectural decisions and technical planning',
        company: 'TechVision Inc.',
        location: 'San Francisco, CA',
        salary: { min: 140000, max: 190000, currency: 'USD' },
        experienceRequired: { min: 4, max: 8 },
        jobType: 'full-time',
        workMode: 'hybrid',
        skillsRequired: ['javascript', 'react', 'node.js', 'mongodb', 'typescript'],
        companySize: '201-500',
        benefits: ['Health Insurance', '401k Match', 'Remote Flexibility', 'Learning Budget', 'Stock Options'],
        postedBy: recruiter1._id,
        applicationsCount: 0,
      },
      {
        title: 'Frontend React Developer',
        description: 'Join our product team as a Frontend React Developer. You will be responsible for building responsive, performant user interfaces for our enterprise dashboard platform.\n\nRequirements:\n- Strong proficiency in React and modern JavaScript\n- Experience with state management (Redux, Context API)\n- Knowledge of CSS frameworks (Tailwind CSS preferred)\n- Understanding of RESTful APIs and async programming\n- Experience with automated testing',
        company: 'TechVision Inc.',
        location: 'San Francisco, CA',
        salary: { min: 110000, max: 150000, currency: 'USD' },
        experienceRequired: { min: 2, max: 5 },
        jobType: 'full-time',
        workMode: 'remote',
        skillsRequired: ['react', 'typescript', 'tailwind css', 'redux', 'html', 'css'],
        companySize: '201-500',
        benefits: ['Health Insurance', 'Remote Work', 'Flexible Hours', 'Conference Budget'],
        postedBy: recruiter1._id,
        applicationsCount: 0,
      },
      {
        title: 'Backend Engineer - Node.js',
        description: 'We need a strong Backend Engineer to design and build APIs and microservices for our cloud platform. You will work on high-throughput systems processing millions of requests daily.\n\nWhat you will do:\n- Build and maintain RESTful and GraphQL APIs\n- Design database schemas and optimize queries\n- Implement caching strategies and message queues\n- Write comprehensive unit and integration tests\n- Monitor and improve application performance',
        company: 'CloudScale Solutions',
        location: 'Seattle, WA',
        salary: { min: 130000, max: 170000, currency: 'USD' },
        experienceRequired: { min: 3, max: 7 },
        jobType: 'full-time',
        workMode: 'hybrid',
        skillsRequired: ['node.js', 'express', 'mongodb', 'redis', 'docker', 'aws'],
        companySize: '51-200',
        benefits: ['Health & Dental', 'Equity', 'Unlimited PTO', 'Home Office Stipend'],
        postedBy: recruiter2._id,
        applicationsCount: 0,
      },
      {
        title: 'DevOps Engineer',
        description: 'We are seeking a DevOps Engineer to streamline our CI/CD pipelines and manage cloud infrastructure. You will play a key role in ensuring our platforms are reliable, scalable, and secure.\n\nResponsibilities:\n- Manage AWS/GCP cloud infrastructure\n- Build and maintain CI/CD pipelines\n- Implement monitoring and alerting solutions\n- Container orchestration with Kubernetes\n- Infrastructure as Code with Terraform',
        company: 'CloudScale Solutions',
        location: 'Seattle, WA',
        salary: { min: 135000, max: 175000, currency: 'USD' },
        experienceRequired: { min: 3, max: 6 },
        jobType: 'full-time',
        workMode: 'remote',
        skillsRequired: ['aws', 'docker', 'kubernetes', 'terraform', 'python', 'linux'],
        companySize: '51-200',
        benefits: ['Health Insurance', 'Remote Work', 'Stock Options', 'Sabbatical'],
        postedBy: recruiter2._id,
        applicationsCount: 0,
      },
      {
        title: 'Junior Web Developer',
        description: 'Great opportunity for a recent graduate or early-career developer to join a growing team. You will learn from senior engineers while contributing to real projects.\n\nWhat we are looking for:\n- Solid understanding of HTML, CSS, JavaScript\n- Basic knowledge of React or similar framework\n- Eagerness to learn and grow\n- Good communication skills\n- Portfolio of personal or academic projects',
        company: 'TechVision Inc.',
        location: 'San Francisco, CA',
        salary: { min: 70000, max: 90000, currency: 'USD' },
        experienceRequired: { min: 0, max: 2 },
        jobType: 'full-time',
        workMode: 'onsite',
        skillsRequired: ['html', 'css', 'javascript', 'react', 'git'],
        companySize: '201-500',
        benefits: ['Health Insurance', 'Mentorship Program', 'Learning Budget', 'Free Lunch'],
        postedBy: recruiter1._id,
        applicationsCount: 0,
      },
      {
        title: 'Machine Learning Engineer',
        description: 'Build and deploy machine learning models that power our analytics platform. Work with large datasets and cutting-edge ML techniques.\n\nRequirements:\n- Strong Python programming skills\n- Experience with ML frameworks (TensorFlow, PyTorch)\n- Knowledge of data preprocessing and feature engineering\n- Experience deploying models to production\n- Strong statistical foundation',
        company: 'CloudScale Solutions',
        location: 'Seattle, WA',
        salary: { min: 150000, max: 200000, currency: 'USD' },
        experienceRequired: { min: 3, max: 8 },
        jobType: 'full-time',
        workMode: 'hybrid',
        skillsRequired: ['python', 'machine learning', 'tensorflow', 'docker', 'sql', 'aws'],
        companySize: '51-200',
        benefits: ['Health Insurance', 'Equity', 'Research Budget', 'Conference Travel', 'GPU Credits'],
        postedBy: recruiter2._id,
        applicationsCount: 0,
      },
      {
        title: 'React Native Mobile Developer',
        description: 'Build cross-platform mobile applications using React Native. Work closely with our design team to create pixel-perfect mobile experiences.\n\nWhat you will do:\n- Develop and maintain React Native applications\n- Integrate native modules when needed\n- Optimize app performance and bundle size\n- Write unit and integration tests\n- Collaborate on API design with backend team',
        company: 'TechVision Inc.',
        location: 'San Francisco, CA',
        salary: { min: 120000, max: 160000, currency: 'USD' },
        experienceRequired: { min: 2, max: 5 },
        jobType: 'full-time',
        workMode: 'hybrid',
        skillsRequired: ['react', 'react native', 'javascript', 'typescript', 'redux'],
        companySize: '201-500',
        benefits: ['Health Insurance', 'Device Budget', 'Flexible Hours', 'Team Events'],
        postedBy: recruiter1._id,
        applicationsCount: 0,
      },
      {
        title: 'UI/UX Designer & Developer',
        description: 'Unique hybrid role combining design skills with frontend development. Create beautiful designs in Figma and implement them with code.\n\nRequirements:\n- Proficiency in Figma or Sketch\n- Strong CSS/Tailwind skills\n- React development experience\n- Understanding of accessibility standards\n- Portfolio showcasing design and code work',
        company: 'TechVision Inc.',
        location: 'Los Angeles, CA',
        salary: { min: 100000, max: 140000, currency: 'USD' },
        experienceRequired: { min: 2, max: 5 },
        jobType: 'full-time',
        workMode: 'remote',
        skillsRequired: ['react', 'figma', 'tailwind css', 'html', 'css', 'javascript'],
        companySize: '201-500',
        benefits: ['Health Insurance', 'Creative Freedom', 'Design Tools Budget', 'Remote Work'],
        postedBy: recruiter1._id,
        applicationsCount: 0,
      },
      {
        title: 'Part-Time Data Analyst',
        description: 'Analyze business data and create insights for decision-making. Flexible hours, perfect for someone seeking part-time tech work.\n\nResponsibilities:\n- Query and analyze data using SQL\n- Create dashboards and reports\n- Identify trends and actionable insights\n- Present findings to stakeholders',
        company: 'CloudScale Solutions',
        location: 'Remote',
        salary: { min: 45000, max: 65000, currency: 'USD' },
        experienceRequired: { min: 1, max: 3 },
        jobType: 'part-time',
        workMode: 'remote',
        skillsRequired: ['sql', 'python', 'excel', 'data visualization'],
        companySize: '51-200',
        benefits: ['Flexible Schedule', 'Remote Work', 'Learning Budget'],
        postedBy: recruiter2._id,
        applicationsCount: 0,
      },
      {
        title: 'Software Engineering Intern',
        description: 'Summer internship program for aspiring software engineers. Work on real projects with mentorship from senior engineers.\n\nWhat you will gain:\n- Real-world development experience\n- Mentorship from seasoned engineers\n- Exposure to agile development practices\n- Opportunity for full-time conversion',
        company: 'TechVision Inc.',
        location: 'San Francisco, CA',
        salary: { min: 40000, max: 55000, currency: 'USD' },
        experienceRequired: { min: 0, max: 1 },
        jobType: 'internship',
        workMode: 'onsite',
        skillsRequired: ['javascript', 'html', 'css', 'git'],
        companySize: '201-500',
        benefits: ['Stipend', 'Housing Assistance', 'Mentorship', 'Return Offer Eligible'],
        postedBy: recruiter1._id,
        applicationsCount: 0,
      },
    ]);

    console.log(`[SEED] Created ${jobs.length} jobs`);
    console.log('[SEED] Creating sample applications...');

    const applications = [];

    const app1Score = calculateMatchScore(candidate1.skills, jobs[0].skillsRequired);
    applications.push(
      await Application.create({
        job: jobs[0]._id,
        candidate: candidate1._id,
        status: 'shortlisted',
        matchScore: app1Score,
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. With 4 years of experience in the MERN stack, I believe I can make immediate contributions to your team.',
      })
    );

    const app2Score = calculateMatchScore(candidate1.skills, jobs[1].skillsRequired);
    applications.push(
      await Application.create({
        job: jobs[1]._id,
        candidate: candidate1._id,
        status: 'applied',
        matchScore: app2Score,
        coverLetter: 'As a React specialist with strong TypeScript skills, I would love to contribute to your frontend team.',
      })
    );

    const app3Score = calculateMatchScore(candidate2.skills, jobs[2].skillsRequired);
    applications.push(
      await Application.create({
        job: jobs[2]._id,
        candidate: candidate2._id,
        status: 'interview',
        matchScore: app3Score,
        interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        coverLetter: 'With my strong background in backend development and cloud services, I am confident I can excel in this role.',
      })
    );

    const app4Score = calculateMatchScore(candidate2.skills, jobs[5].skillsRequired);
    applications.push(
      await Application.create({
        job: jobs[5]._id,
        candidate: candidate2._id,
        status: 'applied',
        matchScore: app4Score,
        coverLetter: 'Machine learning is my passion, and I have published research in NLP. I would love to bring my expertise to CloudScale.',
      })
    );

    const app5Score = calculateMatchScore(candidate3.skills, jobs[2].skillsRequired);
    applications.push(
      await Application.create({
        job: jobs[2]._id,
        candidate: candidate3._id,
        status: 'applied',
        matchScore: app5Score,
        coverLetter: 'I bring 8 years of backend engineering experience with a focus on distributed systems.',
      })
    );

    const app6Score = calculateMatchScore(candidate4.skills, jobs[1].skillsRequired);
    applications.push(
      await Application.create({
        job: jobs[1]._id,
        candidate: candidate4._id,
        status: 'shortlisted',
        matchScore: app6Score,
        coverLetter: 'Frontend development is my specialty. I love creating beautiful, performant user interfaces with React and Tailwind.',
      })
    );

    const app7Score = calculateMatchScore(candidate4.skills, jobs[7].skillsRequired);
    applications.push(
      await Application.create({
        job: jobs[7]._id,
        candidate: candidate4._id,
        status: 'applied',
        matchScore: app7Score,
        coverLetter: 'This UI/UX Designer & Developer role perfectly matches my skill set combining design and code.',
      })
    );

    for (const application of applications) {
      await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: 1 } });
    }

    console.log(`[SEED] Created ${applications.length} applications`);

    console.log('\n========================================');
    console.log('  SEED COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log('\n  Demo Credentials:');
    console.log('  ─────────────────────────────────');
    console.log('  Admin:');
    console.log('    Email: admin@hirenest.com');
    console.log('    Password: Admin@1234');
    console.log('  ─────────────────────────────────');
    console.log('  Recruiter (Approved):');
    console.log('    Email: recruiter@hirenest.com');
    console.log('    Password: Recruiter@1234');
    console.log('  ─────────────────────────────────');
    console.log('  Candidate:');
    console.log('    Email: candidate@hirenest.com');
    console.log('    Password: Candidate@1234');
    console.log('  ─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error:', error);
    process.exit(1);
  }
};

seedData();
