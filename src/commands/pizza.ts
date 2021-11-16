import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageAttachment } from 'discord.js';

import { CommandObject } from '#/types';

const name = 'pizza';
const description = 'What time is it? Pizza time.';

export default {
  data: new SlashCommandBuilder().setName(name).setDescription(description),
  execute: async (interaction) => {
    const file = new MessageAttachment(
      'https://media1.tenor.com/images/7a71a41ed97deac3853402c2b747895d/tenor.gif',
    );
    await interaction.reply({ files: [file] });
  },
} as CommandObject;
