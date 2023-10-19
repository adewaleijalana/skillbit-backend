const { backendURL } = require('../../utils/setEnvs');

const axios = require('axios').default

const triggerNDAEmail = async({contactEmail,name,})=>{
    

    const {ccEmail} = {
        ccEmail:'dyvvoo@gmail.com',
    
    }
 

    let {status,statusText} = await axios.post(endpoint,{
        'appKey':appKey,
        ccEmail,
        name,
        contactEmail,
        origin:backendURL
    })



    console.log('trigger email responses',status,statusText)


}


module.exports = {
    triggerNDAEmail
}