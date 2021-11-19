import util from 'util';

import { SlashCommandBuilder } from '@discordjs/builders';
import api from 'axios';
import { MessageEmbed } from 'discord.js';

import { CommandObject } from '#/types';

const wait = util.promisify(setTimeout);

const name = 'ram';
const description = 'Returns a Rick and Morty gif that, hopefully, matches your query.';

export default {
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option.setName('query').setDescription('Search term to query for a gif.').setRequired(true),
    ),
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const searchTerm = interaction.options.getString('query') || '';
      const { data: sceneResults } = await api.get(
        `https://masterofallscience.com/api/search?q=${encodeURIComponent(searchTerm)}`,
      );

      if (sceneResults.length <= 0) {
        await interaction.editReply('Nothing found for that term!');
      }

      const sceneIndex = Math.floor(Math.random() * sceneResults.length);
      const sceneTimestamp = +sceneResults[sceneIndex].Timestamp;
      const sceneEpisode = sceneResults[sceneIndex].Episode;
      const { data: gifResult } = await api.get(
        `https://masterofallscience.com/api/caption?e=${sceneEpisode}&t=${sceneTimestamp}`,
      );

      const episode = gifResult.Episode;
      const subtitles = gifResult.Subtitles;
      const embed = new MessageEmbed();

      const gifStart = sceneTimestamp - 1250;
      const gifEnd = sceneTimestamp + 2750;

      embed.setAuthor(episode.Title);

      // Check if subtitles is an odd number, if so shift the first index to the description and then we know the rest will be even (or 0).
      if (subtitles.length % 2 !== 0) {
        embed.setDescription(subtitles.shift().Content);
      }

      for (let i = 0; i < subtitles.length; i++) {
        // To get a zebra stripe effect, we're going to put two subtitles in a field at a time. If there isn't a "second subtitle" then we will subsitute for a blank string.
        const first = subtitles[i].Content;
        const second = subtitles[++i].Content;
        embed.addField(first, second);
      }

      embed.setFooter(`Season ${episode.Season} | Episode ${episode.EpisodeNumber}`);

      const gifUrl = `https://masterofallscience.com/gif/${sceneEpisode}/${gifStart}/${gifEnd}.gif`;
      await api.get(gifUrl);
      await wait(3000);
      embed.setImage(gifUrl);

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error retrieving Rick & Morty Gif', e);
      await interaction.editReply("There was an error getting the gif... m'kay");
    }
  },
} as CommandObject;
