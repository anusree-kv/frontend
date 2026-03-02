const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const cvRoutes = require('./routes/cv');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/cv', cvRoutes);

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});