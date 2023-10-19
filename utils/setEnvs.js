let nodeEnv = process.env['NODE_ENV'];

let appMode = process.env['appMode'] ?process.env['appMode'].toUpperCase():'';

const gitHubClientIDName = `GITHUB${nodeEnv!=='LOCAL'?'':`_LOCAL`}_CLIENT_ID`;

const gitHubClientSecretName = `GITHUB${nodeEnv!=='LOCAL'?'':`_LOCAL`}_CLIENT_SECRET`;

const githubClientID =process.env[gitHubClientIDName]

const githubClientSecret =process.env[gitHubClientSecretName]

const frontendURL = nodeEnv==='LOCAL'?'http://localhost:3000': process.env[`FRONTEND_URL`]

const backendURL = nodeEnv==='LOCAL'? 'http://localhost:5000': process.env[`BACKEND_URL`]

const getFrontEndURL = (hostUrl) =>
  backendURL?.includes(hostUrl)
    ? process.env[`FRONTEND_URL`]
    : process.env["FRONTEND_LOCAL_URL"]

const jiraPAT = Buffer.from(
  `dayvvo@sjultra.com:${process.env.JIRA_PAT}`
).toString("base64")

module.exports = {
  githubClientID,
  githubClientSecret,
  frontendURL,
  backendURL,
  jiraPAT,
  appMode,
  gitHubClientIDName,
  gitHubClientSecretName,
  getFrontEndURL,
}
