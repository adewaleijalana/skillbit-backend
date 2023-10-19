const { GoogleSpreadsheet } = require("google-spreadsheet")

const fieldsByColumn = [
  'alias',
  'firstName',
  'lastName',
  'onboarding.status',
  'onboarding.ndaSigned',
  'country',
  '',
  'onboarding.jmlIssue',
  'skype.id',
  'googleGmailId',
  'apple.id',
  'phone',
  'timezone',
  'daysPerWeek',
  'hoursPerDay',
  'keybase',
  'localCurrency',
  'femSlack.profileUrl',
  'startDate',
  'calendlyProfileUrl',
  'ruulProfileUrl',
  'twitterProfileUrl',
  'facebookProfileUrl',
  'githubProfileUrl',
  'linkedinProfileUrl',
  'role',
  '',
  '',
  'sjultraEmail',
  'vzxyEmail'
]

const googleSpreadSheet = async (email) => {
  let row ;
  try{

    const sheet = new GoogleSpreadsheet(
      process.env['GOOGLE_SHEET_URL']
    )

    await sheet.useServiceAccountAuth({
      private_key: process.env["GOOGLE_SERVICE_ACC_PK"]?.replace(/\\n/g, "\n"),
      client_email: process.env["GOOGLE_SERVICE_ACC_EMAIL"],
    })

    await sheet.loadInfo()

      
    const sheet1 = sheet?.sheetsByTitle["Mailboxes"]

    const rows = await sheet1.getRows()


    for (const iterator of rows) {
      if (iterator?._rawData?.includes(email)){
        row = iterator?._rawData;
        break
      }
    }
  }
  catch(err){
    console.log('error fetching row',err)
  }
  return row


}


module.exports = {
  googleSpreadSheet,
  fieldsByColumn
}
