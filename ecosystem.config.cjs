module.exports = {
  apps: [
    {
      name: 'foi-sainte',
      script: 'server.js',
      cwd: '/var/www/foi-sainte',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 5500,
        TRUST_PROXY: 1,
      },
      env_file: '/var/www/foi-sainte/.env.production',
      max_memory_restart: '500M',
      error_file: '/var/log/foi-sainte-error.log',
      out_file: '/var/log/foi-sainte-out.log',
      merge_logs: true,
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
