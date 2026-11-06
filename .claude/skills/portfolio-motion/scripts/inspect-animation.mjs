// Logs how a live page animates one CSS-module component, so a build can use real numbers.
// Usage: node inspect-animation.mjs <url> <ModuleName> ["play button text"]
// Needs puppeteer-core and an installed Chrome (set CHROME_PATH if it isn't at the Windows default).
import { createRequire } from 'module'
import { pathToFileURL } from 'url'

const require = createRequire(pathToFileURL(process.cwd() + '/'))
const puppeteer = require('puppeteer-core')
const [, , url, moduleName, playText] = process.argv
if (!url || !moduleName) {
  console.error('Usage: node inspect-animation.mjs <url> <ModuleName> ["play button text"]')
  process.exit(1)
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', protocolTimeout: 180000 })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1000 })
await page.evaluateOnNewDocument((name) => {
  window.__calls = []
  const original = Element.prototype.animate
  Element.prototype.animate = function (keyframes, timing) {
    const cls = String(this.getAttribute('class') || '')
    if (cls.includes(name)) {
      window.__calls.push(`${cls.replace(/[A-Za-z]+-module__[^_]+__/g, '').slice(0, 18)} ${Math.round(timing?.delay || 0)}+${Math.round(timing?.duration || 0)} ${timing?.fill || 'none'} ${timing?.easing || ''} ${JSON.stringify(keyframes).slice(0, 140)}`)
    }
    return original.call(this, keyframes, timing)
  }
}, moduleName)
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
const report = await page.evaluate((name) => {
  const clean = (text) => text.replace(/[A-Za-z]+-module__[^_]+__/g, '').replace(/\s+/g, ' ')
  const rules = []
  const walk = (list, prefix = '') => {
    for (const rule of list) {
      if (rule.type === 7) {
        if (rule.name.includes(name)) rules.push(clean(rule.cssText))
      } else if (rule.type === 1) {
        if (rule.selectorText.includes(`${name}-module`)) rules.push(prefix + clean(rule.cssText).slice(0, 320))
      } else if (rule.cssRules) {
        walk(rule.cssRules, rule.conditionText ? `@${rule.conditionText} ` : prefix)
      }
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules)
    } catch {
      // Cross-origin sheets can't be read.
    }
  }
  const root = document.querySelector(`[class*="${name}-module__"]`)
  root?.scrollIntoView({ block: 'center' })
  return { found: Boolean(root), rules }
}, moduleName)
console.log('Found on page:', report.found)
console.log('\nCSS rules\n' + report.rules.join('\n'))
await wait(9000)
console.log('\nCalls on autoplay\n' + (await page.evaluate(() => window.__calls.join('\n'))))
if (playText) {
  const clicked = await page.evaluate((text) => {
    window.__calls.length = 0
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.includes(text))
    button?.click()
    return Boolean(button)
  }, playText)
  await wait(500)
  console.log(`\nPlay clicked: ${clicked}\nCalls on replay\n` + (await page.evaluate(() => window.__calls.join('\n'))))
}
await browser.close()
