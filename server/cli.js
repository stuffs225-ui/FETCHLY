// node server/cli.js links        → print the two private links
// node server/cli.js reset a|b    → forget that person's password (they choose a new one on next open)
import 'dotenv/config'
import { linkTokens, resetPassword } from './auth.js'

const [cmd, arg] = process.argv.slice(2)
const base = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '')

if (cmd === 'links') {
  console.log(`A (her): ${base}/?k=${linkTokens.a}`)
  console.log(`B (him): ${base}/?k=${linkTokens.b}`)
} else if (cmd === 'reset' && (arg === 'a' || arg === 'b')) {
  resetPassword(arg)
  console.log(`Password for ${arg.toUpperCase()} cleared — they will choose a new one the next time they open their link.`)
} else {
  console.log('Usage: node server/cli.js links | reset <a|b>')
}
