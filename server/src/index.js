import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 3001;

// 0.0.0.0 = listen on IPv4 explicitly; without it, a Windows browser can't reach the API inside WSL via 127.0.0.1
app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://localhost:${port}`);
});
