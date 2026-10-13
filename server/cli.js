// node server/cli.js links        → print the two private links (uses DATABASE_URL, or the local dev database)
// node server/cli.js reset a|b    → forget that person's password (they choose a new one on next open)
import { config, resetPassword } from './auth.js'

const [cmd, arg] = process.argv.slice(2)
const base = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '')

if (cmd === 'links') {
  const { tokens } = await config()
  console.log(`A (her): ${base}/?k=${tokens.a}`)
  console.log(`B (him): ${base}/?k=${tokens.b}`)
} else if (cmd === 'reset' && (arg === 'a' || arg === 'b')) {
  await resetPassword(arg)
  console.log(`Password for ${arg.toUpperCase()} cleared — they will choose a new one the next time they open their link.`)
} else {
  console.log('Usage: node server/cli.js links | reset <a|b>')
}
process.exit(0)
