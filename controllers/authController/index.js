"use strict"
const jwt = require("jsonwebtoken")
const User = require("../../models/User")
const Onboarding = require("../../models/Onboard")
const { checkIfObjExists, renderIfExists } = require("../../utils/helpers")
const {
  getGithubAuthToken,
  getLinkedInToken,
  getFacebookToken,
} = require("./endpoints")
const {
  frontendURL,
  backendURL,
} = require("../../utils/setEnvs")
const {
  LogSignIn,
  LogAccountCreation,
} = require("../auditController/auditController")
const audit = require("../../models/Audit")
const { googleSpreadSheet, fieldsByColumn } = require("../../config/google")
const { queriesInTransactions } = require("../../utils/db/transactions")




const jwtSign = (res, user,) => {
  const payload = {
    user: {
      id: user.id,
    },
  }

  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 10 }, (err, token) => {
    if (err) {
      console.log("err at jwtSign", err)
      throw err
    }

    res.cookie("authCookie", `${token}redirectURI${frontendURL}`)

    const redirectURL = frontendURL + `/login?token=${token}&tokenLength=${token.length}`

    // console.log("redirect url", redirectURL)

    res.redirect(redirectURL)
  })
}

const jwtSignAndRedirect = (res,user,excludeSign=false)=>{
  const payload = {
    user: {
      id: user._id,
    },
  }

  const redirectURL = frontendURL 

 
  //set user information to cookie
  res.cookie("profileCookie", JSON.stringify({
    ...excludeSign?{}:{
      token:jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 60*2400 })
    },
    user,
    redirectURL
  }))
  res.redirect('/inapp')

}

const handleCreateUser = async({personalData,shouldOnboard})=>{

  let onboardingId = shouldOnboard? await new Onboarding({
    profileSetup:true,
    status:'Completed',
    contactEmail:personalData?.sjultraEmail,
    ndaSent:true,
    name:`${personalData?.firstName} ${personalData?.lastName}`,
    ndaSigned:true,
    currentStep:6,
  }).save():false


  let newUser  =  await new User({
    ...personalData,
    ...onboardingId?{
      onboarding:onboardingId?._id
    }:{}
  }).save()

  return newUser

}

// Get logged in user
const getLoggedInUser = async (req, res) => {
  try {
    let sign = req.query["sign"]
    console.log('user id',req.user)
    const user = await User.findById(req.user.id).populate([{
      path: "onboarding"}
    ])

    let device = req.headers["deviceinfo"]

    let deviceData = (device && JSON.parse(device)) || {}

    if (sign) {
      await audit
        .findOne({ user: user?._id,type: "signup" })
        .then(async (userProfile) => {
          if (!userProfile) {
            await LogAccountCreation({ user, deviceData })
          } 
          else {
            
            await LogSignIn({
              user,
              deviceData,
            })
          }
        })

      const payload = {
        user: {
          id: user.id,
        },
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 36000 },
        (err, token) => {
          if (err) {
            console.log("err at jwtSign", err)
            throw err
          } else {
            const {
              firstName,
              alias,
              lastName,
              createdAt,
              updatedAt,
              role,
              _id,
              onboarding
            } = user
            console.log('returning res at sign',token)
            res.status(200).json({
              alias,
              firstName,
              lastName,
              createdAt,
              updatedAt,
              role,
              _id,
              token,
              onboarding
            })
          }
        }
      )
    } 
    else {
      const {
        firstName,
        lastName,
        createdAt,
        updatedAt,
        profileSetup,
        alias,
        role,
        _id,
        onboarding
      } = user
      res.status(200).json({
        alias,
        firstName,
        lastName,
        createdAt,
        updatedAt,
        role,
        _id,
        profileSetup,
        onboarding
      })
    }
  } catch (err) {
    console.error("err at get user", err.message)
    res.status(500).send({
      error: "Server Error",
    })
  }
}

