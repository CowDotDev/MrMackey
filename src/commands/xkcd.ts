import { SlashCommandBuilder } from '@discordjs/builders';
import api from 'axios';
import { MessageEmbed } from 'discord.js';

import { CommandObject } from '#/types';

const name = 'xkcd';
const description = 'Returns a random xkcd comic strip.';

export default {
  data: new SlashCommandBuilder().setName(name).setDescription(description),
  execute: async (interaction) => {
    await interaction.deferReply();

    const maxId = 2542; // This is the maximum ID that doesn't 404, as of 12/21/2020
    const random_number = Math.random() * maxId;
    const comicId = Math.floor(random_number);

    try {
      const { data } = await api.get(`https://xkcd.com/${comicId}/info.0.json`);

      const date = new Date(`${data.month}/${data.day}/${data.year}`);
      const embed = new MessageEmbed()
        .setTitle(data.safe_title)
        .setDescription(data.alt)
        .setImage(data.img)
        .setTimestamp(date)
        .setAuthor('XKCD');
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error requesting XKCD comic', e);
      await interaction.editReply('There was an error fetching the comic.');
    }
  },
} as CommandObject;
