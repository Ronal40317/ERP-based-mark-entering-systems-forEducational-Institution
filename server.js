const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/college-erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Models
const User = require('./models/User');

const studentSchema = new mongoose.Schema({
  email: String,
  name: String,
  surname: String,
  dob: String,
  rollNumber: String,
  department: String,
  semester: String,
  attendance: Number,
  subjects: [
    {
      name: String,
      marks: Number
    }
  ]
});

const Student = mongoose.model('Student', studentSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

const viewsPath = path.join(__dirname, '../views');
app.use(express.static(viewsPath));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Routes
app.get('/', (req, res) => {
  res.sendFile('home.html', { root: viewsPath });
});
app.get('/login', (req, res) => {
  res.sendFile('Select Login Type.html', { root: viewsPath });
});

app.get('/register-choice', (req, res) => {
  res.sendFile('register-choice.html', { root: viewsPath });
});

app.get('/register/admin', (req, res) => {
  res.sendFile('register-admin.html', { root: viewsPath });
});

app.get('/register/student', (req, res) => {
  res.sendFile('register-student.html', { root: viewsPath });
});

app.get('/login/admin', (req, res) => {
  res.sendFile('login-admin.html', { root: viewsPath });
});

app.get('/login/student', (req, res) => {
  res.sendFile('login-student.html', { root: viewsPath });
});

// Register admin
app.post('/register/admin', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.send('Admin already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role: 'admin' });
  await user.save();
  res.redirect('/login/admin');
});

// Register student
app.post('/register/student', async (req, res) => {
  const { name, surname, email, dob, password, department, semester, studentId } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect('/register-student.html?error=exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      surname,
      email,
      dob,
      password: hashedPassword,
      role: 'student',
      department,
      semester,
      rollno: studentId
    });

    await newUser.save();

    const newStudent = new Student({
      email,
      name,
      surname,
      dob,
      rollNumber: studentId,
      department,
      semester,
      attendance: 0,
      subjects: [
        { name: 'Chemistry', marks: 0 },
        { name: 'Maths', marks: 0 },
        { name: 'BEE', marks: 0 },
        { name: 'UHV', marks: 0 }
      ]
    });

    await newStudent.save();

    res.redirect('/login/student');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering student');
  }
});

// Admin login
app.get('/login-admin', (req, res) => {
  res.sendFile('C:/Users/DNINS/VAC/views/login-admin.html');
});

app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: 'admin' });

  if (!admin) return res.send('Invalid admin credentials');

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.send('Invalid admin credentials');

  req.session.user = {
    username: admin.email,
    role: 'admin'
  };

  res.redirect('/admin-home');
});

// Student login
app.post('/student/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: 'student' });
    if (!user) {
      return res.redirect('/login/student?error=invalid');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.redirect('/login/student?error=invalid');
    }

    req.session.userId = user._id;
    req.session.user = {
      username: user.email,
      role: user.role
    };

    res.redirect('/dashboard-student');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
app.get('/login-student', (req, res) => {
  res.sendFile('login-student.html', { root: viewsPath });
});

// Dashboards
app.get('/admin-home', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login/admin');
  }
  res.sendFile('admin-home.html', { root: viewsPath });
});

app.get('/dashboard/admin/manage', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login/admin');
  }

  res.sendFile('admin-dashboard.html', { root: viewsPath });
});

app.get('/dashboard/admin', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login/admin');
  }
  res.sendFile('admin-dashboard.html', { root: viewsPath });
});

app.get('/dashboard-student', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.redirect('/login/student');
  }

  try {
    const student = await Student.findOne({ email: req.session.user.username });
    res.render('dashboard-student.ejs', { student });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading student dashboard');
  }
});

// Get students for admin
app.get('/api/students', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).send('Unauthorized');
  }

  const students = await Student.find();
  const result = students.map(s => ({
    rollNumber: s.rollNumber || '-',
    fullName: `${s.name || ''} ${s.surname || ''}`.trim(),
    username: s.email,
    marks: {
      chemistry: s.subjects?.find(sub => sub.name === 'Chemistry')?.marks || '',
      maths: s.subjects?.find(sub => sub.name === 'Maths')?.marks || '',
      BEE: s.subjects?.find(sub => sub.name === 'BEE')?.marks || '',
      UHV: s.subjects?.find(sub => sub.name === 'UHV')?.marks || ''
    }
  }));

  res.json(result);
});

// Admin updating student marks
app.post('/admin/update-marks', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).send('Unauthorized');
  }

  const { usernames, chemistry, maths, bee, uhv } = req.body;

  try {
    for (let i = 0; i < usernames.length; i++) {
      const user = usernames[i];
      const updatedSubjects = [
        { name: 'Chemistry', marks: Number(chemistry[i]) || 0 },
        { name: 'Maths', marks: Number(maths[i]) || 0 },
        { name: 'BEE', marks: Number(bee[i]) || 0 },
        { name: 'UHV', marks: Number(uhv[i]) || 0 },
      ];

      await Student.findOneAndUpdate(
        { email: user },
        { subjects: updatedSubjects },
        { new: true }
      );
    }

    res.redirect('/dashboard/admin');
  } catch (err) {
    console.error('Error updating marks:', err);
    res.status(500).send('Failed to update marks.');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
