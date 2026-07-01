module.exports = {
    apps: [
      {
        name: "production-engage-web",
        script: "npm",
        args: "run prod",
        autorestart: true,
        watch: false,
        max_memory_restart: "1G",
        env: {
          NODE_ENV: "production",
          PORT: 3001,
        },
      },
      {
        name: "beta-engage-web",
        script: "npm",
        args: "run beta",
        autorestart: true,
        watch: false,
        max_memory_restart: "1G",
        env: {
          NODE_ENV: "production",
          PORT: 3002,
        },
      },
      {
        name: "staging-engage-web",
        script: "npm",
        args: "run start",
        autorestart: true,
        watch: false,
        max_memory_restart: "1G",
        env: {
          NODE_ENV: "staging",
          PORT: 3001,
        },
      },
    ],
  };
