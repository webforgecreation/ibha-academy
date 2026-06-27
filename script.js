const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ibha_academy_ultra_secure_secret_key_2025';
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log("Connected to MongoDB");
            seedDefaultCourses();
        })
        .catch(err => console.error("Database connection error:", err));
}

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Student', 'Instructor'] },
    registrationTimestamp: { type: Date, default: Date.now }
});

const CourseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    lessons: [{ type: String }]
});

const EnrollmentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    completedLessons: [{ type: String }],
    status: { type: String, required: true, default: 'Active', enum: ['Active', 'Refund Pending', 'Refund Approved', 'Refund Denied'] },
    paymentMethod: { type: String, required: true },
    enrollmentDate: { type: Date, default: Date.now },
    refundReason: { type: String },
    refundRequestedDate: { type: Date },
    refundDecisionDate: { type: Date }
});

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);
const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

async function seedDefaultCourses() {
    const defaultCourses = [
        {
            id: "c_soft_1",
            title: "Java Full Stack with Gen AI",
            category: "Software Training",
            price: 70000,
            duration: "3 to 5 Months",
            description: "Master Java development and prompt engineering.",
            instructorId: "inst_java",
            instructorName: "Senior Architect",
            lessons: ["OOP Systems", "Spring Boot Architecture", "Gen AI Integration", "Cloud Deployment"]
        },
        {
            id: "c_soft_2",
            title: "Data Science & AI / ML",
            category: "Software Training",
            price: 85000,
            duration: "4 to 6 Months",
            description: "Deep dive into statistical computation, Python model building, and neural networks.",
            instructorId: "inst_ds",
            instructorName: "ML Research Lead",
            lessons: ["NumPy Foundations", "Regression Models", "Neural Networks", "LLM Tuning"]
        },
        {
            id: "c_soft_3",
            title: "Python Full Stack",
            category: "Software Training",
            price: 50000,
            duration: "3 to 4 Months",
            description: "Build robust web platforms utilizing Django and REST interfaces.",
            instructorId: "inst_py",
            instructorName: "Python Systems Dev",
            lessons: ["Python Basics", "Django Configurations", "PostgreSQL Design", "Front-End Integration"]
        },
        {
            id: "c_soft_4",
            title: "DevOps with AWS / Cloud",
            category: "Software Training",
            price: 45000,
            duration: "3 to 4 Months",
            description: "Engineer automated pipelines and manage Kubernetes environments.",
            instructorId: "inst_devops",
            instructorName: "Cloud Architect",
            lessons: ["Linux Operations", "Docker Containers", "Jenkins Pipelines", "Kubernetes Management"]
        },
        {
            id: "c_soft_5",
            title: "Cyber Security with AI",
            category: "Software Training",
            price: 65000,
            duration: "4 to 6 Months",
            description: "Protect systems via threat hunting and penetration testing.",
            instructorId: "inst_sec",
            instructorName: "Infosec Auditor",
            lessons: ["Network Topologies", "Vulnerability Scanning", "Incident Response", "AI Threat Defense"]
        },
        {
            id: "c_mgmt_1",
            title: "General Management / Young Leaders",
            category: "Management Training",
            price: 85000,
            duration: "3 to 5 Months",
            description: "Acquire leadership habits and strategic change methodologies.",
            instructorId: "inst_mgmt_lead",
            instructorName: "Corporate Consultant",
            lessons: ["Strategic Management", "Leadership Methods", "Change Management", "Negotiations"]
        },
        {
            id: "c_mgmt_2",
            title: "Project Management & Supply Chain",
            category: "Management Training",
            price: 99000,
            duration: "3 to 4 Months",
            description: "Align logistics, planning, and operational supply chain structures.",
            instructorId: "inst_mgmt_pm",
            instructorName: "Director of Operations",
            lessons: ["Logistics Foundations", "Inventory Protocols", "Planning Schedules", "Quality Management"]
        },
        {
            id: "c_mgmt_3",
            title: "Healthcare / Hospital Management",
            category: "Management Training",
            price: 50000,
            duration: "3 to 4 Months",
            description: "Comprehend healthcare policy codes and hospital administration.",
            instructorId: "inst_mgmt_health",
            instructorName: "Clinical Director",
            lessons: ["Healthcare Systems", "Compliance Regulations", "Hospital Finance", "Quality Metrics"]
        },
        {
            id: "c_mgmt_4",
            title: "Event Management",
            category: "Management Training",
            price: 45000,
            duration: "2 to 3 Months",
            description: "Structure operational vendor frameworks and scale live client flows.",
            instructorId: "inst_mgmt_event",
            instructorName: "Event Strategist",
            lessons: ["Event Planning", "Vendor Negotiations", "Budget Frameworks", "Crisis Resolution"]
        },
        {
            id: "c_mgmt_5",
            title: "Digital Marketing / Analytics",
            category: "Management Training",
            price: 66000,
            duration: "3 to 4 Months",
            description: "Master search engines optimization and analytics metrics.",
            instructorId: "inst_mgmt_mkt",
            instructorName: "Marketing Analyst",
            lessons: ["SEO Architectures", "Performance Campaigns", "Google Analytics", "Value Optimization"]
        }
    ];

    try {
        const count = await Course.countDocuments();
        if (count === 0) {
            await Course.insertMany(defaultCourses);
            console.log("Database seeded.");
        }
    } catch (err) {
        console.error(err);
    }
}

