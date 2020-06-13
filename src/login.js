// Authenticate script

// Require
const { signin } = require('cozy-konnector-libs')

// Authenticate function
async function authenticate(url, username, password) {
  // Use signin from cozy-konnector-libs
  await signin({
    url, // login url
    formSelector: 'form',
    formData: {
      // input name : input content
      dnn$ctr369$ViewATMB_Login$txtUsername: username,
      dnn$ctr369$ViewATMB_Login$txtPassword: password,
      dnn$ctr369$ViewATMB_Login$cmdLogin: 'Se connecter'
    },
    validate: (statusCode, $) => {
      const textWhenConnected = 'D&#xE9;connexion'
      if (!$.html().includes(textWhenConnected)) {
        return false
      } else {
        return true
      }
    }
  })
}

module.exports = {
  authenticate
}
