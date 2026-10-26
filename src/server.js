require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');
const apiRoutes = require('./routes/api');
const { startEscrowCron } = require('./services/escrowWorker');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Cuanin Multi-Tenant Escrow Platform',
    timestamp: new Date().toISOString()
  });
});

// Subdomain & route resolution middleware
app.use((req, res, next) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  const parts = host.split('.');

  const isTunnelDomain = host.includes('trycloudflare.com') || host.includes('localtunnel.me') || host.includes('ngrok');

  // If accessed via subdomain like kopisenja.cuanin.com or kopisenja.localhost (not for tunnel domains)
  const isSubdomain = !isTunnelDomain && parts.length > (host.includes('localhost') ? 1 : 2) &&
    !['www', 'api', 'cuan', 'cuanin', 'localhost', '127'].includes(parts[0]);

  if (isSubdomain && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../public/store.html'));
  }

  if (req.path.startsWith('/toko') || req.path.startsWith('/store')) {
    return res.sendFile(path.join(__dirname, '../public/store.html'));
  }

  if (req.path.startsWith('/superadmin')) {
    return res.sendFile(path.join(__dirname, '../public/superadmin.html'));
  }

  if (req.path.startsWith('/order') || req.path.startsWith('/pesan')) {
    return res.sendFile(path.join(__dirname, '../public/order.html'));
  }

  if (!req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }

  next();
});

async function startServer() {
  try {
    await initDb();
    console.log('Database tables verified and initialized');

    // Start hourly escrow background worker
    startEscrowCron(3600000);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Cuanin platform is running live on http://127.0.0.1:${PORT}`);
    });

    if (PORT != 80) {
      try {
        const server80 = app.listen(80, '0.0.0.0', () => {
          console.log('Cuanin platform is also reachable on standard HTTP port 80 (http://127.0.0.1)');
        });
        server80.on('error', (e) => {
          console.log('Port 80 optional binding notice:', e.message);
        });
      } catch (err) {
        // port 80 is optional
      }
    }
  } catch (err) {
    console.error('Failed to start Cuanin server:', err);
    process.exit(1);
  }
}

startServer();
