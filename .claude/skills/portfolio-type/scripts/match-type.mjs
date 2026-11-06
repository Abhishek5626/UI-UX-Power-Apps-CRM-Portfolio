// Prints each class on your page with the type the reference uses for the same text.
// Usage: node match-type.mjs <reference-url> <your-url> <your-root-selector>
// Needs puppeteer-core and an installed Chrome (set CHROME_PATH if it isn't at the Windows default).
import { createRequire } from 'module'
import { pathToFileURL } from 'url'

const require = createRequire(pathToFileURL(process.cwd() + '/'))
const puppeteer = require('puppeteer-core')
const [, , refUrl, ownUrl, ownRoot] = process.argv
if (!refUrl || !ownUrl || !ownRoot) {
  console.error('Usage: node match-type.mjs <reference-url> <your-url> <your-root-selector>')
  process.exit(1)
}

const read = (root) => {
  const clean = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const out = []
  for (const element of document.querySelectorAll(`${root} *`)) {
    const own = [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join(' ').trim()
    const style = getComputedStyle(element)
    if (!own || element.closest('svg') || style.display === 'none' || style.visibility === 'hidden') continue
    const family = style.fontFamily.split(',')[0].replace(/"/g, '')
    const tracking = style.letterSpacing === 'normal' ? '' : ` ${style.letterSpacing}`
    out.push({
      text: clean(own),
      name: `${element.tagName.toLowerCase()}.${String(element.getAttribute('class') ?? '').split(' ')[0]}`,
      type: `${family} ${style.fontSize}/${style.lineHeight}/${style.fontWeight}${tracking}`,
    })
  }
  return out
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1000 })
await page.goto(refUrl, { waitUntil: 'networkidle2', timeout: 60000 })
const reference = await page.evaluate(read, 'body')
await page.goto(ownUrl, { waitUntil: 'networkidle2', timeout: 60000 })
const own = await page.evaluate(read, ownRoot)
await browser.close()

const exact = new Map(reference.map((item) => [item.text, item]))
const found = {}
const unmatched = new Set()
for (const item of own) {
  const match =
    exact.get(item.text) ??
    (item.text.length > 8 ? reference.find((other) => other.text.length > 8 && (other.text.startsWith(item.text.slice(0, 24)) || item.text.startsWith(other.text.slice(0, 24)))) : null)
  if (!match) {
    unmatched.add(`${item.name} (${item.type})`)
    continue
  }
  const counts = (found[item.name] ??= {})
  counts[match.type] = (counts[match.type] ?? 0) + 1
}
for (const [name, counts] of Object.entries(found)) {
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([type, count]) => `${type} x${count}`)
  console.log(`${name} => ${ranked.join(' ; ')}`)
}
console.log(`\nNo twin on the reference, place by role:\n${[...unmatched].join('\n')}`)
