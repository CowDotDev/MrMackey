import { SlashCommandBuilder } from '@discordjs/builders';

export interface CommandObject {
  data: SlashCommandBuilder;
  execute: (interaction: Record<string, any>) => Promise<void>;
}
