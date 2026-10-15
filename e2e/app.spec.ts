import { expect, test } from '@playwright/test'

// Seed data (src/server/db.json): the logged-in user Thibaut talks with Jeremie in conversation 1

test('opening a conversation shows its heading and messages', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: /Jeremie/ }).click()

  await expect(page).toHaveURL('/conversations/1')
  await expect(page.getByRole('heading', { level: 1, name: 'Jeremie' })).toBeVisible()
  await expect(page.getByText(/troisième message de la première conversation/)).toBeVisible()
})

test('a sent message appears in the thread and is still there after reload', async ({ page }) => {
  const text = `Message e2e ${Date.now()}`
  await page.goto('/')
  await page.getByRole('link', { name: /Jeremie/ }).click()

  await page.getByRole('textbox', { name: 'Votre message' }).fill(text)
  await page.keyboard.press('Enter')

  await expect(page.getByText(text)).toBeVisible()
  await expect(page.getByText('Envoi…')).toBeHidden() // saved by the server
  await page.reload()
  await expect(page.getByText(text)).toBeVisible()
})

test('choosing an existing contact in "Nouvelle conversation" opens that conversation', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Nouvelle conversation' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Jeremie/ })
    .click()

  await expect(page).toHaveURL('/conversations/1')
  await expect(page.getByRole('heading', { level: 1, name: 'Jeremie' })).toBeVisible()
})

test('a server error shows a friendly message, and Réessayer recovers', async ({ page }) => {
  await page.route('**/messages/1', (route) => route.fulfill({ status: 503, body: '{}' }))
  await page.goto('/')
  await page.getByRole('link', { name: /Jeremie/ }).click()

  // The app retries 3 times (1s, 2s, 4s) before showing the error
  await expect(page.getByText('Nos serveurs rencontrent un souci', { exact: false })).toBeVisible({
    timeout: 15_000,
  })

  await page.unroute('**/messages/1')
  await page.getByRole('button', { name: 'Réessayer' }).click()
  await expect(page.getByText(/troisième message de la première conversation/)).toBeVisible()
})

test.describe('on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('the back button returns from a conversation to the list', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /Jeremie/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Jeremie' })).toBeVisible()

    await page.getByRole('link', { name: 'Retour aux conversations' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Messages' })).toBeVisible()
  })
})
