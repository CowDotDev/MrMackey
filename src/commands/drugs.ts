import { SlashCommandBuilder } from '@discordjs/builders';

import { CommandObject } from '#/types';

const name = 'drugs';
const description = 'Let them know how Mr.Mackey feels about drugs.';

export default {
  data: new SlashCommandBuilder().setName(name).setDescription(description),
  execute: async (interaction) => {
    await interaction.reply("Drugs are bad, m'kay.");
  },
} as CommandObject;
