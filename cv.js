const express = require('express');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');


router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  const [users] = await db.query(
    'SELECT * FROM users LIMIT ? OFFSET ?',
    [limit, offset]
  );

  for (let user of users) {
    const [exp] = await db.query(
      'SELECT * FROM experiences WHERE user_id=?',
      [user.id]
    );
    const [edu] = await db.query(
      'SELECT * FROM education WHERE user_id=?',
      [user.id]
    );

    user.experiences = exp;
    user.education = edu;
  }

  res.json({ data: users });
});


router.post('/', async (req, res) => {
  const { name, email, phone, summary, skills, experiences, education } = req.body;

  const [result] = await db.query(
    'INSERT INTO users (name,email,phone,summary,skills) VALUES (?,?,?,?,?)',
    [name, email, phone, summary, skills]
  );

  const userId = result.insertId;

  for (let exp of experiences) {
    await db.query(
      'INSERT INTO experiences (user_id,title,company,start,end) VALUES (?,?,?,?,?)',
      [userId, exp.title, exp.company, exp.start, exp.end]
    );
  }

  for (let edu of education) {
    await db.query(
      'INSERT INTO education (user_id,degree,institution,year) VALUES (?,?,?,?)',
      [userId, edu.degree, edu.institution, edu.year]
    );
  }

  res.json({ message: 'User added successfully' });
});


router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, summary, skills, experiences, education } = req.body;

  await db.query(
    'UPDATE users SET name=?,email=?,phone=?,summary=?,skills=? WHERE id=?',
    [name, email, phone, summary, skills, id]
  );

  await db.query('DELETE FROM experiences WHERE user_id=?', [id]);
  await db.query('DELETE FROM education WHERE user_id=?', [id]);

  for (let exp of experiences) {
    await db.query(
      'INSERT INTO experiences (user_id,title,company,start,end) VALUES (?,?,?,?,?)',
      [id, exp.title, exp.company, exp.start, exp.end]
    );
  }

  for (let edu of education) {
    await db.query(
      'INSERT INTO education (user_id,degree,institution,year) VALUES (?,?,?,?)',
      [id, edu.degree, edu.institution, edu.year]
    );
  }

  res.json({ message: 'User updated successfully' });
});


router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ message: 'User deleted successfully' });
});


router.get('/:id/pdf', async (req, res) => {
  const id = req.params.id;

  const [[user]] = await db.query('SELECT * FROM users WHERE id=?', [id]);
  const [experiences] = await db.query('SELECT * FROM experiences WHERE user_id=?', [id]);
  const [education] = await db.query('SELECT * FROM education WHERE user_id=?', [id]);

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(20).text(user.name);
  doc.fontSize(12).text(user.email);
  doc.text(user.phone);
  doc.moveDown();
  doc.text('Summary:');
  doc.text(user.summary);

  doc.moveDown();
  doc.text('Experience:');
  experiences.forEach(exp => {
    doc.text(`${exp.title} - ${exp.company} (${exp.start} - ${exp.end})`);
  });

  doc.moveDown();
  doc.text('Education:');
  education.forEach(edu => {
    doc.text(`${edu.degree} - ${edu.institution} (${edu.year})`);
  });

  doc.moveDown();
  doc.text('Skills:');
  doc.text(user.skills);

  doc.end();
});

module.exports = router;