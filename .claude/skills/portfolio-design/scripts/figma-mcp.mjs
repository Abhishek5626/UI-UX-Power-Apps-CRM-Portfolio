// Minimal MCP client for Figma's local Dev Mode server. Usage: node mcp.mjs list | node mcp.mjs call <tool> '<json args>' [outfile]
import fs from 'fs'
const URL_ = 'http://127.0.0.1:3845/mcp'
let session = null, id = 0
const post = async (body) => {
  const res = await fetch(URL_, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(session ? { 'mcp-session-id': session } : {}) }, body: JSON.stringify(body) })
  const sid = res.headers.get('mcp-session-id'); if (sid) session = sid
  const text = await res.text()
  if (!text) return { status: res.status }
  const data = text.includes('data:') ? text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).pop() : text
  try { return JSON.parse(data) } catch { return { status: res.status, raw: text.slice(0, 500) } }
}
const init = await post({ jsonrpc: '2.0', id: ++id, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'portfolio-audit', version: '1' } } })
if (!init.result) { console.log('INIT FAILED', JSON.stringify(init).slice(0, 600)); process.exit(1) }
await post({ jsonrpc: '2.0', method: 'notifications/initialized' })
const [, , cmd, tool, args, out] = process.argv
if (cmd === 'list') {
  const r = await post({ jsonrpc: '2.0', id: ++id, method: 'tools/list' })
  console.log(init.result.serverInfo?.name, init.result.serverInfo?.version)
  for (const t of r.result?.tools || []) console.log('-', t.name, JSON.stringify(Object.keys(t.inputSchema?.properties || {})))
  if (!r.result) console.log(JSON.stringify(r).slice(0, 600))
} else {
  const r = await post({ jsonrpc: '2.0', id: ++id, method: 'tools/call', params: { name: tool, arguments: JSON.parse(args || '{}') } })
  const parts = r.result?.content || []
  let text = ''
  parts.forEach((c, i) => { if (c.type === 'text') text += c.text + '\n'; else if (c.type === 'image' && out) fs.writeFileSync(out.replace(/\.\w+$/, `-${i}.png`), Buffer.from(c.data, 'base64')) })
  if (!r.result) text = JSON.stringify(r).slice(0, 1200)
  if (out) { fs.writeFileSync(out, text); console.log('saved', out, text.length, 'chars', 'isError', r.result?.isError) } else console.log(text)
}
