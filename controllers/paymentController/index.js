const { validationResult } = require("express-validator")
const User = require("../../models/User")
const Profile = require("../../models/User")
const Onboard = require("../../models/Onboard")
const { triggerNDAEmail } = require("./endpoints")
const { controllerValidatorTypes } = require("../../utils/validators")
const { sortPagination } = require("../../utils/helpers")
const { createJMLTicket } = require("../thirdParty/jira")


// @route    GET /onboard/user
// @desc     Get user Onboarding status
// @access   Private/Admin
const getUserOnboardStatus = async (req, res) => {
  try {
    const userOnboardStatus = await Onboard.findOne({
      user: req.params.user,
    })

    if (!userOnboardStatus) {
      return res.status(400).json({
        msg: "No status for this user",
      })
    }

    res.json(userOnboardStatus)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

const createOnboardingPersona = async(req,res)=>{
  try{

    let {contactEmail,name} = req.body;

    let uniqueValuesExist= await controllerValidatorTypes
    .isUnique(Onboard,['contactEmail'],req.body,`is already associated with a different user`)

    if (uniqueValuesExist){
      return res.status(400).json(uniqueValuesExist)
    }

    await triggerNDAEmail({contactEmail,name})

    let newOnboarding = await new Onboard({
      contactEmail,
      status:'In Progress'
    }).save();
    
  
    res.json(newOnboarding)

  }
  catch(err){
    console.error('err at creating new onboarding persona',err?.message)
    res.status(500).send("Server Error")

  }
}

const updateOnboardingPersona = async(req,res)=>{
  try{

    let {contactEmail,name,_id,...rest} = req.body;

    let resend = req?.query['resend']


    if(resend)    await triggerNDAEmail({contactEmail,name})

    let newOnboarding = await Onboard.findByIdAndUpdate({_id},{
      contactEmail,
      name,
      ...rest
    },{new:true});
    
  
    res.json(newOnboarding)

  }
  catch(err){
    console.error('err at updating onboarding persona',err?.message)
    res.status(500).send("Server Error")

  }
}

const getOnboardingPersonas = async(req,res)=>{
  try{

    const size = req?.query['page']
    
    const ongoingOnboarding = await Onboard.find({status:{$ne:'Completed'}}).skip(sortPagination(size)).sort({createdAt:-1})
    
    res.json(ongoingOnboarding);
    
  }
  catch(err){
    console.error('err at fetching ongoing onboarding persona',err?.message)
    res.status(500).send("Server Error")
  }
}

// @route    PUT /onboard
// @desc     Update user Onboarding status
// @access   Private/Admin
const updateOnboardingStatus = async (req, res) => {
  try {

    // If errors, return errors
    const field = req.query['type'];

    const updateQuery = async(fields)=>{
      let newUpdateInstance = await Onboard.findOneAndUpdate(
        { contactEmail: req.body["contactEmail"] },
        fields,
        { new: true }
      )
      return newUpdateInstance;
    };
 
    const updateOnboardingMethods =  {
      'ndaSent':()=>updateQuery({
        ndaSent:true
      }),
      'ndaSigned':async()=>{
        updateQuery({
          ndaSigned:true
        })
      },
      'createJiraIssue':async()=>{
        let jmlIssueStatus = await createJMLTicket(body)
      }
    }



    res.json(onboardStatusToUpdate)
  } catch (error) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

const createCreateMultiSig = async(req,res)=>{
const { BitcoinRPC } = require('bitcoin-rpc');

const rpc = new BitcoinRPC({
  host: 'localhost',
  port: 8332,
  user: 'username',
  password: 'password',
});


// Example usage:

const total_price = 100;
const buyer_public_key = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const seller_public_key = '0x01234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const platform_public_key = '0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef';

const multisig_transaction = await createMultisigTransaction(total_price, buyer_public_key, seller_public_key, platform_public_key);

}

const completeMultiSig = async (req, res) => {
  try {
    // If errors, return errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      })
    }

    // If no errors
    const {
      user,
      role,
      mutualNdaSent,
      mutualNdaSigned,
      emailSetup,
      sendReceiveEmail,
      msTeamsSetup,
    } = req.body

    // Build onboard status object
    const onboardStatusFields = {}
    onboardStatusFields.user = user
    if (role) {
      onboardStatusFields.role = role
    }
    if (mutualNdaSent) onboardStatusFields.mutualNdaSent = mutualNdaSent
    if (mutualNdaSigned) onboardStatusFields.mutualNdaSigned = mutualNdaSigned
    if (emailSetup) onboardStatusFields.emailSetup = emailSetup
    if (sendReceiveEmail)
      onboardStatusFields.sendReceiveEmail = sendReceiveEmail
    if (msTeamsSetup) onboardStatusFields.msTeamsSetup = msTeamsSetup

    // Update role for user, profile and onboard collection
    const updatedRole = {
      role,
    }

    let userToUpdate = await User.findOne({
      _id: user,
    })

    let profileToUpdate = await Profile.findOne({
      user,
    })

    let onboardStatusToUpdate = await Onboard.findOne({
      user,
    })

    if (!userToUpdate && !profileToUpdate && !onboardStatusToUpdate) {
      return res.status(400).json({
        msg: "User not found",
      })
    }

    userToUpdate = await User.findByIdAndUpdate(
      { _id: user },
      { $set: updatedRole },
      { new: true }
    )

    profileToUpdate = await Profile.findOneAndUpdate(
      { user: user },
      { $set: updatedRole },
      { new: true }
    )

    onboardStatusToUpdate = await Onboard.findOneAndUpdate(
      { user: user },
      { $set: onboardStatusFields },
      { new: true }
    )

    res.json(onboardStatusToUpdate)
  } catch (error) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

module.exports = { completeMultiSig,getOnboardingPersonas,updateOnboardingPersona }
