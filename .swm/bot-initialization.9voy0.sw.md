---
id: 9voy0
name: Bot Initialization
file_version: 1.0.2
app_version: 0.7.5-0
file_blobs:
  index.ts: db923a126762115ed015d119724b486b0da511b1
  src/lib/client.ts: 7aa64d00134db847e463ce063fe3608808c98525
---

First, the application will run our `📄 index.ts` file when the application is started locally or in production. (Review [NPM Script Overview](npm-script-overview.qn027.sw.md) for an overview of our start scripts.)

This file doesn't do much other than providing a log of the application starting up, and then initiating `login`[<sup id="1e8JSJ">↓</sup>](#f-1e8JSJ) from `📄 src/lib/client.ts` .

_Note:_ `#` _is a path prefix this application has set up to help map to our `📄 src` directory. You can view `📄 tsconfig.json` to review our custom module paths._
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 index.ts
```typescript
🟩 1      import { login } from '#lib/client';
🟩 2      
🟩 3      // eslint-disable-next-line no-console
🟩 4      console.log('MrMackey Started.');
🟩 5      
🟩 6      void login();
⬜ 7      
```

<br/>

We initialize our new client and provide the `intents`[<sup id="ZbDaxo">↓</sup>](#f-ZbDaxo) (roles essentially) we need our Bot to have access to.

`Intents.FLAGS.GUILDS`[<sup id="NEDH5">↓</sup>](#f-NEDH5) Allows the Bot to manage admin aspects of Guilds (Create, Update, Delete) as well as CRUD for Roles and Threads within Guilds.

`Intents.FLAGS.GUILD_MESSAGES`[<sup id="126OMl">↓</sup>](#f-126OMl) Allows the Bot to manage the messages sent to channels within a Guild, as well as send messages itself.
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

From our `login`[<sup id="171uF3">↓</sup>](#f-171uF3) method, we first request some secrets from our GCP Secret Manager.

`bot-mode`[<sup id="ZLJYmE">↓</sup>](#f-ZLJYmE) allows us to toggle between a production bot and a test bot, so we can be running our production bot from our server and simultaneously run a different bot during local development.

`bot-token`[<sup id="27jXep">↓</sup>](#f-27jXep) ,`test-bot-token`[<sup id="Er0z7">↓</sup>](#f-Er0z7) , `bot-client-id`[<sup id="jEQ5D">↓</sup>](#f-jEQ5D) , and `test-bot-client-id`[<sup id="ZK9JNh">↓</sup>](#f-ZK9JNh) are all configuration variables for the specific bot we want to activate. If `bot-mode`[<sup id="ZLJYmE">↓</sup>](#f-ZLJYmE) is equal to `prod`[<sup id="Z2plpWj">↓</sup>](#f-Z2plpWj) then we will use our production bot secrets, otherwise, we will use our test bot's secrets.

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

When the client is "ready", which occurs after we initiate client login, we create our `CommandsService`[<sup id="F2C4R">↓</sup>](#f-F2C4R) from the`CustomCommands`[<sup id="ZK5MUX">↓</sup>](#f-ZK5MUX) class which manages all the custom commands a bot has been taught across all the guilds it resides in.

First using `initCommands`[<sup id="Z1d5gz2">↓</sup>](#f-Z1d5gz2) , we create create the Global Commands that the bot will know in all of the Guilds it resides in. We pass `CommandsService`[<sup id="2dcunz">↓</sup>](#f-2dcunz) to `initCommands`[<sup id="Z1d5gz2">↓</sup>](#f-Z1d5gz2) in order to populate `CommandsService`[<sup id="2dcunz">↓</sup>](#f-2dcunz) with the initial set of Global Commands - this allows us to block the creation of any custom commands with names that conflict with existing Global Commands. `initCommands`[<sup id="Z1d5gz2">↓</sup>](#f-Z1d5gz2) can be viewed in `📄 src/commands/index.ts` .

Next, `registerGlobalSlashCommands`[<sup id="cLqj2">↓</sup>](#f-cLqj2) will take the Global Commands and register them with Discord. This will update any existing commands with any changes that were made, as well as add any new commands.

Last, `CommandsService.registerCustomCommands`[<sup id="1aUp6S">↓</sup>](#f-1aUp6S) will then register all of the custom commands the bot has been taught. However, these custom commands will only be registered to the guilds that taught him the command.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/lib/client.ts
```typescript
⬜ 36       };
⬜ 37     
⬜ 38       // When the client is ready, run this code (only once)
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

`interactionCreate`[<sup id="Z1w1Ttn">↓</sup>](#f-Z1w1Ttn) hook is fired anytime a user triggers an 'interaction' with out bot.

This hook handler is only responsible for handling slash commands, both global and custom. First it will check if this command is a recognized global command, or if it matches a custom command in this guild.

If a match is found, the bot will attempt to execute the command - if there is any error the bot will respond with a message indicating such.

If no match is found, the bot will respond stating such. `ephemeral`[<sup id="Z26FeFt">↓</sup>](#f-Z26FeFt) tells the bot whether the response should be viewable only by the person who triggered the command, or if everyone should see the response. Since this is an error message, we want this only to be viewable by the user who triggered this command, as to not muddy the chat.
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

This `interactionCreate`[<sup id="ZXWYDD">↓</sup>](#f-ZXWYDD) is responsible for handle select menu interactions. Currently, the only implementation of a select menu is when a user attempts to update an existing custom command.
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

The last event handler we set-up is `messageCreate`[<sup id="21uvf1">↓</sup>](#f-21uvf1) , this will fire every time a message is sent by any user in a guild this bot resides in. Our bot will ignore any message that a bot creates, and any message a real user creates will be checked for any inline chat commands, currently the karma system is our only inline chat command.
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

After we set all of our bot's commands and initialize all of the event listeners, we call `client.login`[<sup id="2kPpM1">↓</sup>](#f-2kPpM1) to turn on our bot. Once this occurs, if the bot is successfully stood up we will see "Bot Ready" logged as the "ready" event will be triggered, and our bot should now be showing online in any guild it resides in.
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

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-jEQ5D">bot-client-id</span>[^](#jEQ5D) - "src/lib/client.ts" L21
```typescript
    botMode === 'prod' ? await getSecret('bot-client-id') : await getSecret('test-bot-client-id');
```

<span id="f-ZLJYmE">bot-mode</span>[^](#ZLJYmE) - "src/lib/client.ts" L17
```typescript
  const botMode = await getSecret('bot-mode');
```

<span id="f-27jXep">bot-token</span>[^](#27jXep) - "src/lib/client.ts" L19
```typescript
    botMode === 'prod' ? await getSecret('bot-token') : await getSecret('test-bot-token');
```

<span id="f-2kPpM1">client.login</span>[^](#2kPpM1) - "src/lib/client.ts" L103
```typescript
  await client.login(botToken);
```

<span id="f-F2C4R">CommandsService</span>[^](#F2C4R) - "src/lib/client.ts" L42
```typescript
    CommandsService = new CustomCommands(botToken, clientId);
```

<span id="f-2dcunz">CommandsService</span>[^](#2dcunz) - "src/lib/client.ts" L45
```typescript
    await initCommands(CommandsService);
```

<span id="f-1aUp6S">CommandsService.registerCustomCommands</span>[^](#1aUp6S) - "src/lib/client.ts" L51
```typescript
    await CommandsService.registerCustomCommands();
```

<span id="f-ZK5MUX">CustomCommands</span>[^](#ZK5MUX) - "src/lib/client.ts" L42
```typescript
    CommandsService = new CustomCommands(botToken, clientId);
```

<span id="f-Z26FeFt">ephemeral</span>[^](#Z26FeFt) - "src/lib/client.ts" L63
```typescript
        ephemeral: true,
```

<span id="f-Z1d5gz2">initCommands</span>[^](#Z1d5gz2) - "src/lib/client.ts" L45
```typescript
    await initCommands(CommandsService);
```

<span id="f-ZbDaxo">intents</span>[^](#ZbDaxo) - "src/lib/client.ts" L14
```typescript
export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
```

<span id="f-126OMl">Intents.FLAGS.GUILD_MESSAGES</span>[^](#126OMl) - "src/lib/client.ts" L14
```typescript
export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
```

<span id="f-NEDH5">Intents.FLAGS.GUILDS</span>[^](#NEDH5) - "src/lib/client.ts" L14
```typescript
export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
```

<span id="f-Z1w1Ttn">interactionCreate</span>[^](#Z1w1Ttn) - "src/lib/client.ts" L55
```typescript
  client.on('interactionCreate', async (interaction) => {
```

<span id="f-ZXWYDD">interactionCreate</span>[^](#ZXWYDD) - "src/lib/client.ts" L82
```typescript
  client.on('interactionCreate', async (interaction) => {
```

<span id="f-1e8JSJ">login</span>[^](#1e8JSJ) - "index.ts" L1
```typescript
import { login } from '#lib/client';
```

<span id="f-171uF3">login</span>[^](#171uF3) - "src/lib/client.ts" L16
```typescript
export const login = async () => {
```

<span id="f-21uvf1">messageCreate</span>[^](#21uvf1) - "src/lib/client.ts" L97
```typescript
  client.on('messageCreate', async (message) => {
```

<span id="f-Z2plpWj">prod</span>[^](#Z2plpWj) - "src/lib/client.ts" L19
```typescript
    botMode === 'prod' ? await getSecret('bot-token') : await getSecret('test-bot-token');
```

<span id="f-cLqj2">registerGlobalSlashCommands</span>[^](#cLqj2) - "src/lib/client.ts" L48
```typescript
    await registerGlobalSlashCommands();
```

<span id="f-ZK9JNh">test-bot-client-id</span>[^](#ZK9JNh) - "src/lib/client.ts" L21
```typescript
    botMode === 'prod' ? await getSecret('bot-client-id') : await getSecret('test-bot-client-id');
```

<span id="f-Er0z7">test-bot-token</span>[^](#Er0z7) - "src/lib/client.ts" L19
```typescript
    botMode === 'prod' ? await getSecret('bot-token') : await getSecret('test-bot-token');
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBTXJNYWNrZXklM0ElM0FDb3dEb3REZXY=/docs/9voy0).