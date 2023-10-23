const Onboard = require("../../models/Onboard")
const { triggerNDAEmail } = require("./endpoints")
const { controllerValidatorTypes } = require("../../utils/validators")
const { sortPagination } = require("../../utils/helpers")
const User = require("../../models/User")

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

const createJob = ()=>{

};

const initiateWidthdrawal = async(req,res)=>{
  try{

    const {password,_id} = req.body;

    const withdrawalQuery = await User.findById(_id,(err,user)=>{
      if(!err){
        
      }
    })


  }
  catch(err){

  }
}

// Example usage:

const total_price = 100;
const buyer_public_key = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const seller_public_key = '0x01234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const platform_public_key = '0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef';



module.exports = { getOnboardingPersonas,updateOnboardingPersona }
