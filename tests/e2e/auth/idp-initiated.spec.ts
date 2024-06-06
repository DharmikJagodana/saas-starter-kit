import { test as base } from '@playwright/test';
import { user, team } from '../support/helper';
import { LoginPage, SSOPage } from '../support/fixtures';

const SSO_METADATA_URL = `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`;

type IdpInitiatedFixture = {
  loginPage: LoginPage;
  ssoPage: SSOPage;
};

const test = base.extend<IdpInitiatedFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  ssoPage: async ({ page }, use) => {
    const ssoPage = new SSOPage(page, team.slug);
    await use(ssoPage);
  },
});

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);
});

test('Sign up and create SSO connection', async ({ ssoPage, loginPage }) => {
  await ssoPage.goto();
  await ssoPage.createSSOConnection(SSO_METADATA_URL);

  await loginPage.logout(user.name);
  await loginPage.idpInitiatedLogin();
  await loginPage.loggedInCheck(team.slug);

  await ssoPage.goto();
  await ssoPage.openEditSSOConnectionView();
  await ssoPage.deleteSSOConnection();
});
