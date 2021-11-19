import initCommands from '#/commands';
import { getSecret } from '#lib/secrets';

import { REST } from '@discordjs/rest';

import { Client, Intents } from 'discord.js';

import { Routes } from 'discord-api-types/v9';
import CustomCommands from '#commands/custom';

let CommandsService;

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

export const login = async () => {
  const botMode = await getSecret('bot-mode');
  const botToken =
    botMode === 'prod' ? await getSecret('bot-token') : await getSecret('test-bot-token');
  const clientId =
    botMode === 'prod' ? await getSecret('bot-client-id') : await getSecret('test-bot-client-id');

  const rest = new REST({ version: '9' }).setToken(botToken);

  const registerGlobalSlashCommands = async () => {
    try {
      console.log('Started refreshing application (/) commands.');
      const { GlobalCommandsData } = CommandsService.getBaseCommands();
      await rest.put(Routes.applicationCommands(clientId), {
        body: GlobalCommandsData,
      });
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error refreshing application (/) commands.');
    }
  };

  // When the client is ready, run this code (only once)
  client.once('ready', async () => {
    console.log('Bot Ready! - ' + botMode);

    CommandsService = new CustomCommands(botToken, clientId);

    console.log('Gathering All Commands');
    await initCommands(CommandsService);

    console.log('Registering Global Commands');
    await registerGlobalSlashCommands();

    console.log('Registering Custom Commands');
    await CommandsService.registerCustomCommands();
  });

  // Command Interaction Handler
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { Commands } = CommandsService.getAllCommands(interaction?.guildId as string | undefined);
    const command = Commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        content: `/${interaction.commandName} was not found. `,
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const options = {
        content: 'There was an error while executing this command!',
      };
      !interaction.replied && !interaction.deferred
        ? await interaction.reply({ ...options, ephemeral: true })
        : await interaction.editReply(options);
    }
  });

  // Select Menu Handler
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'customCommand') {
      const decision = interaction.values[0];
      if (decision !== 'No') {
        await interaction.deferUpdate();
        await CommandsService.updateExistingCommand(decision, interaction);
      } else {
        await interaction.update({ content: 'Command was not updated.', components: [] });
      }
    }
  });

  // Login to Discord with your client's token
  await client.login(botToken);
};
