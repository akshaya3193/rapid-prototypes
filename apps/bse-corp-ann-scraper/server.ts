import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import JSZip from 'jszip';
import pLimit from 'p-limit';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit if needed
  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/announcements', async (req, res) => {
    try {
      const { scripCode, fromDate, toDate, pageno } = req.query;
      
      if (!scripCode || !fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // BSE API requires dates in YYYYMMDD format
      let url = `https://api.bseindia.com/BseIndiaAPI/api/AnnGetData/w?strCat=-1&strPrevDate=${fromDate}&strScrip=${scripCode}&strSearch=P&strToDate=${toDate}&strType=C`;
      if (pageno) {
        url += `&pageno=${pageno}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': `https://www.bseindia.com/stock-share-price/super-sales-india-ltd/super/${scripCode}/corp-announcements/`,
          'Origin': 'https://www.bseindia.com'
        }
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('Error fetching announcements:', error.message);
      res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  });

  app.get('/api/pdf/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://www.bseindia.com/',
        'Accept': 'application/pdf,application/json,text/plain,*/*'
      };

      let response;
      try {
        response = await axios.get(`https://www.bseindia.com/xml-data/corpfiling/AttachLive/${filename}`, {
          responseType: 'stream',
          headers
        });
      } catch (e: any) {
        if (e.response && (e.response.status === 404 || e.response.status === 403)) {
          response = await axios.get(`https://www.bseindia.com/xml-data/corpfiling/AttachHis/${filename}`, {
            responseType: 'stream',
            headers
          });
        } else {
          throw e;
        }
      }

      res.set('Content-Type', 'application/pdf');
      response.data.pipe(res);
    } catch (error: any) {
      console.error('Error fetching PDF:', error.message);
      res.status(500).json({ error: 'Failed to fetch PDF' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
