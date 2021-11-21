import { SlashCommandBuilder } from '@discordjs/builders';
import { FieldValue } from '@google-cloud/firestore';
import { CommandInteraction, Message, User } from 'discord.js';

import { CommandObject, KarmaEntry, KarmaFate, KarmaUser } from '#/types';
import { randomCompliment } from '#constants/compliments';
import { randomInsult } from '#constants/insults';
import { Collections, converter } from '#lib/database';
import { addPosessive } from '#lib/helpers';

export const checkMessageForKarma = async (message: Message) => {
  const karmaRegex = new RegExp(/<@!?([0-9]+)>\s*(\+\+|--|~~)/g);
  const karmaMatchesSet = new Set<KarmaUser>();
  [...message.content.matchAll(karmaRegex)].forEach((match) => {
    karmaMatchesSet.add({ userId: match[1], fate: match[2] as KarmaFate });
  });

  let karmaMatches = Array.from(karmaMatchesSet);
  const karmaMatchesAuthor = karmaMatches.filter((match) => match.userId === message.author.id);
  karmaMatches = karmaMatches.filter((match) => match.userId !== message.author.id);

  const hasKarmaMatches = karmaMatches.length > 0;
  if (hasKarmaMatches && message.guildId) {
    await Promise.all(karmaMatches.map(async (karma) => updateKarma(karma, message)));

    const positives = karmaMatches.filter((karma) => karma.fate === KarmaFate.POSITIVE);
    const negative = karmaMatches.filter((karma) => karma.fate === KarmaFate.NEGATIVE);

    const responses: string[] = [];
    if (positives.length > 0) {
      const users = positives.map((karma) => `<@!${karma.userId}>`);
      responses.push(`${users.join(' ')} - ${randomCompliment()}`);
    }
    if (negative.length > 0) {
      const users = negative.map((karma) => `<@!${karma.userId}>`);
      responses.push(`${users.join(' ')} - ${randomInsult()}`);
    }

    await message.reply(responses.join('\n'));
  } else if (hasKarmaMatches && !message.guildId) {
    await message.reply('Karma can only be used within a discord server/guild.');
  } else if (!hasKarmaMatches && karmaMatchesAuthor.length >= 1) {
    await message.reply("Quit jerking yourself off... m'kay");
  }
};

export const updateKarma = async (karma: KarmaUser, message: Message): Promise<KarmaUser> => {
  const guildId = message.guildId as string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  if (karma.fate === KarmaFate.RANDOM) {
    const roll = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
    karma.fate = roll >= 50 ? KarmaFate.POSITIVE : KarmaFate.NEGATIVE;
  }

  try {
    await Collections.Karma.withConverter(converter<KarmaEntry>()).add({
      guildId,
      sentByUserId: message.author.id,
      receivedByUserId: karma.userId,
      fate: karma.fate,
      message: message.content,
      createdAt: FieldValue.serverTimestamp(),
    });

    return karma;
  } catch (e) {
    console.log('Error updating karma...', karma, e);
    return karma;
  }
};

const getUserTotals = async (user: User, interaction: CommandInteraction & Record<string, any>) => {
  const userKarma = await Collections.Karma.withConverter(converter<KarmaEntry>())
    .where('guildId', '==', interaction.guildId)
    .where('receivedByUserId', '==', user.id)
    .orderBy('createdAt', 'desc')
    .get();

  let total = 0;
  let latest = '';
  if (!userKarma.empty) {
    const karmaDocs: KarmaEntry[] = [];
    userKarma.forEach((karma) => {
      karmaDocs.push(karma.data());
    });

    const karmaCounts: number[] = karmaDocs.map((karma) =>
      karma.fate === KarmaFate.POSITIVE ? 1 : -1,
    );

    total = karmaCounts.reduce((prev, curr) => prev + curr);
    latest = `**Latest:** ${karmaDocs[0].message}`;
  }

  return interaction.reply(`**${addPosessive(user.username)} Karma:** ${total}\n\n${latest}`);
};

const getServerTotals = async (
  guildId: string,
  interaction: CommandInteraction & Record<string, any>,
) => {
  const serverKarma = await Collections.Karma.withConverter(converter<KarmaEntry>())
    .where('guildId', '==', interaction.guildId)
    .orderBy('createdAt', 'desc')
    .get();

  if (!serverKarma.empty) {
    const karmaDocsByUser = {};
    serverKarma.forEach((karma) => {
      const doc = karma.data();
      karmaDocsByUser[doc.receivedByUserId] =
        (karmaDocsByUser[doc.receivedByUserId] || 0) + (doc.fate === KarmaFate.POSITIVE ? 1 : -1);
    });

    const karmaServerUsers = Object.keys(karmaDocsByUser);
    const serverKarmaRankings = karmaServerUsers.map((userId) => ({
      userId,
      total: karmaDocsByUser[userId],
    }));

    serverKarmaRankings.sort((a, b) => {
      if (a.total > b.total) {
        return -1;
      }
      if (a.total < b.total) {
        return 1;
      }
      return 0;
    });

    const responses: string[] = [];
    for (let i = 0; i < serverKarmaRankings.length; i++) {
      let rank = `**${i + 1}.**`;
      if (i === 0) {
        rank = `👑 ${rank}`;
      } else if (serverKarmaRankings.length - 1 === i) {
        rank = `💩 ${rank}`;
      }
      responses.push(
        `${rank} <@!${serverKarmaRankings[i].userId}> ( ${serverKarmaRankings[i].total} )`,
      );
    }

    await interaction.reply(`**Server Karma Rankings:**\n\n${responses.join('\n')}`);
  } else {
    await interaction.reply("There is no karma on this server, yet... m'kay");
  }
};

const getKarmaTotals = async (
  scope: string,
  interaction: CommandInteraction & Record<string, any>,
  target?: User,
) => {
  switch (scope) {
    case 'myself':
      await getUserTotals(interaction.user, interaction);
      break;
    case 'user':
      await getUserTotals(target as User, interaction);
      break;
    case 'server':
    default:
      await getServerTotals(interaction.guildId, interaction);
      break;
  }
};

export const Karma = {
  data: new SlashCommandBuilder()
    .setName('karma')
    .setDescription('Retrieve karma score for an individual or the server.')
    .addSubcommand((subcommand) =>
      subcommand.setName('myself').setDescription('Karma for yourself.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('Karma for a user')
        .addUserOption((option) =>
          option.setName('target').setDescription('The user').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('server').setDescription('Karma for the server.'),
    ),
  execute: async (interaction) => {
    const scope = interaction.options.getSubcommand(true);
    await getKarmaTotals(
      scope,
      interaction,
      interaction.options.getUser('target') as User | undefined,
    );
  },
} as CommandObject;
