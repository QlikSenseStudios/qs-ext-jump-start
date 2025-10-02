require('dotenv').config();

function getNebulaQueryString() {
  return process.env.QLIK_WEB_INTEGRATION_ID
    ? `?engine_url=wss://${process.env.QLIK_ENGINE_HOST}/app/${process.env.QLIK_APP_ID}&qlik-web-integration-id=${process.env.QLIK_WEB_INTEGRATION_ID}`
    : `?engine_url=wss://${process.env.QLIK_ENGINE_HOST}/${process.env.QLIK_VP_PREFIX}/app/${process.env.QLIK_APP_ID}`;
}

async function getQlikServerAuthenticatedContext({ browser }) {
  const loginUrl = process.env.QLIK_WEB_INTEGRATION_ID
    ? `https://${process.env.QLIK_ENGINE_HOST}/sense/app/${process.env.QLIK_APP_ID}/overview`
    : `https://${process.env.QLIK_ENGINE_HOST}/${process.env.QLIK_VP_PREFIX}/sense/app/${process.env.QLIK_APP_ID}`;

  const context = await browser.newContext(
    process.env.QLIK_WEB_INTEGRATION_ID
      ? {}
      : {
          httpCredentials: {
            username: process.env.QLIK_USERNAME,
            password: process.env.QLIK_PASSWORD,
          },
        }
  );

  const page = await context.newPage();
  await page.goto(loginUrl);

  if (process.env.QLIK_WEB_INTEGRATION_ID) {
    await page.getByLabel('Email').fill(process.env.QLIK_USERNAME);
    if (process.env.QLIK_PASSWORD) {
      await page.getByLabel('Password').fill(process.env.QLIK_PASSWORD);
    }
    await page.getByRole('button', { name: 'Log In' }).click();
  }

  await page.waitForURL(`${loginUrl}`);

  return context;
}

exports.getNebulaQueryString = getNebulaQueryString;
exports.getQlikServerAuthenticatedContext = getQlikServerAuthenticatedContext;
