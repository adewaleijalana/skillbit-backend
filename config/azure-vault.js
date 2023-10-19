const { ClientSecretCredential } = require("@azure/identity")

const { SecretClient } = require("@azure/keyvault-secrets")

const { gitHubClientIDName, gitHubClientSecretName } = require("../utils/setEnvs")


const getSecret = async (secretName,shouldReturn=false) => {
  
  let nodeEnv = process.env['NODE_ENV']

  let kv = process.env['KV_NAME']

  let keyVaultName = kv

  console.log('parsed secret',secretName,kv)

  //REPLACE ALL UNDERSCORE VALUES(_) IN KEY VAULT NAMES WITH HYPHYENS(-) IN CODE
  let parsedSecretName = secretName?.includes('_')?secretName.replaceAll('_','-'):secretName


  if (!secretName || !kv) {
    throw Error("getSecret: Required params missing")
  }
  let tenantId = process.env.AZURE_TENANT_ID
  let clientId = process.env.MICROSOFT_CLIENT_ID 
  let clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  if (
    !tenantId ||
    !clientId ||
    !clientSecret
  ) {
    throw Error("KeyVault cannot use DefaultAzureCredential")
  }


  const credential = new ClientSecretCredential(tenantId,clientId,clientSecret)

  // Build the URL to reach your key vault
  const url = `https://${keyVaultName}.vault.azure.net`;

  try {
    // Create client to connect to service
    const client = new SecretClient(url, credential)
     

    // Get secret Obj
    const latestSecret = await client.getSecret(parsedSecretName).then(secretObject=>{    
      return secretObject.value
    })
    // Return value
    // return latestSecret
    // console.log('latest secret acquired',latestSecret)
    if (shouldReturn) return latestSecret
    else{
      process.env[secretName] = latestSecret

    }

  } catch (ex) {

    console.log('error caught, get secret',ex)
    throw ex
  }
}
console.log('github id and secret',)

const loadEnvSecrets = async()=>{

  let secretNames = [
    'GOOGLE_CALLBACK_URL','JWT_SECRET','MONGO_URI','JWT_SECRET','BACKEND_URL',
    'LINKEDIN_CLIENT','LINKEDIN_SECRET','LINKEDIN_CALLBACK_URL','GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET','GITHUB_CALLBACK_URL','JIRA_PAT',gitHubClientIDName,gitHubClientSecretName,
    'JIRA_DOMAIN','ADO_PAT','AZURE_API','TWITTER_CLIENT_ID','TWITTER_CLIENT_SECRET',
    'TWITTER_CALLBACK_URL','DATADOG_API_KEY','MICROSOFT_CLIENT_ID','SPLUNK_INSTANCE',
    'MICROSOFT_CLIENT_SECRET','MICROSOFT_CALLBACK_URL','FRONTEND_URL','SPLUNK_TOKEN',
    'GOOGLE_SERVICE_ACC_EMAIL','GOOGLE_SERVICE_ACC_PK','GOOGLE_SHEET_URL'
  ]
  !process.env['MICROSOFT_CALLBACK_URL'] && await Promise.all(secretNames.map(secret=>getSecret(secret)))
}

module.exports = {
  getSecret,
  loadEnvSecrets
}
