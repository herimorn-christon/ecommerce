import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/azampay-api': {
        target: 'https://engine.tanfishmarket.com',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/azampay-api/, '/v1');
          console.log(`Proxying ${path} -> ${newPath}`);
          return newPath;
        },
        configure: (proxy, options) => {
          // Log request body
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              console.log('Request Body:', bodyData);
              
              // Update content-length
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });

          // Log detailed response
          proxy.on('proxyRes', (proxyRes, req, res) => {
            let body = '';
            proxyRes.on('data', function(chunk) {
              body += chunk;
            });
            proxyRes.on('end', function() {
              console.log('Response Body:', body);
            });
          });
        },
        headers: {
          'Origin': 'https://engine.tanfishmarket.com',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        secure: false
      }
    }
  }
});
