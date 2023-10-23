const crypto = require("crypto")
const { getSecret } = require("../config/azure-vault")

const Bucket = process.env["S3_BUCKET"]
const region = process.env["S3_BUCKET_REGION"]
const accessKeyId = process.env["S3_BUCKET_USER"]
const secretAccessKey = process.env["S3_BUCKET_USER_KEY"]




const replaceDashWithLowDash = (string) => {
  let strVal = String(string);
  return  strVal?.includes('-')? strVal.replacef("-", "_"):strVal
}


const getEnvVariable = async (variableName, vaultName) => {
  if (process.env.ENVIRONMENT && process.env.ENVIRONMENT === 'DEV')
    return process.env[replaceDashWithLowDash(variableName)];
  return getSecret(variableName, vaultName);
};


const checkIfObjExists = (obj,entry,fallBack=null)=> obj[entry]?obj[entry]:fallBack;


const renderIfExists = (entry,fallBack='')=>entry?entry:fallBack


const linkRegex = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
)


const uuidv4 =() =>
  crypto.randomBytes(32)+
  Math.random().toString(36).substring(2, 15)+ `${Date.now().toString(36)} + `

const stringToBase64Enc = (data) => {
  return Buffer.from(data).toString("base64")
}

const hexStringToBinary  = (s)=>{
  var arr = []
    for (var i = 0; i < s.length; i += 2) {
      var c = s.substr(i, 2);
      arr.push(parseInt(c, 16));
    }
    return String.fromCharCode.apply(null, arr);
}

const maybePluralize = (count, noun, suffix = "s") => `${noun}${count !== 1 ? suffix : ""}`;

const sortPagination = (page,limit=20)=> (page - 1) * limit;

const encryptPrivateKeyWithPIN = (privateKey, pin) => {
  const cipher = crypto.createCipher('aes-256-gcm', pin);
  const encryptedPrivateKey = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedPrivateKey,
    authTag
  };
};

const decryptPrivateKeyWithPIN = (encryptedPrivateKey, authTag, pin) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', pin, authTag);
  const decryptedPrivateKey = Buffer.concat([decipher.update(encryptedPrivateKey), decipher.final()]);

  return decryptedPrivateKey.toString('utf8');
}



module.exports = {
  getEnvVariable,
  checkIfObjExists,
  renderIfExists,
  linkRegex,
  uuidv4,
  stringToBase64Enc,
  hexStringToBinary,
  maybePluralize,
  replaceDashWithLowDash,
  sortPagination,
  encryptPrivateKeyWithPIN,
  decryptPrivateKeyWithPIN
}
