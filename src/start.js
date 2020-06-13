// Start script

// Require
const { log } = require('cozy-konnector-libs')
const { authenticate } = require('./login')
const { bills } = require('./bills')

// Urls
const urlBase = 'https://espaceabonnes.atmb.net'
const urlLogin = urlBase + '/Default.aspx?tabid=58&returnurl=%2fdefault.aspx'
const urlBills = urlBase + '/Default.aspx?tabid=56'

// Start function
async function start(fields) {
  log('info', 'Authenticating ...')
  await authenticate(urlLogin, fields.login, fields.password)
  log('info', 'Successfully logged in')

  log('info', 'Fetching the list of bills')
  await bills(urlBills, fields.folderPath, urlBase)
}

module.exports = {
  start
}
