import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface CommandObject {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction & Record<string, any>) => Promise<void>;
}

export interface ICustomCommand {
  guildId: string;
  command: string;
  reaction: string;
  user: string;
}
