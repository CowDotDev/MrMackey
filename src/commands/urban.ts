import { SlashCommandBuilder } from '@discordjs/builders';
import api from 'axios';
import { MessageEmbed } from 'discord.js';

import { CommandObject } from '#/types';

const name = 'urban';
const description = 'Given a term, will return a matching definition from Urban Dictionary.';

export default {
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Search term to query for a definition.')
        .setRequired(true),
    ),
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const search = interaction.options.getString('query') || '';
      const searchUriEncoded = encodeURIComponent(search);

      const { data: res } = await api.get(
        `http://api.urbandictionary.com/v0/define?term=${searchUriEncoded}`,
      );
      const { list: results } = res;

      if (results.length > 0) {
        const embed = new MessageEmbed();
        embed.setAuthor(`Urban Dictionary ${results.length > 1 ? 'Definitions' : 'Definition'}`);
        embed.setDescription(`Search Term: ${search}`);

        const def = results[0];
        embed.addField(
          `**Definition by:** ${def.author}`,
          `**Definition:** ${def.definition}
              **Example:** ${def.example}`,
        );

        embed.setURL(def.permalink);
        embed.setFooter(def.permalink);

        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply(
          `No urban definition for ${search}, it can mean whatever you want m'kay...`,
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error retrieving Urban defintions', e);
      await interaction.editReply("There was an error retreiving the definition, m'kay...");
    }
  },
} as CommandObject;