// Google callback
const googleAuthCallback = (req, res) => {
  try {
    //  Return the jsonwebtoken
    const isInapp = req.query["state"]

    const profile = req?.user
    let excludeSignIn = false
    if (isInapp) {
      const avatar = profile?.photos[0]?.value
      excludeSignIn = true;
      let payload = {
        email: profile.emails.length ? profile.emails[0].value : "none",
        firstName: `${profile?.name?.givenName}`,
        lastName: `${profile?.name?.familyName}`,
        googleGmailId: renderIfExists(
          profile?.emails?.find((email) => email?.verified)?.value
        ),
        ...(avatar ? { avatar } : {}),
      }
      profile=payload
    }


    jwtSignAndRedirect(res,profile,excludeSignIn)

  } catch (err) {
    console.log("err in google auth callback", err)
    console.error(err.message)
    res.status(500).send("Server error")
  }
}

// Github callback
const githubAuthCallback = async (req, res) => {
  try {
    //  Return the jsonwebtoken
    const code = req.query["code"]

    //Query used to differentiate between sign in and fetching profile from app while signed in
    const path = req.query["path"]

    let profile = await getGithubAuthToken({ code })

    console.log('github user',profile)

    if (profile) {
      if (path === "/") {
        try {
          const { login, html_url } = profile
          let user = await User.findOne({ tenantId: profile.id })
          if (!user) {
            user = await new User({
              provider: "github",
              tenantId: checkIfObjExists(profile, "id"),
              email: checkIfObjExists(profile, "email"),
              username: checkIfObjExists(profile, "login"),
              avatar: checkIfObjExists(profile, "avatar_url"),
              alias: renderIfExists(login),
              githubProfileUrl: renderIfExists(html_url),
            }).save()
          }

          // console.log('host url and origin at github',hostUrl,backendURL, backendURL.includes(hostUrl) )

          jwtSign(res, user, frontendURL)
        } catch (err) {
          console.log("err at fetch user", err)
        }
      } 
      else {
        let cookieVal = encodeURI(JSON.stringify(profile))

        const firstName =
          profile?.name && profile?.name !== "null"
            ? profile?.name?.split(" ")[0]
            : ""

        const lastName =
          profile?.name &&
          profile?.name !== "null" &&
          profile?.name?.split(" ")?.length > 1
            ? profile?.name?.split(" ")[1]
            : ""

        const payload = {
          ...(profile.login ? { alias: profile.login } : {}),
          ...(profile?.avatar_url ? { avatar: profile.avatar_url } : {}),
          ...(lastName ? { lastName } : {}),
          ...(firstName ? { firstName } : {}),
          ...(profile?.twitter_username
            ? { twitterProfileUrl: profile?.twitter_username }
            : {}),
          ...(profile?.html_url ? { githubProfileUrl: profile?.html_url } : {}),
          ...(profile?.email && profile?.email !== "null"
            ? { email: profile?.email }
            : {}),
          provider: "github",
        }

        let profileString = ""
        for (const key in payload) {
          if (Object.hasOwnProperty.call(payload, key)) {
            profileString += `${key}=${payload[key]}&`
          }
        }

        // profileString+`provider=github`

        res.cookie("profileCookie", cookieVal)
        console.log("in app", JSON.parse(decodeURI(cookieVal)))
        res?.redirect(backendURL + `/inapp?${profileString}`)
      }
    } else {
      res.status(500).send(profile)
    }
  } catch (err) {
    console.error("err at github callback", err)
    res.status(500).send("Server error")
  }
}

// Linkedin auth callback
const linkedinAuthCallback = async (req, res) => {
  try {
    const code = req.query["code"]
    let state = req.query["state"]

    console.log("code and state", req.query)

    let profile = await getLinkedInToken(code)

    console.log("linkedinuser", profile)

    const profilePayload = {
      lastName: profile?.localizedLastName,
      firstName: profile?.localizedFirstName,
      avatar: profile?.profilePicture?.displayImage,
      // tenantId:profile?.id,
      provider: "linkedin",
      backendURL,
    }

    if (state === "inapp") {
      let profileString = ""
      for (const key in profilePayload) {
        if (Object.hasOwnProperty.call(profilePayload, key)) {
          profileString += `${key}=${profilePayload[key]}&`
        }
      }
      // profileString+`provider=linkedIn`

      console.log("profileString", profileString)

      res?.redirect(backendURL + `/inapp?${profileString}`)
    } 
   
    else {
      let user = await User.findOne({ tenantId: profilePayload.tenantId })

      if (!user) {
        user = await new User(profilePayload).save()
      }


      jwtSign(res, user)
    }
  } catch (err) {
    console.log("error at linkedinAuthController", err)
  }
}

