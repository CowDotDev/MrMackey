import Commands, { CommandsData } from '#/commands';

import { getSecret } from '#lib/secrets';

import { REST } from '@discordjs/rest';

import { Client, Intents } from 'discord.js';

import { Routes } from 'discord-api-types/v9';

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

export const login = async () => {
  const botToken = process.env.BOT_TOKEN_OVERRIDE || (await getSecret('bot-token'));
  const clientId = process.env.BOT_CLIENT_ID_OVERRIDE || (await getSecret('bot-client-id'));

  const rest = new REST({ version: '9' }).setToken(botToken);

  const registerSlashCommands = async () => {
    try {
      console.info('Started refreshing application (/) commands.');
      await rest.put(Routes.applicationCommands(clientId), { body: CommandsData });
      console.info('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error refreshing application (/) commands.');
    }
  };

  // When the client is ready, run this code (only once)
  client.once('ready', () => {
    console.info('Bot Ready!');
    registerSlashCommands();
  });

  // Run on every interaction
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = Commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const options = {
        content: 'There was an error while executing this command!',
        ephemeral: true,
      };
      !interaction.replied && !interaction.deferred
        ? await interaction.reply(options)
        : await interaction.editReply(options);
    }
  });

  // Login to Discord with your client's token
  await client.login(botToken);
};
