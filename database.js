const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./internship.db', (err) => {
    if (err) console.error('Database opening error: ', err.message);
    else console.log('Connected to SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS internships (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        mode TEXT NOT NULL,
        duration_weeks INTEGER NOT NULL,
        applications_open INTEGER NOT NULL DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        internship_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(internship_id, applicant_email),
        FOREIGN KEY (internship_id) REFERENCES internships(id)
    )`);
});

// Seed initial data if empty
db.get("SELECT COUNT(*) as count FROM internships", (err, row) => {
    if (row.count === 0) {
        const stmt = db.prepare("INSERT INTO internships (id, title, domain, mode, duration_weeks, applications_open) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run('INT-001', 'Frontend Practice Internship', 'Web Development', 'Remote', 4, 1);
        stmt.run('INT-002', 'Data Dashboard Internship', 'Data Analytics', 'Remote', 6, 1);
        stmt.run('INT-003', 'Product Design Internship', 'UI/UX', 'Hybrid', 4, 1);
        stmt.run('INT-004', 'C++ Utility Internship', 'C++ Programming', 'Remote', 5, 0);
        stmt.finalize();
    }
});

module.exports = db;