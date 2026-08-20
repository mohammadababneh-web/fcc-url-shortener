const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory database for testing
const urls = [];
let idCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint for shortening URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  // Basic regex check for URL format
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const urlObj = new URL(originalUrl);
    
    // DNS lookup to verify hostname
    dns.lookup(urlObj.hostname, (err, address, family) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }
      
      // Store URL
      const shortUrl = idCounter++;
      urls.push({
        original_url: originalUrl,
        short_url: shortUrl
      });
      
      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// API endpoint for redirecting
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const foundUrl = urls.find(url => url.short_url === shortUrl);
  
  if (foundUrl) {
    res.redirect(foundUrl.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
