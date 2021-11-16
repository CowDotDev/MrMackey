import { Collection } from 'discord.js';

import { CommandObject } from '#/types';
import Chuck from '#commands/chuck';
import Drugs from '#commands/drugs';
import Pizza from '#commands/pizza';
import Ram from '#commands/ram';
import Urban from '#commands/urban';
import Xkcd from '#commands/xkcd';

const Commands = new Collection<string, CommandObject>();

Commands.set(Chuck.data.name, Chuck);
Commands.set(Drugs.data.name, Drugs);
Commands.set(Pizza.data.name, Pizza);
Commands.set(Ram.data.name, Ram);
Commands.set(Urban.data.name, Urban);
Commands.set(Xkcd.data.name, Xkcd);

export const CommandsData = Commands.map((command) => command.data);

export default Commands;
