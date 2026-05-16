const path = require('path');
const fs = require('fs');

function getAbout(req, res) {
  res.json({
    name: 'Your Name',
    email: 'your@email.com',
    my_features: {
      'Note Tags': 'Users can label notes with custom tags and filter by tag via GET /notes?tag=. Mirrors Google Keep labels for better note organization.',
      'Full-Text Search': 'PostgreSQL tsvector-based search across note titles and content via GET /search?q= for fast relevant results.',
      'Pagination': 'Both GET /notes and GET /search support page and limit query params with full metadata so clients can efficiently navigate large collections.',
    },
  });
}

function getOpenApiJson(req, res) {
  const filePath = path.join(__dirname, '..', '..', 'openapi.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  res.json(JSON.parse(data));
}

module.exports = { getAbout, getOpenApiJson };
