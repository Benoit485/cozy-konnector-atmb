// PDF Reader script

// Require
const { requestFactory, log } = require('cozy-konnector-libs')
const pdf2json = require('pdf2json')

// Request
const request = requestFactory({
  // debug: true,
  cheerio: false,
  json: false,
  jar: true
})

// Get amount from pdf
function amountFrom(bill) {
  const url = bill.fileurl

  return new Promise(async (resolve, reject) => {
    let pdfParser = new pdf2json(this, 1)

    let pdfPipe = await request(url).pipe(pdfParser)

    pdfPipe.on('pdfParser_dataError', errData => {
      log('error', errData.parserError)

      reject(errData.parserError)
    })

    pdfPipe.on('pdfParser_dataReady', () => {
      const text = pdfParser.getRawTextContent()

      const match = text.match('Montant TTC facture(.+) €')

      const amount = parseFloat(match[1])

      log('info', `Amount for ${url} : ${amount} €`)

      resolve({ ...bill, amount })
    })
  })
}

module.exports = {
  amountFrom
}
