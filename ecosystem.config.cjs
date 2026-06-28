module.exports = {
  apps: [
    {
      name: 'foi-sainte',
      script: 'server.js',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 5500,
        TRUST_PROXY: 1,
      },
      env_file: '.env.production',
      max_memory_restart: '500M',
      merge_logs: true,
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
