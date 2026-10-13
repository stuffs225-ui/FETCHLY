// node server/cli.js reset a|b    → forget that person's code (they choose a new one on next entry)
import { resetPassword } from './auth.js'

const [cmd, arg] = process.argv.slice(2)

if (cmd === 'reset' && (arg === 'a' || arg === 'b')) {
  await resetPassword(arg)
  console.log(`Code for ${arg.toUpperCase()} cleared — they will choose a new one the next time they enter.`)
} else {
  console.log('Usage: node server/cli.js reset <a|b>')
}
process.exit(0)
