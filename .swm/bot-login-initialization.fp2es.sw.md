---
id: fp2es
name: Bot Login / Initialization
file_version: 1.0.2
app_version: 0.7.5-0
file_blobs:
  src/lib/client.ts: 7aa64d00134db847e463ce063fe3608808c98525
---

We initialize our new client and provide the [[sym-text:intents(e2295b1d-de25-40a4-af9a-33ee1ad289a4)]] (roles essentially) we need our Bot to have access to.

[[sym-text:Intents.FLAGS.GUILDS(14c6fe35-3bc7-478d-b058-99563554bc38)]] Allows the Bot to manage admin aspects of Guilds (Create, Update, Delete) as well as CRUD for Roles and Threads within Guilds.

[[sym-text:Intents.FLAGS.GUILD_MESSAGES(a332ed97-cd26-444b-bc54-e39f71312dc2)]] Allows the Bot to manage the messages sent to channels within a Guild, as well as send messages itself.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 11     
⬜ 12     let CommandsService;
⬜ 13     
🟩 14     export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
⬜ 15     
⬜ 16     export const login = async () => {
⬜ 17       const botMode = await getSecret('bot-mode');
```

<br/>

From our [[sym-text:login(2a0e45ea-e109-4a2c-9c4a-8c2d2445cf60)]] method, we first request some secrets from our GCP Secret Manager.

[[sym-text:bot-mode(061d750f-df73-4eb8-af26-1d92315c874e)]] allows us to toggle between a production bot and a test bot, so we can be running our production bot from our server and simultaneously run a different bot during local development.

[[sym-text:bot-token(dc804dba-f0b7-4ced-8de6-4531fb84ddab)]] ,[[sym-text:test-bot-token(fa9e68a3-e4b5-4210-b008-c6fb8632a65b)]] , [[sym-text:bot-client-id(3464b28d-3d6f-4f93-9221-7826a48f5e4b)]] , and [[sym-text:test-bot-client-id(4f6aaf88-2438-4086-a9e0-27860ed6194d)]] are all configuration variables for the specific bot we want to activate. If [[sym-text:bot-mode(061d750f-df73-4eb8-af26-1d92315c874e)]] is equal to [[sym-text:prod(99db48c2-559e-4106-b473-3acb09d1dc84)]] then we will use our production bot secrets, otherwise, we will use our test bot's secrets.

In the future, we could remove our test bot secrets from GCP Secret Manager and instead retrieve those details from a `.env` file that is ignored from our repository. This would allow any developer to use their own bot for local testing, as multiple developers cannot simultaneously use the same test bot locally.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 14     export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
⬜ 15     
⬜ 16     export const login = async () => {
🟩 17       const botMode = await getSecret('bot-mode');
🟩 18       const botToken =
🟩 19         botMode === 'prod' ? await getSecret('bot-token') : await getSecret('test-bot-token');
🟩 20       const clientId =
🟩 21         botMode === 'prod' ? await getSecret('bot-client-id') : await getSecret('test-bot-client-id');
⬜ 22     
⬜ 23       const rest = new REST({ version: '9' }).setToken(botToken);
⬜ 24     
```

<br/>

When the client is "ready", which occurs after we initiate client login, we create our [[sym-text:CommandsService(53da3e46-3e5e-47cd-be49-cc736cdf3d0e)]] from the[[sym-text:CustomCommands(9acaf8af-c383-4278-9233-67615a7cb881)]] class which manages all the custom commands a bot has been taught across all the guilds it resides in.

First using [[sym-text:initCommands(3fa1dd6a-6f48-407c-9bc1-05f9c01a93fa)]] , we create create the Global Commands that the bot will know in all of the Guilds it resides in. We pass [[sym-text:CommandsService(e2bf1eb5-d37f-4e11-b4f7-843b20c020b5)]] to [[sym-text:initCommands(3fa1dd6a-6f48-407c-9bc1-05f9c01a93fa)]] in order to populate [[sym-text:CommandsService(e2bf1eb5-d37f-4e11-b4f7-843b20c020b5)]] with the initial set of Global Commands - this allows us to block the creation of any custom commands with names that conflict with existing Global Commands. [[sym-text:initCommands(3fa1dd6a-6f48-407c-9bc1-05f9c01a93fa)]] can be viewed in [[sym:./src/commands/index.ts(13210cd6-e299-4af4-9f51-ec7e54ea4cb8)]] .

Next, [[sym-text:registerGlobalSlashCommands(797e2f68-2adb-403d-a54e-9a787a694cf5)]] will take the Global Commands and register them with Discord. This will update any existing commands with any changes that were made, as well as add any new commands.

Last, [[sym-text:CommandsService.registerCustomCommands(f38ffc87-de59-4876-9afd-c09eba7077fa)]] will then register all of the custom commands the bot has been taught. However, these custom commands will only be registered to the guilds that taught him the command.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 35         }
⬜ 36       };
⬜ 37     
🟩 38       // When the client is ready, run this code (only once)
🟩 39       client.once('ready', async () => {
🟩 40         console.log('Bot Ready! - ' + botMode);
🟩 41     
🟩 42         CommandsService = new CustomCommands(botToken, clientId);
🟩 43     
🟩 44         console.log('Gathering All Commands');
🟩 45         await initCommands(CommandsService);
🟩 46     
🟩 47         console.log('Registering Global Commands');
🟩 48         await registerGlobalSlashCommands();
🟩 49     
🟩 50         console.log('Registering Custom Commands');
🟩 51         await CommandsService.registerCustomCommands();
🟩 52       });
⬜ 53     
⬜ 54       // Command Interaction Handler
⬜ 55       client.on('interactionCreate', async (interaction) => {
```

<br/>

[[sym-text:interactionCreate(e345b4dc-7837-4dd2-b1d3-12b4b60f61d6)]] hook is fired anytime a user triggers an 'interaction' with out bot.

This hook handler is only responsible for handling slash commands, both global and custom. First it will check if this command is a recognized global command, or if it matches a custom command in this guild.

If a match is found, the bot will attempt to execute the command - if there is any error the bot will respond with a message indicating such.

If no match is found, the bot will respond stating such. [[sym-text:ephemeral(4300d366-26ac-48e0-bc4e-2d7a97cec27f)]] tells the bot whether the response should be viewable only by the person who triggered the command, or if everyone should see the response. Since this is an error message, we want this only to be viewable by the user who triggered this command, as to not muddy the chat.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 51         await CommandsService.registerCustomCommands();
⬜ 52       });
⬜ 53     
🟩 54       // Command Interaction Handler
🟩 55       client.on('interactionCreate', async (interaction) => {
🟩 56         if (!interaction.isCommand()) return;
🟩 57     
🟩 58         const { Commands } = CommandsService.getAllCommands(interaction?.guildId as string | undefined);
🟩 59         const command = Commands.get(interaction.commandName);
🟩 60         if (!command) {
🟩 61           await interaction.reply({
🟩 62             content: `/${interaction.commandName} was not found. `,
🟩 63             ephemeral: true,
🟩 64           });
🟩 65           return;
🟩 66         }
🟩 67     
🟩 68         try {
🟩 69           await command.execute(interaction);
🟩 70         } catch (error) {
🟩 71           console.error(error);
🟩 72           const options = {
🟩 73             content: 'There was an error while executing this command!',
🟩 74           };
🟩 75           !interaction.replied && !interaction.deferred
🟩 76             ? await interaction.reply({ ...options, ephemeral: true })
🟩 77             : await interaction.editReply(options);
🟩 78         }
🟩 79       });
⬜ 80     
⬜ 81       // Select Menu Handler
⬜ 82       client.on('interactionCreate', async (interaction) => {
```

<br/>

This [[sym-text:interactionCreate(c12f52a8-cae2-4b72-8840-897b013e85a2)]] is responsible for handle select menu interactions. Currently, the only implementation of a select menu is when a user attempts to update an existing custom command.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 78         }
⬜ 79       });
⬜ 80     
🟩 81       // Select Menu Handler
🟩 82       client.on('interactionCreate', async (interaction) => {
🟩 83         if (!interaction.isSelectMenu()) return;
🟩 84     
🟩 85         if (interaction.customId === 'customCommand') {
🟩 86           const decision = interaction.values[0];
🟩 87           if (decision !== 'No') {
🟩 88             await interaction.deferUpdate();
🟩 89             await CommandsService.updateExistingCommand(decision, interaction);
🟩 90           } else {
🟩 91             await interaction.update({ content: 'Command was not updated.', components: [] });
🟩 92           }
🟩 93         }
🟩 94       });
⬜ 95     
⬜ 96       // In-text Chat Commands Handler
⬜ 97       client.on('messageCreate', async (message) => {
```

<br/>

The last event handler we set-up is [[sym-text:messageCreate(28e8ae12-948e-4319-9e4b-826d2ad632eb)]] , this will fire every time a message is sent by any user in a guild this bot resides in. Our bot will ignore any message that a bot creates, and any message a real user creates will be checked for any inline chat commands, currently the karma system is our only inline chat command.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 93         }
⬜ 94       });
⬜ 95     
🟩 96       // In-text Chat Commands Handler
🟩 97       client.on('messageCreate', async (message) => {
🟩 98         if (message.author.bot) return;
🟩 99         await checkMessageForKarma(message);
🟩 100      });
⬜ 101    
⬜ 102      // Login to Discord with your client's token
⬜ 103      await client.login(botToken);
```

<br/>

After we set all of our bot's commands and initialize all of the event listeners, we call [[sym-text:client.login(f105b1b0-203d-4e77-98a8-00c28887840b)]] to turn on our bot. Once this occurs, if the bot is successfully stood up we will see "Bot Ready" logged as the "ready" event will be triggered, and our bot should now be showing online in any guild it resides in.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 99         await checkMessageForKarma(message);
⬜ 100      });
⬜ 101    
🟩 102      // Login to Discord with your client's token
🟩 103      await client.login(botToken);
⬜ 104    };
⬜ 105    
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBTXJNYWNrZXklM0ElM0FDb3dEb3REZXY=/docs/fp2es).