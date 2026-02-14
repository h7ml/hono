import { getActiveCheckinAccounts, getCheckinAccountById, updateCheckinResult, writeCheckinLog } from './db/checkin'
import { getSetting } from './db/settings'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/131.0.0.0 Safari/537.36'

const XOR_KEY = '3000176000856006061501533003690027800375'
const UNSBOX_TABLE = [
  0xf, 0x23, 0x1d, 0x18, 0x21, 0x10, 0x1, 0x26, 0xa, 0x9, 0x13, 0x1f, 0x28,
  0x1b, 0x16, 0x17, 0x19, 0xd, 0x6, 0xb, 0x27, 0x12, 0x14, 0x8, 0xe, 0x15,
  0x20, 0x1a, 0x2, 0x1e, 0x7, 0x4, 0x11, 0x5, 0x3, 0x1c, 0x22, 0x25,
  0xc, 0x24,
]

const CHECKIN_DELAY_MS = 3000
const MAX_RETRIES = 2

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function computeAcwCookie(arg1: string): string {
  const unsboxed = UNSBOX_TABLE.map((i) => arg1[i - 1]).join('')
  let out = ''
  for (let i = 0; i < 40; i += 2) {
    const a = parseInt(unsboxed.slice(i, i + 2), 16)
    const b = parseInt(XOR_KEY.slice(i, i + 2), 16)
    out += (a ^ b).toString(16).padStart(2, '0')
  }
  return `acw_sc__v2=${out}`
}

function extractArg1(html: string): string | null {
  const m = html.match(/var\s+arg1\s*=\s*'([0-9a-fA-F]{40})'/)
  return m ? m[1] : null
}

async function getAcwCookie(targetUrl: string): Promise<string | null> {
  try {
    const resp = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'User-Agent': UA },
      redirect: 'manual',
    })
    const html = await resp.text()
    const arg1 = extractArg1(html)
    if (!arg1) return null
    return computeAcwCookie(arg1)
  } catch {
    return null
  }
}

async function signInWithDynamicCookie(
  upstream: string,
  session: string
): Promise<{ ok: boolean; msg: string }> {
  const signUrl = new URL('/api/user/sign_in', upstream)
  const candidates = [signUrl, new URL('/api/user/self', upstream)]

  let acwCookie: string | null = null
  for (const apiUrl of candidates) {
    const targetUrl = new URL(apiUrl.pathname + apiUrl.search, upstream)
    acwCookie = await getAcwCookie(targetUrl.toString())
    if (acwCookie) break
  }

  if (!acwCookie) {
    return { ok: false, msg: '获取动态 Cookie 失败' }
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let resp: Response
    try {
      resp = await fetch(signUrl.toString(), {
        method: 'POST',
        headers: {
          'User-Agent': UA,
          Cookie: `${acwCookie}; session=${session}`,
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
          Origin: upstream,
          Referer: `${upstream}/`,
        },
        body: '',
      })
    } catch (err) {
      return { ok: false, msg: `请求异常: ${String(err)}` }
    }

    if (resp.status === 401) return { ok: false, msg: 'session 无效(401)' }

    const bodyText = await resp.text().catch(() => '')
    if (!resp.ok) return { ok: false, msg: `HTTP ${resp.status}: ${bodyText}` }

    const arg1 = extractArg1(bodyText)
    if (arg1) {
      if (attempt < MAX_RETRIES) {
        acwCookie = computeAcwCookie(arg1)
        await delay(1000)
        continue
      }
      return { ok: false, msg: '反爬验证重试失败' }
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(bodyText)
    } catch {
      return { ok: false, msg: `响应非JSON: ${bodyText.slice(0, 200)}` }
    }

    const success = data?.success
    const message = String(data?.message || '').trim()

    if (success === true) return { ok: true, msg: message || '今日已签到' }
    if (success === false) return { ok: false, msg: message || `签到失败: ${JSON.stringify(data)}` }
    return { ok: true, msg: `返回: ${JSON.stringify(data)}` }
  }

  return { ok: false, msg: '重试次数耗尽' }
}

async function sendPushPlus(token: string, title: string, content: string): Promise<void> {
  await fetch('http://www.pushplus.plus/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, title, content, template: 'txt' }),
  })
}

export async function runCheckinSingle(db: D1Database, accountId: number): Promise<string> {
  const acct = await getCheckinAccountById(db, accountId)
  if (!acct) return '账户不存在'

  const upstream = acct.upstream_url || 'https://anyrouter.top'
  const { ok, msg } = await signInWithDynamicCookie(upstream, acct.session_cookie)
  const label = acct.label || `#${acct.id}`
  const resultText = ok ? `✅ ${msg}` : `❌ ${msg}`

  await updateCheckinResult(db, acct.id, resultText)
  await writeCheckinLog(db, {
    account_id: acct.id,
    account_label: label,
    success: ok,
    message: msg,
  })

  return `${label}: ${resultText}`
}

export async function runCheckin(db: D1Database): Promise<string> {
  const accounts = await getActiveCheckinAccounts(db)
  if (!accounts.length) return '无活跃签到账户'

  const lines: string[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < accounts.length; i++) {
    if (i > 0) await delay(CHECKIN_DELAY_MS)

    const acct = accounts[i]
    const upstream = acct.upstream_url || 'https://anyrouter.top'
    const { ok, msg } = await signInWithDynamicCookie(upstream, acct.session_cookie)

    const label = acct.label || `#${acct.id}`
    const resultText = ok ? `✅ ${msg}` : `❌ ${msg}`
    lines.push(`${label}: ${resultText}`)

    if (ok) successCount++; else failCount++

    await updateCheckinResult(db, acct.id, resultText)
    await writeCheckinLog(db, {
      account_id: acct.id,
      account_label: label,
      success: ok,
      message: msg,
    })
  }

  const summary = `签到完成: 成功 ${successCount} / 失败 ${failCount} / 共 ${accounts.length}`
  lines.push(summary)
  const fullMessage = lines.join('\n')

  const tokenSetting = await getSetting(db, 'notification.pushplus_token')
  const token = tokenSetting?.value?.trim()
  if (token) {
    await sendPushPlus(token, 'AnyRouter 签到', fullMessage)
  }

  return fullMessage
}
