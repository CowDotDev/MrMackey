import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Collection, CommandInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';

import { CommandObject, ICustomCommand } from '#/types';
import { Collections, converter, fetchCollectionList } from '#lib/database';

class CustomCommands {
  private botToken: string;
  private clientId: string;
  private baseCommands: Collection<string, CommandObject>;
  private customCommands: Collection<string, Collection<string, CommandObject>> = new Collection<
    string,
    Collection<string, CommandObject>
  >();

  constructor(botToken: string, clientId: string) {
    this.botToken = botToken;
    this.clientId = clientId;
  }

  private isGuildCustomCommandTaken(command: string, guildId: string) {
    const guildCustomCommands =
      this.customCommands.get(guildId) || new Collection<string, CommandObject>();
    return guildCustomCommands.has(command);
  }

  private isBaseCommand(command: string) {
    return this.baseCommands.has(command);
  }

  private async updateCustomCommands(guildId: string) {
    const rest = new REST({ version: '9' }).setToken(this.botToken);

    const guildCustomCommands =
      this.customCommands.get(guildId) || new Collection<string, CommandObject>();
    const CustomCommandsData = guildCustomCommands.map((command) => command.data);

    console.log('Started updating application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(this.clientId, guildId), {
      body: CustomCommandsData,
    });
    console.log('Successfully updated application (/) commands.');
  }

  private async saveCommand(isExisting: boolean, commandDTO: ICustomCommand, interaction) {
    const { guildId, command, reaction, user } = commandDTO;
    const cmd = {
      data: new SlashCommandBuilder()
        .setName(command)
        .setDescription(`Custom command created by ${user}`),
      execute: async (cmdInteraction) => {
        await cmdInteraction.reply(reaction);
      },
    } as CommandObject;

    await Collections.CustomCommands(guildId)
      .withConverter(converter<ICustomCommand>())
      .doc(command)
      .set({
        guildId,
        command,
        reaction,
        user,
      });

    const guildCustomCommands =
      this.customCommands.get(guildId) || new Collection<string, CommandObject>();
    guildCustomCommands.set(cmd.data.name, cmd);
    this.customCommands.set(guildId, guildCustomCommands);

    await this.updateCustomCommands(guildId);

    if (!isExisting) {
      console.log(`/${command} created in ${guildId} by ${user}.`);
      await interaction.editReply({ content: `/${command} has been created!`, components: [] });
    } else {
      console.log(`/${command} updated in ${guildId} by ${user}.`);
      await interaction.editReply({ content: `/${command} has been updated!`, components: [] });
    }
  }

  private slashCommandBuilder = new SlashCommandBuilder()
    .setName('on')
    .setDescription('Create a custom command with a static reaction.')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Name of your command, i.e. /custom.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('reaction').setDescription('Text and/or URL reaction.').setRequired(true),
    );

  private async execute(interaction: CommandInteraction & Record<string, any>) {
    await interaction.deferReply({
      ephemeral: true,
    });

    // Regex turns all whitespace and special characters to dashes, but doesn't have dashes touch. (i.e. " !!!! happy !! stumpy !! " would be transformed into "happy-stumpy")
    const user = interaction?.user?.username || 'Unknown User';
    const guildId = interaction.guildId;
    const command = interaction.options.getString('command')
      ? interaction.options
          .getString('command')
          ?.replace(/[^A-Z0-9]+/gi, '-')
          ?.replace(/^-+|-+$/g, '')
      : false;
    const reaction =
      interaction.options.getString('reaction') ||
      "There was an issue getting this reaction... m'kay";

    // Make sure command isn't false, and that command is more than just dashes
    const sanitizedCommand = command && command.replace('-', '');
    if (command && sanitizedCommand !== '') {
      if (this.isBaseCommand(command)) {
        await interaction.editReply({
          content: `${command} is reserved, please use a different command name.`,
        });
      } else if (this.isGuildCustomCommandTaken(command, guildId)) {
        // Command exists, we need to confirm if the user wants to overwrite the existing reaction.
        const row = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId('customCommand')
            .setPlaceholder('Nothing selected')
            .addOptions([
              {
                label: 'Yes',
                description: 'Yes, update the command.',
                value: JSON.stringify({
                  guildId,
                  command,
                  reaction,
                  user,
                }),
              },
              {
                label: 'No',
                description: 'No, do not update command.',
                value: 'No',
              },
            ]),
        );

        await interaction.editReply({
          content: `/${command} already exists, do you want to update it?`,
          components: [row],
        });
      } else {
        // Command is available, create command with reaction.
        await this.saveCommand(
          false,
          {
            guildId,
            command,
            reaction,
            user,
          },
          interaction,
        );
      }
    }
  }

  async getExistingCustomCommands(): Promise<
    Collection<string, Collection<string, CommandObject>>
  > {
    const collectionList = await fetchCollectionList();
    const customCommandsCollections = collectionList.filter(
      (collection) => collection?.id?.includes('custom-commands') ,
    );
    const existingGuildIds = customCommandsCollections.map(
      (collection) => collection.id.replace('custom-commands', '') ,
    );

    for (const guildId of existingGuildIds) {
      const existingCustomCommands = await Collections.CustomCommands(guildId)
        .withConverter(converter<ICustomCommand>())
        .get();

      existingCustomCommands.forEach((doc) => {
        const docData = doc.data();
        const cmd = {
          data: new SlashCommandBuilder()
            .setName(docData.command)
            .setDescription(`Custom command created by ${docData.user}`),
          execute: async (interaction) => {
            await interaction.reply(docData.reaction);
          },
        } as CommandObject;

        const guildCustomCommands =
          this.customCommands.get(guildId) || new Collection<string, CommandObject>();
        guildCustomCommands.set(cmd.data.name, cmd);
        this.customCommands.set(guildId, guildCustomCommands);
      });
    }

    return this.customCommands;
  }

  createOnCommand() {
    const cmd = {
      data: this.slashCommandBuilder,
      execute: this.execute.bind(this),
    } as CommandObject;

    this.baseCommands.set(cmd.data.name, cmd);

    return cmd;
  }

  getBaseCommands() {
    return {
      GlobalCommands: this.baseCommands,
      GlobalCommandsData: this.baseCommands.map((command) => command.data),
    };
  }

  setBaseCommands(baseCommands: Collection<string, any>) {
    this.baseCommands = baseCommands;
  }

  registerCustomCommands() {
    this.customCommands?.map(async (guildCommands, guildId) => {
      console.log('Registering Custom Commands for GuildID: ' + guildId);
      await this.updateCustomCommands(guildId);
    });
    console.log('Successfully Registered Custom Commands');
  }

  getAllCommands(guildId?: string) {
    const guildCustomCommands = guildId
      ? this.customCommands.get(guildId) || new Collection<string, CommandObject>()
      : new Collection<string, CommandObject>();
    return {
      Commands: this.baseCommands.concat(guildCustomCommands),
    };
  }

  async updateExistingCommand(updateJSONString: string, interaction) {
    const updateDTO = JSON.parse(updateJSONString) as ICustomCommand;
    await this.saveCommand(true, updateDTO, interaction);
  }
}

export default CustomCommands;
