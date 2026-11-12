const schema_mongoose = require('mongoose');

const StudentSchema = schema_mongoose.Schema(
    {
        Student_id: { type: Number },
        Student_name: { type: String },
        student_mobile: { type: Number },
        student_email: { type: String },
        student_password: { type: String }
    },
    {
        timestamps: true
    }
);

module.exports = schema_mongoose.model('student_collection', StudentSchema);