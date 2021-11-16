import { SlashCommandBuilder } from '@discordjs/builders';
import api from 'axios';

import { CommandObject } from '#/types';

const name = 'chuck';
const description = 'Generates a random Chuck Norris joke.';

export default {
  data: new SlashCommandBuilder().setName(name).setDescription(description),
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const joke = await api.get('http://api.icndb.com/jokes/random');
      await interaction.editReply(joke);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error requesting Chuck Norris joke.', e);
      await interaction.editReply(
        "Chuck Norris found out we were making fun of him... I couldn't get a joke, m'kay",
      );
    }
  },
} as CommandObject;
