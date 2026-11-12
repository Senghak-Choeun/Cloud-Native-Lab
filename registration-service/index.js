const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const connectDB = require('./db');
const Student = require('./student.schema'); // Model maps to student_collection

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// Registration Endpoint
// Accessible via Gateway: POST http://<gateway-host>:4000/register/userregister
app.post('/userregister', async (req, res) => {
  const { Student_id, Student_name, student_email, student_password, student_mobile } = req.body;

  // Validate required fields matching your student schema
  if (!Student_id || !Student_name || !student_email || !student_password || !student_mobile) {
    return res.status(400).json({ 
      message: 'Please provide all required fields: Student_id, Student_name, student_email, student_password, student_mobile' 
    });
  }

  try {
    // Check if student already exists with the given email
    const existingStudent = await Student.findOne({ student_email });
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Email already registered. Duplicate accounts are not allowed.' 
      });
    }

    // Hash password before saving to DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(student_password, salt);

    // Create new Student record matching schema
    const newStudent = new Student({
      Student_id,
      Student_name,
      student_email,
      student_password: hashedPassword,
      student_mobile
    });

    await newStudent.save();

    res.status(201).json({
      message: 'Student registered successfully',
      student: {
        _id: newStudent._id,
        Student_id: newStudent.Student_id,
        Student_name: newStudent.Student_name,
        student_email: newStudent.student_email,
        student_mobile: newStudent.student_mobile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fixed Port: Set to 5001 to align with your API Gateway configuration
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Register Service running on port ${PORT}`));