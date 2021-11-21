import { Collection } from 'discord.js';

import { CommandObject } from '#/types';
import Chuck from '#commands/chuck';
import CustomCommands from '#commands/custom';
import Drugs from '#commands/drugs';
import { Karma } from '#commands/karma';
import Pizza from '#commands/pizza';
import Ram from '#commands/ram';
import Roll from '#commands/roll';
import Urban from '#commands/urban';
import Xkcd from '#commands/xkcd';

const initCommands = async (customCommands: CustomCommands): Promise<void> => {
  const GlobalCommands = new Collection<string, CommandObject>();

  // Set Base Commands
  GlobalCommands.set(Chuck.data.name, Chuck);
  GlobalCommands.set(Drugs.data.name, Drugs);
  GlobalCommands.set(Pizza.data.name, Pizza);
  GlobalCommands.set(Karma.data.name, Karma);
  GlobalCommands.set(Ram.data.name, Ram);
  GlobalCommands.set(Roll.data.name, Roll);
  GlobalCommands.set(Urban.data.name, Urban);
  GlobalCommands.set(Xkcd.data.name, Xkcd);

  // Set Base Commands in Base Service
  customCommands.setBaseCommands(GlobalCommands);

  // Create On Command
  const On = customCommands.createOnCommand();
  GlobalCommands.set(On.data.name, On);

  // Get Existing Custom Commands
  await customCommands.getExistingCustomCommands();
};

export default initCommands;
