const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ 
      port: 3000,
      local_host: '127.0.0.1'
    });

    console.log('Tunnel is active at:', tunnel.url);

    // Keep the process alive
    process.stdin.resume();

    tunnel.on('close', () => {
      console.log('Tunnel closed');
      process.exit();
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Error starting localtunnel:', err);
    process.exit(1);
  }
})();
