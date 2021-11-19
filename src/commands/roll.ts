import { SlashCommandBuilder } from '@discordjs/builders';

import { CommandObject } from '#/types';

const name = 'roll';
const description = 'Roll the dice';

export default {
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option
        .setName('dice')
        .setDescription("1d20, 5d6, or '1d20 2d6' - [1-99]d[1-999]")
        .setRequired(true),
    ),
  execute: async (interaction) => {
    const dice = interaction.options.getString('query') || '';
    const allDice = dice.split(' ');

    const validDiceTest = new RegExp(/^[1-9]{1}[0-9]{0,1}d+[1-9]{1}[0-9]{0,2}$$/g); // [1-99]d[1-999]
    const validDice = allDice.filter((d) => validDiceTest.test(d));

    if (validDice.length > 0) {
      const totalRolls = validDice.map((d) => {
        const parts = d.split('d');
        const numOfDie = +parts[0];
        const sidesOfDie = +parts[1];

        const rolls: number[] = [];
        for (let i = 0; i < numOfDie; i++) {
          rolls.push(Math.floor(Math.random() * (sidesOfDie - 1 + 1)) + 1);
        }

        return {
          die: d,
          rolls,
        };
      });

      const total = totalRolls
        .map((d) => d.rolls)
        .reduce((prev, curr) => curr.concat(prev))
        .reduce((prev, curr) => prev + curr);

      const totalDice = totalRolls.map((d) => {
        const dieTotal = d.rolls.reduce((prev, curr) => prev + curr);
        const indRolls = d.rolls.map((roll) => {
          if (roll === +d.die.split('d')[1]) {
            return `**${roll}**`;
          } else if (roll === 1) {
            return `*${roll}*`;
          }
          return roll;
        });
        return `${d.die} | ${indRolls.join(' + ')} (${dieTotal})`;
      });

      await interaction.reply(`**Dice:** ${totalDice.join(' + ')}\n**Total:** ${total}`);
    } else {
      await interaction.reply("Didn't find any dice... m'kay");
    }
  },
} as CommandObject;
