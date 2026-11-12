const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const Student = require('./student.schema'); // Updated schema file reference

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// Delete Student Endpoint
// Accessible via Gateway: DELETE http://<gateway-host>:4000/student/deletestudent/:Student_id
app.delete('/deletestudent/:Student_id', async (req, res) => {
  const { Student_id } = req.params;

  // Validate Student_id parameter
  if (!Student_id) {
    return res.status(400).json({ 
      message: 'Please provide the Student_id in the URL parameters.' 
    });
  }

  try {
    // Find and delete the student record by Student_id
    const deletedStudent = await Student.findOneAndDelete({ Student_id: Number(Student_id) });

    if (!deletedStudent) {
      return res.status(404).json({ 
        message: `Student with ID ${Student_id} not found.` 
      });
    }

    res.status(200).json({
      message: 'Student deleted successfully',
      student: {
        _id: deletedStudent._id,
        Student_id: deletedStudent.Student_id,
        Student_name: deletedStudent.Student_name,
        student_email: deletedStudent.student_email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fixed Port: Set to 5001 to align with your API Gateway configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Delete Student Service running on port ${PORT}`));