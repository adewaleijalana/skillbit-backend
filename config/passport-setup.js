"use strict"
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const MicrosoftStrategy = require("passport-microsoft").Strategy
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy
const TwitterStrategy = require("@superfaceai/passport-twitter-oauth2")
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const User = require("../models/User")
const { GeneralAuditLog } = require("../controllers/auditController/auditController")
const { renderIfExists } = require("../utils/helpers")
const { backendURL } = require("../utils/setEnvs")
const { handleCreateUser } = require("../controllers/authController")


const initializePassport = ()=>{

  // Serialize User
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  // Deserialize User
  passport.deserializeUser((id, done) => {
    done(null, id)
  })

  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: `${backendURL}${process.env['GOOGLE_CALLBACK_URL']}`,
        proxy: true,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let user
          let { state } = req?.query
          if (state) {
            user = profile
          } else {
            await User.findOne({ tenantId: profile?.id }).then(
              async (userProfile) => {
                if (userProfile) {
                  user = userProfile;
                } else {
                  const avatar = profile?.photos[0]?.value
                  let constructNewUserObj = {
                    provider: "google",
                    tenantId: profile.id,
                    firstName: `${profile.name.givenName}`,
                    lastName: `${profile.name.familyName}`,
                    role: "Guest",
                    googleGmailId: renderIfExists(
                      profile?.emails?.find((email) => email?.verified)?.value
                    ),
                    ...(avatar ? { avatar } : {}),
                  };
                  user = await handleCreateUser({personalData:constructNewUserObj});
                }
              }
            )
          }
          return done(null, user)
        } catch (err) {
          console.log("err at google oauth", err)
        }

        // If user with the email exist
        // if user or email doesn't exist
      }
    )
  )

  // Configure Facebook Strategy
  // passport.use(
  //   new FacebookStrategy(
  //     {
  //       clientID: process.env.FACEBOOK_CLIENT_ID,
  //       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  //       callbackURL: `${process.env.BACKEND_URL}${process.env.FACEBOOK_CALLBACK_URL}`,
  //       profileFields: [
  //         "id",
  //         "displayName",
  //         "photos",
  //         "email",
  //         "first_name",
  //         "last_name",
  //       ],
  //       enableProof: true,
  //     },

  //     async function (accessToken, refreshToken, profile, done) {
  //       const user = profile
  //       return done(null, user)
  //     }
  //   )
  // )

  // Configure LinkedIN Strategy
  
  
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT,
        clientSecret: process.env.LINKEDIN_SECRET,
        callbackURL: `${backendURL}${process.env.LINKEDIN_CALLBACK_URL}`,
        scope: ["r_emailaddress", "r_liteprofile"],
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          console.log("linkedin profile at passport setup", profile)

          profile && done(null, profile)
        } catch (err) {}

        // asynchronous verification, for effect...
      }
    )
  )

  // Configure Microsoft Strategy

  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: `${backendURL}${process.env.MICROSOFT_CALLBACK_URL}`,
        proxy: true,
        scope: ["user.read"],
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        // If user/account exist
        try {
          const oldUser = await User.findOne({ tenantId: profile.id })

          if (oldUser) {
            return done(null, oldUser)
          }
        } catch (err) {
          console.log(err)
        }

        // If user with the email exist
        console.log("microsoft profile", profile)
        try {
          const sameEmail = await User.findOne({
            email: profile.emails[0].value,
          })

          if (sameEmail) {
            return done(null, sameEmail)
          }
        } catch (err) {
          console.log(err)
        }

        // if user or email doesn't exist
        try {
          const newUser = await new User({
            provider: "microsoft",
            tenantId: profile.id,
            microsoftEmailId: profile.emails.length
              ? profile.emails[0].value
              : "none",
            firstName: profile?.name?.givenName,
            lastName: profile?.name?.familyName,
            role: "Guest",
          }).save()
          done(null, newUser)
          GeneralAuditLog({ user: newUser, type: "signup" })
        } catch (err) {
          console.log(err)
        }
      }
    )
  )

  // Configure Twitter Strategy
  passport.use(
    new TwitterStrategy(
      {
        clientID: `${process.env.TWITTER_CLIENT_ID}`,
        clientSecret: `${process.env.TWITTER_CLIENT_SECRET}`,
        callbackURL: `${process.env.BACKEND_URL}/${process.env.TWITTER_CALLBACK_URL}`,
        clientType: "confidential",
      },
      async (accessToken, refreshToken, profile, done) => {
        let user = {}

        try {
          // try to check if the user is already register
          user = await User.findOne({ tenantId: profile?.id })
          if (user) return done(null, user)

          // extract useful data from the Twitter user info
          user = {
            provider: "twitter",
            tenantId: profile.id,
            firstName: profile.username,
            lastName: profile.displayName,
            provider: profile.provider,
            role: "Guest",
            googleGmailId: renderIfExists(
              profile?.emails?.find((email) => email?.verified)?.value
            ),
            avatar: profile.photos[0].value,
          }

          // Save new user information
          user = await new User(user).save()

          return done(null, user)
        } catch (err) {
          console.log("err at twitter auth", err)
        }
      }
    )
  );

  // Configure Azure Identitiy Strategy

  passport.use(new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env['AZURE_TENANT_ID']}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUrl: `${backendURL}/auth/sjultra/callback`,
    responseType: 'code',
    responseMode: 'form_post',
    allowHttpForRedirectUrl:true,
    scope:['email','profile'],
    validateIssuer: false, // In production, validate the issuer

  }, async function(iss, sub, profile, accessToken, refreshToken, done) {

    let emailFromProfile = profile?._json?.email;

    let user = profile

    // if (!user){
    //   let userRow = await googleSpreadSheet(emailFromProfile);

    //   console.log('comparison',userRow,fieldsByColumn)

    //   let userObjConstruct = {
    //   };

    //   userRow?.map((cell,index)=>{
    //     let fieldNameOnRow = fieldsByColumn[index]
    //     if(fieldNameOnRow){
    //       userObjConstruct[fieldNameOnRow] = cell
    //     }
    //   })
   
    //   try{
    //     user = await new User({
    //       ...userObjConstruct,
    //       daysPerWeek:parseInt(userObjConstruct['daysPerWeek']?.split(0)),
    //       hoursPerDay:parseInt(userObjConstruct['hoursPerDay']?.split(0)),
    //       onboarding:{
    //         status:'Completed',
    //         ndaSent:true,
    //         ndaSigned:true,
    //         profileSetup:true,
    //       }
    //     }).save()   
    //   }   
    //   catch(err){
    //     console.log('err creating new user',err)
    //   }
      
    //   console.log('user created',user);
    // }

    return done(null,user);
    // Authentication logic here
  }));

}

module.exports  = initializePassport