app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, role, agreedToTerms } = req.body;

        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ error: "Missing fields." });
        }

        if (!agreedToTerms) {
            return res.status(400).json({ error: "Terms must be accepted." });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ error: "Email registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "Registration successful." });
    } catch (err) {
        res.status(500).json({ error: "Registration failed." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Missing credentials." });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            message: "Authentication successful",
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed." });
    }
});

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({});
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: "Retrieval failed." });
    }
});

app.post('/api/courses', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Instructor') {
            return res.status(403).json({ error: "Instructors only." });
        }

        const { title, category, price, duration, description, lessons } = req.body;

        if (!title || !category || !price || !duration || !description || !lessons || !Array.isArray(lessons)) {
            return res.status(400).json({ error: "Missing fields." });
        }

        const newCourse = new Course({
            id: 'c_' + Date.now(),
            title,
            category,
            price: Number(price),
            duration: duration,
            description,
            instructorId: req.user.id,
            instructorName: req.user.fullName,
            lessons: lessons.filter(l => l.trim() !== '')
        });

        await newCourse.save();
        res.status(201).json({ message: "Course created.", course: newCourse });
    } catch (err) {
        res.status(500).json({ error: "Creation failed." });
    }
});

app.post('/api/courses/:id/enroll', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ error: "Students only." });
        }

        const courseId = req.params.id;
        const { paymentMethod, agreedToRefundPolicy } = req.body;

        if (!agreedToRefundPolicy) {
            return res.status(400).json({ error: "Terms must be accepted." });
        }

        const targetCourse = await Course.findOne({ id: courseId });
        if (!targetCourse) {
            return res.status(404).json({ error: "Course not found." });
        }

        const isAlreadyEnrolled = await Enrollment.findOne({ userId: req.user.id, courseId: courseId });
        if (isAlreadyEnrolled) {
            return res.status(400).json({ error: "Already enrolled." });
        }

        const newEnrollment = new Enrollment({
            id: 'e_' + Date.now(),
            userId: req.user.id,
            courseId: courseId,
            courseTitle: targetCourse.title,
            category: targetCourse.category,
            price: targetCourse.price,
            paymentMethod: paymentMethod || 'Simulated Payment Card'
        });

        await newEnrollment.save();
        res.status(201).json({ message: "Enrolled.", enrollment: newEnrollment });
    } catch (err) {
        res.status(500).json({ error: "Enrollment failed." });
    }
});

app.post('/api/enrollments/:id/refund-request', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ error: "Access denied." });
        }

        const enrollmentId = req.params.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ error: "Provide reason." });
        }

        const enrollment = await Enrollment.findOne({ id: enrollmentId, userId: req.user.id });
        if (!enrollment) {
            return res.status(404).json({ error: "Enrollment not found." });
        }

        const enrollmentTime = new Date(enrollment.enrollmentDate).getTime();
        const limitTime = enrollmentTime + (7 * 24 * 60 * 60 * 1000);
        const currentTime = Date.now();

        if (currentTime > limitTime) {
            return res.status(400).json({ error: "Window expired." });
        }

        if (enrollment.status === 'Refund Pending' || enrollment.status === 'Refund Approved') {
            return res.status(400).json({ error: "Already processed." });
        }

        enrollment.status = 'Refund Pending';
        enrollment.refundReason = reason;
        enrollment.refundRequestedDate = new Date();

        await enrollment.save();
        res.status(200).json({ message: "Refund requested.", enrollment });
    } catch (err) {
        res.status(500).json({ error: "Request failed." });
    }
});