// Microsoft callback
const microsoftAuthCallback = (req, res) => {
  try {

    let user = req.user

    jwtSign(res, user)
  } catch (err) {
    console.error("err at microsoft auth callback", err)
    res.status(500).send("Server error")
  }
}

const faceBookAuthCallback = async (req, res) => {
  try {
    const code = req.query["code"]

    let state = req.query["state"]

    let getFaceBookUser = await getFacebookToken(code)

    let user = getFaceBookUser.data

    console.log("returned facebook user", user)

    const facebookUser = {
      avatar:
        state === "-inapp"
          ? encodeURIComponent(user?.picture?.data?.url)
          : user?.picture?.data?.url,
      googleGmailId: user?.email,
      firstName: user?.first_name,
      lastName: user?.last_name,
      ...(state === "-inapp" ? {} : { tenantId: user?.id }),
      provider: "facebook",
    }
    if (state === "-inapp") {
      let profileString = ""
      for (const key in facebookUser) {
        profileString += `${key}=${facebookUser[key]}&`
      }

      console.log("profileString", profileString)

      res?.redirect(backendURL + `/inapp?${profileString}`)
    } else {
      let user = await User.findOne({ tenantId: facebookUser.tenantId })

      if (!user) {
        user = await new User(facebookUser).save()
      }

      const originUrl = req["header"]("Referer")

      jwtSign(res, user, originUrl)
    }
  } catch (err) {
    console.log("error at facebook auth callback", err)
    res.status(500).send("Server error")
  }
}

// Github callback
const twitterAuthCallback = async (req, res) => {
  try {
    // create token and redirect user to the dashboard
    jwtSign(res, { id: req.user._id });
  } catch (error) {
    console.log("error at twitter auth callback", err)
    res.status(500).send("Server error")
  };
};

const azureADAuthCallback = async(req,res)=>{
  try{
    // get user object as passed from passport
    let user = req?.user
        
    let isInapp = req.query['state'];
    
    let sjultraEmail = req?.user?._json?.email;



    // access people's spreadsheet and autofill object with existing data on spreadhseet
    let userObjConstruct  = async()=>{
      let userRow = await googleSpreadSheet(sjultraEmail);
      
      let userObjConstruct = {
      };

      userRow?.map((cell,index)=>{
        let fieldNameOnRow = fieldsByColumn[index]
        if(fieldNameOnRow){
          userObjConstruct[fieldNameOnRow] = cell
        }
      })


      return userObjConstruct

    }
    
    //check if user is signing up for the first time by checking for existing account with matching email
    // or is trying to link his account with sjultra account and skip manual data filling via isInapp parameter 
    if(!isInapp){
      
      const {
        firstName,
        alias,
        lastName,
        createdAt,
        updatedAt,
        role,
        _id,
        profileSetup,
        onboarding
      } = await User.findOne({sjultraEmail}) || {};
      

      // check if user account exists and destructure info to be returned as auth object
      user = _id?{
        firstName,
        alias,
        lastName,
        createdAt,
        updatedAt,
        role,
        _id,
        profileSetup,
        onboarding
      }:undefined

      //create new user
      if (!user){
        let personalData = await userObjConstruct()
        try{
          user = await handleCreateUser({
            personalData:{
              ...personalData,
              daysPerWeek:parseInt(personalData['daysPerWeek']?.split(0)),
              hoursPerDay:parseInt(personalData['hoursPerDay']?.split(0)),
              provider:'sjultra',
              tenantId:req?.user?.oid
            },
            shouldOnboard:true
          })
        }   
        catch(err){

          console.log('err creating new user',err)
        }
        
      }
      
    }
    else{
      user = await userObjConstruct()
    }

    jwtSignAndRedirect(res,user,isInapp?true:false)
    

  }
  catch(error){
    console.log("error at azure AD auth callback", error)
    res.status(500).send('Server error')
  }
}

module.exports = {
  handleCreateUser,
  getLoggedInUser,
  googleAuthCallback,
  githubAuthCallback,
  microsoftAuthCallback,
  linkedinAuthCallback,
  faceBookAuthCallback,
  twitterAuthCallback,
  azureADAuthCallback
}
