// Bills script

// Require
const {
  requestFactory,
  scrape,
  saveBills,
  log
} = require('cozy-konnector-libs')
const moment = require('moment')
const { amountFrom } = require('./pdf')

// Request (Cheerio)
const request = requestFactory({
  // debug: true,
  cheerio: true,
  json: false,
  jar: true
})

// Bills function
async function bills(urlList, folderPath, urlBase) {
  let $ = await request(urlList)

  log('info', 'Parsing bills')
  const bills = await parseBills($, urlBase)

  log('debug', bills)

  log('info', 'Saving bills to Cozy')
  await saveBills(bills, folderPath, {
    identifiers: ['atmb'],
    contentType: 'application/pdf'
  })
}

function parseBills($, urlBase) {
  const scrapedBills = scrape(
    $,
    {
      fileurl: {
        sel: 'td:nth-child(3) a',
        fn: $a => {
          if ($a.length > 0) {
            return (
              urlBase +
              $a
                .attr('onclick')
                .substring(14, $a.attr('onclick').indexOf("'); return false;"))
            )
          }
          return '' // return without generate error if have no bill for date tested
        }
      },
      idFacture: {
        sel: 'td:nth-child(3) span'
      } /*
      amount: {
        sel: 'td:nth-child(3)',
        parse: amount => parseFloat(amount.replace(' €', '').replace(',', '.'))
      },*/,
      date: {
        sel: 'td:nth-child(3) a',
        fn: $a => {
          if ($a.length > 0) {
            return $a.attr('onclick').substring(35, 35 + 6)
          }
          return '190001' // return without generate error if have no bill for date tested
        },
        parse: date => moment(date, 'YYYYMM')
      }
    },
    '#dnn_ctr436_ViewATMB_Factures_pHaveFactures table.titre3 tr'
  )

  // keep only months with bills
  const bills = scrapedBills.filter(bill => bill.idFacture !== '')

  // get amount from pdf
  log('info', 'Get amounts from PDF')
  const billsWithAmount = bills.map(bill => amountFrom(bill))

  // waiting every amount
  return Promise.all(billsWithAmount).then(bills => {
    // return listing of bills
    return bills.map(bill => ({
      ...bill,
      vendor: 'atmb',
      currency: 'EUR',
      filename: `${bill.date.format('YYYY-MM')}-${String(bill.amount).replace(
        '.',
        ','
      )}€-${String(bill.idFacture)}.pdf`,
      date: bill.date.toDate()
    }))
  })
}

module.exports = {
  bills
}
