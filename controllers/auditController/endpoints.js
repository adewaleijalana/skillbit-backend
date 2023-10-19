const { backendURL } = require("../../utils/setEnvs")
const axios = require("axios").default
const { createLogger, format, transports } = require('winston');


const dataDogLogger = ()=>{
    
    const httpTransportOptions = {
        host: 'http-intake.logs.datadoghq.com',
        path: `/api/v2/logs?dd-api-key=${process.env['DATADOG_API_KEY']}&ddsource=nodejs&service=peepsDB&host=${backendURL}`,
        ssl: true
      };
      
    return createLogger({
        level: 'info',
        exitOnError: false,
        format: format.json(),
        transports: [
            new transports.Http(httpTransportOptions),
        ],
    })

};

const LogToSplunk = async (payload) => {
  try {
    console.log("protocol", backendURL)

    let auditpayload = {
      host: backendURL,
      index: "peepsdb-http-index",
      sourcetype: "web",
      source: "peepsdb",
      event: [payload],
    }

    const req = await axios.post(
      process.env["SPLUNK_INSTANCE"] + "services/collector",
      JSON.stringify(auditpayload),
      {
        headers: {
          Authorization: `Splunk ${process.env["SPLUNK_TOKEN"]}`,
        },
      }
    )

    const { data } = req

    // console.log('successful response at',payload?.type,data);
  } catch (err) {
    console.log("err at log to splunk", err?.response?.data || err)
  }
}

module.exports = {
  LogToSplunk,
  dataDogLogger
}
