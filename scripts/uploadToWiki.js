import fs from 'fs';
import crypto from 'crypto';
import Session from 'm3api/node.js';

async function main() {
  const [_nodeExecutable, _scriptName, ...args] = process.argv;
  let apiUrl;
  if (args.length === 0) {
    apiUrl = 'https://wikidata.beta.wmflabs.org/w/api.php';
  } else if (args.length > 1 || !args[0].startsWith('--apiUrl=')) {
    throw new Error('only the optional parameter `apiUrl` is supported!');
  } else {
    apiUrl = args[0].substring('--apiUrl='.length);
  }
  const botName = process.env.BOT_USER;
  const botPass = process.env.BOT_PASS;
  const username = process.env.USER_NAME;

  if (!botName || !botPass || !username) {
    throw new Error('Please set BOT_USER, BOT_PASS and USER_NAME env vars!');
  }

  if (botName.indexOf(username) !== 0) {
    throw new Error('BOT_USER must start with USER_NAME!');
  }

  const filePrefix = 'src';
  const localFiles = await getFileList(filePrefix);
  console.log('Found number of local files:', localFiles.length);
  // get file meta data
  const localPageData = localFiles.reduce((carry, filePath) => {
    const subPageName = filePath.substr(filePrefix.length + 1);
    const fullPageName = `User:${username}/${subPageName}`;
    const content = fs.readFileSync(filePath, 'utf8').trim();
    const shasum = crypto.createHash('sha1');
    shasum.update(content);
    carry[fullPageName] = {
      filePath,
      content,
      sha1: shasum.digest('hex'),
      fullPageName,
    };
    return carry;
  }, {});

  const session = new Session(
    apiUrl,
    {
      formatversion: 2,
      errorformat: 'plaintext',
    },
    {
      userAgent:
        'PersonalUserscriptUpdater/0.0 (https://github.com/micgro42/mediawiki_userscripts) m3api/0.8/0',
    },
  );

  console.log('Logging in...');
  const loginResponse = await session.request(
    {
      action: 'login',
      lgname: botName,
      lgpassword: botPass,
    },
    {
      method: 'POST',
      tokenType: 'login',
      tokenName: 'lgtoken',
    },
  );
  if (loginResponse.login.result !== 'Success') {
    console.log(loginResponse);
    throw new Error('Login failed! 😭');
  }

  console.log('Requesting file meta data...');
  const pageRevisionMetaQueryResponse = await session.request({
    action: 'query',
    prop: 'revisions',
    rvprop: 'timestamp|slotsha1|user|comment',
    rvslots: 'main',
    titles: Object.keys(localPageData).join('|'),
    format: 'json',
  });
  const pagesMeta = pageRevisionMetaQueryResponse.query.pages;

  const changedFiles = Object.entries(localPageData).filter(
    ([pageName, pageData]) => {
      const pageMeta = pagesMeta.find((page) => page.title === pageName);
      if (!pageMeta || pageMeta.missing) {
        console.log(`Page ${pageName} does not exist yet`);
        return true;
      }

      if (pageMeta.revisions[0].slots.main.sha1 !== pageData.sha1) {
        console.log(`Page ${pageName} has changed`);
        return true;
      }
      console.log(`Page ${pageName} has not changed`);
      return false;
    },
  );

  console.log('Found number of changed files:', changedFiles.length);

  // update files that changed
  let index = 0;
  for (const [, pageData] of changedFiles) {
    index += 1;
    console.log(
      `Uploading ${index}/${changedFiles.length}: ${pageData.fullPageName}`,
    );
    const params = {
      action: 'edit',
      title: pageData.fullPageName,
      text: pageData.content,
      summary:
        'Uploaded from https://github.com/micgro42/mediawiki_userscripts',
    };
    const response = await session.request(params, {
      method: 'POST',
      tokenType: 'csrf',
    });
    console.log(response);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function getFileList(dirName) {
  let files = [];
  const items = await fs.promises.readdir(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.name === 'index.js') {
      continue;
    }
    if (item.name === '__tests__') {
      continue;
    }
    if (item.isDirectory()) {
      files = [...files, ...(await getFileList(`${dirName}/${item.name}`))];
    } else {
      files.push(`${dirName}/${item.name}`);
    }
  }

  return files;
}

main();
