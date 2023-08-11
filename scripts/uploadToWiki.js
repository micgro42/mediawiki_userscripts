const MWBot = require('mwbot');
const fs = require('fs');

async function main() {
  const botName = process.env.BOT_USER;
  const botPass = process.env.BOT_PASS;
  const username = process.env.USER_NAME;

  if (!botName || !botPass || !username) {
    throw new Error('Please set BOT_USER, BOT_PASS and USER_NAME env vars!');
  }

  if (botName.indexOf(username) !== 0) {
    throw new Error('BOT_USER must start with USER_NAME!');
  }

  const bot = new MWBot({
    apiUrl: 'https://www.wikidata.org/w/api.php', // FIXME: make configurable?
  });

  bot.setGlobalRequestOptions({
    headers: {
      'User-Agent':
        'PersonalUserscriptUpdater/0.0 (https://github.com/micgro42/mediawiki_userscripts) mwbot/2.1.3',
    },
  });

  console.log('Logging in...');

  await bot.loginGetEditToken({
    username: botName,
    password: botPass,
  });

  const filePrefix = 'src';
  const files = await getFileList(filePrefix);
  files.forEach(async (filePath, index, allFiles) => {
    const subPageName = filePath.substr(filePrefix.length + 1);
    const fullPageName = `User:${username}/${subPageName}`;
    console.log(`Uploading ${index + 1}/${allFiles.length}: ${fullPageName}`);

    const content = fs.readFileSync(filePath, 'utf8');
    await bot.edit(
      fullPageName,
      content,
      'Uploaded from https://github.com/micgro42/mediawiki_userscripts',
    );
  });
}

async function getFileList(dirName) {
  let files = [];
  const items = await fs.promises.readdir(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...(await getFileList(`${dirName}/${item.name}`))];
    } else {
      files.push(`${dirName}/${item.name}`);
    }
  }

  return files;
}

return main();
