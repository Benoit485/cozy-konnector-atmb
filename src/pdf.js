// PDF Reader script

// Require
const { requestFactory, log } = require('cozy-konnector-libs')
const pdfjsLib = require('pdfjs-dist/es5/build/pdf.js')

// Request
const request = requestFactory({
  // debug: true,
  cheerio: false,
  json: false,
  jar: true
})

// Get PDF text
async function getText(buffer) {
  const pdf = await pdfjsLib.getDocument(buffer).promise
  const nbPages = pdf.numPages
  const pageTextPromises = []
  for (let idPage = 1; idPage <= nbPages; idPage++) {
    pageTextPromises.push(getTextForPage(pdf, idPage))
  }
  const pageTexts = await Promise.all(pageTextPromises)
  return pageTexts.join(' ')
}

// Get PDF text for page selected
async function getTextForPage(pdf, idPage) {
  const page = await pdf.getPage(idPage)
  const tokenizedText = await page.getTextContent()
  return tokenizedText.items.map(token => token.str).join('')
}

// Get amount from pdf
function amountFrom(bill) {
  const url = bill.fileurl

  return new Promise(async resolve => {
    log('info', `Url : ${url}`, null, 'pdf')

    const pdfBuffer = await request({ url: encodeURI(url), encoding: null })

    getText(pdfBuffer)
      .then(text => {
        const match = text.match('Montant TTC facture(.+) €')
        const amount = parseFloat(match[1])

        log('info', `Amount for ${url} : ${amount} €`, null, 'pdf')

        resolve({ ...bill, amount })
      })
      .catch(err => {
        log(
          'error',
          `Can not get text for ${url} because ${err}, contents : ${pdfBuffer.toString(
            'utf-8'
          )}`,
          null,
          'pdf'
        )
        resolve({ ...bill, amount: 0 })
      })
  })
}

module.exports = {
  amountFrom
}
