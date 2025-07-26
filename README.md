# College Portal

A Node.js-based college ERP system that enables student and admin registration, login, and dashboard management.

## 🌐 Project Overview

This web application serves as a portal for a college, allowing users to:
- Register as a student or an admin
- Log in to view respective dashboards
- Admins can manage student academic data
- Students can view marks, attendance, and subjects

## 🧾 Features

- Secure authentication using bcrypt
- Session management via express-session
- Admin panel for student record entry (marks, subjects, etc.)
- Frontend includes a stylish landing page
- MongoDB integration for storing user and student data
- Uses security middleware like helmet and express-rate-limit

## 🛠 Tech Stack

**Frontend:** HTML, CSS (inlined)  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (via Mongoose)  
**Security:** Helmet, Express Rate Limit, Bcrypt  
**Session:** Express-session

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (version 14 or higher)
- MongoDB
- npm or yarn package manager

## 🚀 Installation & Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd college-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```env
MONGODB_URI=mongodb://localhost:27017/college-portal
SESSION_SECRET=your-secret-key-here
PORT=3000
```

4. Start MongoDB service on your local machine

5. Run the application:
```bash
npm start
```

6. Access the application at `http://localhost:3000`

## 📁 Project Structure

```
college-portal/
├── models/
│   ├── User.js
│   └── Student.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   └── student.js
├── public/
│   ├── css/
│   └── js/
├── views/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── admin-dashboard.html
│   └── student-dashboard.html
├── app.js
├── package.json
└── README.md
```

## 🔐 Security Features

- Password hashing with bcrypt
- Rate limiting to prevent brute force attacks
- Helmet middleware for security headers
- Session-based authentication
- Input validation and sanitization

## 👥 User Roles

### Admin
- Register and manage student accounts
- Add/update student marks and attendance
- View all student records
- Manage subjects and courses

### Student
- View personal academic records
- Check marks and grades
- View attendance records
- Access course materials

## 🔄 Future Enhancements

- Email notifications for grade updates
- Mobile-responsive design improvements
- Advanced reporting features
- Integration with external learning management systems
- Multi-language support
