export default {
  apps: [
    {
      name: "lcode-api",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "512M",
      env_production: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
