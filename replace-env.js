const fs = require('fs');
const path = './src/environments/environment.ts';

// Read the file
let content = fs.readFileSync(path, 'utf8');

// Replace the placeholder with the actual value
content = content.replace(
  /tmdbApiKey: 'TMDB_API_KEY_PLACEHOLDER'/,
  `tmdbApiKey: '${process.env.TMDB_API_KEY}'`
);

// Write back the file
fs.writeFileSync(path, content, 'utf8');