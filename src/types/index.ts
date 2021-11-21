import { SlashCommandBuilder } from '@discordjs/builders';
import { FieldValue } from '@google-cloud/firestore';
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

export enum KarmaFate {
  POSITIVE = '++',
  NEGATIVE = '--',
  RANDOM = '~~',
}

export interface KarmaUser {
  userId: string;
  fate: KarmaFate;
}

export interface KarmaEntry {
  guildId: string;
  sentByUserId: string;
  receivedByUserId: string;
  fate: KarmaFate;
  message: string;
  createdAt: FieldValue;
}