app.post('/api/enrollments/:id/progress', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ error: "Access denied." });
        }

        const enrollmentId = req.params.id;
        const { lessonTitle } = req.body;

        const enrollment = await Enrollment.findOne({ id: enrollmentId, userId: req.user.id });
        if (!enrollment) {
            return res.status(404).json({ error: "Enrollment not found." });
        }

        if (enrollment.status === 'Refund Approved') {
            return res.status(400).json({ error: "Access revoked." });
        }

        const course = await Course.findOne({ id: enrollment.courseId });
        if (!course) {
            return res.status(404).json({ error: "Course not found." });
        }

        const index = enrollment.completedLessons.indexOf(lessonTitle);
        if (index > -1) {
            enrollment.completedLessons.splice(index, 1);
        } else {
            enrollment.completedLessons.push(lessonTitle);
        }

        const totalLessons = course.lessons.length;
        enrollment.progress = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 100;

        await enrollment.save();
        res.status(200).json({ message: "Progress saved.", enrollment });
    } catch (err) {
        res.status(500).json({ error: "Update failed." });
    }
});

app.get('/api/dashboard/student', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ error: "Access denied." });
        }

        const studentEnrollments = await Enrollment.find({ userId: req.user.id });

        const enrichedEnrollments = [];
        for (let enrollment of studentEnrollments) {
            const courseDetail = await Course.findOne({ id: enrollment.courseId }) || {};
            enrichedEnrollments.push({
                ...enrollment.toObject(),
                lessons: courseDetail.lessons || [],
                description: courseDetail.description || "",
                instructorName: courseDetail.instructorName || "Academy Team"
            });
        }

        res.status(200).json({ enrollments: enrichedEnrollments });
    } catch (err) {
        res.status(500).json({ error: "Dashboard failed." });
    }
});

app.get('/api/dashboard/instructor', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Instructor') {
            return res.status(403).json({ error: "Access denied." });
        }

        const instructorCourses = await Course.find({ instructorId: req.user.id });

        const coursesWithMetrics = [];
        for (let course of instructorCourses) {
            const enrollmentsForCourse = await Enrollment.find({ courseId: course.id });
            coursesWithMetrics.push({
                ...course.toObject(),
                enrollmentCount: enrollmentsForCourse.length,
                activeCount: enrollmentsForCourse.filter(e => e.status === 'Active').length,
                refundedCount: enrollmentsForCourse.filter(e => e.status === 'Refund Approved').length
            });
        }

        const courseIds = instructorCourses.map(c => c.id);
        const relativeRefundRequests = await Enrollment.find({ courseId: { $in: courseIds }, status: 'Refund Pending' });

        res.status(200).json({
            courses: coursesWithMetrics,
            refundRequests: relativeRefundRequests
        });
    } catch (err) {
        res.status(500).json({ error: "Dashboard failed." });
    }
});

app.post('/api/enrollments/:id/refund-respond', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Instructor') {
            return res.status(403).json({ error: "Access denied." });
        }

        const enrollmentId = req.params.id;
        const { action } = req.body;

        if (!action || (action !== 'Approve' && action !== 'Deny')) {
            return res.status(400).json({ error: "Invalid action." });
        }

        const enrollment = await Enrollment.findOne({ id: enrollmentId });
        if (!enrollment) {
            return res.status(404).json({ error: "Enrollment not found." });
        }

        const course = await Course.findOne({ id: enrollment.courseId });
        if (!course || course.instructorId !== req.user.id) {
            return res.status(403).json({ error: "Access denied." });
        }

        if (action === 'Approve') {
            enrollment.status = 'Refund Approved';
            enrollment.progress = 0;
        } else {
            enrollment.status = 'Refund Denied';
        }

        enrollment.refundDecisionDate = new Date();
        await enrollment.save();

        res.status(200).json({ message: "Refund evaluated.", enrollment });
    } catch (err) {
        res.status(500).json({ error: "Response failed." });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running`);
});