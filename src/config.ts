interface Config {
  DISCORD_BOT_TOKEN: string;
  DATABASE_PATH: string;
}

const config: Config = {
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
  DATABASE_PATH: process.env.DATABASE_PATH || './data/bot.db'
};

export default config;