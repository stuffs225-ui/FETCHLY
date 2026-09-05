import { chromium } from 'playwright'
import fs from 'node:fs'
import { renderQuotationHtml } from './pdfTemplate.js'

// This sandbox pins Chromium at a fixed path outside Playwright's usual
// managed-browser cache; a normal deployment (after `npx playwright
// install`) resolves its own browser automatically, so only override the
// path when that sandbox install is actually present.
const SANDBOX_CHROMIUM_PATH = '/opt/pw-browsers/chromium'
const resolvedExecutablePath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH || (fs.existsSync(SANDBOX_CHROMIUM_PATH) ? SANDBOX_CHROMIUM_PATH : undefined)

let browserPromise = null

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      executablePath: resolvedExecutablePath,
      args: ['--no-sandbox'],
    })
  }
  return browserPromise
}

/**
 * Renders a quotation to a PDF buffer server-side via headless Chromium.
 * Using the real browser layout/text engine (rather than html2canvas + a
 * rasterized image, as the previous client-side implementation did) keeps
 * Arabic shaping correct, produces sharp/selectable text, and paginates
 * reliably across pages of any length.
 */
export async function renderQuotationPdf(quotation, company) {
  const html = renderQuotationHtml(quotation, company)
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.setContent(html, { waitUntil: 'networkidle' })
    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })
    return buffer
  } finally {
    await page.close()
  }
}

export async function closePdfBrowser() {
  if (browserPromise) {
    const browser = await browserPromise
    await browser.close()
    browserPromise = null
  }
}
