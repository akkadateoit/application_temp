// Add this object into the `apps` array of /var/www/ecosystem.config.js
// (the shared PM2 config used across all apps on this server), then run:
//   pm2 start ecosystem.config.js --only nbu-application
//   pm2 save
{
  name: "nbu-application",
  cwd: "/var/www/app/application_temp",
  script: "node_modules/next/dist/bin/next",
  args: "start -p 3400",
  exec_mode: "fork",
  instances: 1,
  env_file: ".env",
  env: {
    NODE_ENV: "production",
    PORT: 3400
  }
}
