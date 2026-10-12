const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());

// 1. Get all internships with pagination
app.get('/api/internships', (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    db.all("SELECT * FROM internships LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        
        db.get("SELECT COUNT(*) as total FROM internships", (err, countRow) => {
            res.json({
                status: "success",
                data: rows,
                pagination: {
                    total: countRow.total,
                    page,
                    limit
                }
            });
        });
    });
});

// 2. Submit an application with validation
app.post('/api/applications', (req, res) => {
    const { internship_id, applicant_name, applicant_email } = req.body;

    if (!applicant_name || !applicant_email || !internship_id) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicant_email)) {
        return res.status(400).json({ status: "error", message: "Invalid email address" });
    }

    const query = `INSERT INTO applications (internship_id, applicant_name, applicant_email) VALUES (?, ?, ?)`;
    db.run(query, [internship_id, applicant_name, applicant_email], function(err) {
        if (err) {
            return res.status(400).json({ status: "error", message: "Duplicate application or invalid internship ID" });
        }
        res.status(201).json({ status: "success", data: { id: this.lastID, internship_id, applicant_name, applicant_email } });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));