const { body } = require("express-validator")
const mongoose = require("mongoose")


const linkRegex = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
)

const isObjectId = (req, res, next) => {
  try {
    const user = req.body["_id"]

    if (mongoose.Types.ObjectId.isValid(user)) {
      next()
    } else {
      res.status(401).json({ msg: "User does not exist" })
    }
  } catch (err) {
    console.log("err at verifying id", err)
    res.status(500).send("Server Error")
  }
}

const isLink = (arr = [], canNull = true) =>arr.map((entry) => body(entry, "Enter a valid link").matches(linkRegex))

const modelValidatorTypes = {
  exists:(fieldName,fieldLabel=false)=>{
    let label = fieldLabel?fieldLabel:fieldName;

    return {
      validator: async function(value) {
        const user = await this.constructor.findOne({ [fieldName]: value });
        return !user;
      },
      message: props => `${label} ${props.value} is already registered.`

     }
  },

  isValidLink:(fieldName)=>{
    return {
      validator: function(value) {
        const user = value.matches(linkRegex);
        return !user;
      },
      message: () => `${fieldName} must be a valid link`

     }
  },


  

}

const controllerValidatorTypes = {
  
  isUnique:async(model,uniqueFieldsArr,body,msgFormat=false)=>{    

    const filterByFieldParams = uniqueFieldsArr?.filter(entry=>body[entry]).map((fieldVal) => {
      return({
        [fieldVal]: body[fieldVal]
      })
    });

    let uniqueValueExists = await model.findOne({ $or: [...filterByFieldParams],_id:{$ne:body['_id']} })

    let err;
    
    if (uniqueValueExists) {
      let payloadHolder = {};
      for (const key of uniqueFieldsArr) {
        if (
         body[key] && (uniqueValueExists[key] === body[key])
        ) {
          payloadHolder[key] = `${key} ${msgFormat ||'already exists for a different user'}`
        }
      }
      console.log('payload holder',payloadHolder)
      err=payloadHolder
    }

    return err

  },
  isRequired:(requiredFieldsArr)=>{
    
    let errObj = requiredFieldsArr.map(entry=>
      body(entry?.key,`${entry?.label} is required`).not().isEmpty()
    )
    return errObj
  }

  
}

const transformErrorPayload = (errPayload)=>{
  let errorObj = {

  }
  errPayload.map(entry=>{
    errorObj[`${entry?.param}`] = entry?.msg
  })

  return errorObj
}

module.exports = {
  isLink,
  isObjectId,
  transformErrorPayload,
  modelValidatorTypes,
  controllerValidatorTypes,
}
