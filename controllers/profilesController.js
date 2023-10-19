const { validationResult } = require("express-validator")
const { schemaBuild, fetchAndReturnJson } = require("../middleware/schema")
const Profile = require("../models/User")
const Onboard = require("../models/Onboard")
const mongoose = require("mongoose")
const { GeneralAuditLog } = require("./auditController/auditController")
const {
  // uploadImgToS3,
  // s3UploadImg,
} = require("../utils/helpers")
const { controllerValidatorTypes, transformErrorPayload } = require("../utils/validators")

// @route    GET /profile/me
// @desc     Get current user profile
// @access   Private

const profileFieldsArr = [
  "firstName",
  "lastName",
  "alias",
  "skypeId",
  "googleGmailId",
  "appleEmailId",
  "phone",
  "timeZoneUrl",
  "daysPerWeek",
  "hoursPerDay",
  "localCurrencyUrl",
  "femSlackProfileUrl",
  "startDate",
  "paymentProfileUrl",
  "githubProfileUrl",
  "githubProfileUrl",
  "linkedinProfileUrl",
  "calendlyProfileUrl",
  "email1",
  "email2",
]

const uniqueFieldsArr = [
  "alias",
  "skypeId",
  "googleGmailId",
  "appleEmailId",
  "phone",
  "timeZoneUrl",
  "githubProfileUrl",
  "linkedinProfileUrl",
  "calendlyProfileUrl",
  "sjultraEmail",
  "vzxyEmail",
]

const requiredProfileFields  =[
  {key:'firstName',label:'First name'},
  {key:'alias',label:'Alias'},
  {key:'lastName',label:'Last name'},
  {key:'googleGmailId',label:'Google email'},
  {key:'phone',label:'Phone number'},
  // {key:'startDate',label:'Start date'},
  {key:'daysPerWeek',label:'Days per week'},
  {key:'hoursPerDay',label:'Hours per day'},


]

const getCurrentUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.user.id)


    if (!profile) {
      return res.status(400).json({
        msg: "There is no profile for this user",
      })
    }

    res.status(201).json(profile)
  } catch (err) {
    console.log("err at fetching me", err)
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

// @route    POST /profiles
// @desc     Create user profile
// @access   Private
const onboardUser = async (req, res) => {
  // If errors, return errors
  const errors = validationResult(req)
  let errorsArr = errors.array().filter((err) => err.value)

  if (errorsArr.length) {
    return res.status(400).json(transformErrorPayload(errors.array()))
  }

  let body = req.body
  
  controllerValidatorTypes.isUnique(Profile,uniqueFieldsArr,body,res)

  let profileFields = schemaBuild(body, profileFieldsArr)

  let device = req.headers["deviceinfo"]
  
  let deviceData = (device && JSON.parse(device)) || {}

  try {
    //find User profile
    await Profile.findOne({
      _id: req.user.id,
    }).then(async (profile) => {
      // update profile if profile exists
      if (profile) {
        const profileResponse = {
          ...profileFields,
          onboarding:{
            ...profile?.onboarding,
            profileSetup: true,
          }
        }

    

        await Profile.updateOne(
          { _id: req.user.id },
          {
            ...profileFields,
            'profile.profileSetup': true,
          },
          { new: true },
          (error) => {
     
            if (error) {
              return res.status(500).json({
                error,
              })
            }
     
            GeneralAuditLog({
              user: profile,
              deviceData,
              type: "profile-setup",
            })

            return res.json(profileResponse)
          }
        )
      } else {
        // return unauthorized if error doesn't exist
        return res.status(401).json({ msg: "This profile does not exist" })
      }
    })
  } catch (err) {
    console.error("error at user profile", err)
    res.status(500).send("Server Error")
  }
}

// @route    PUT /profiles
// @desc     Update user profile
// @access   Private
const updateUserProfile = async (req, res) => {
  let body = req.body

  // If errors, return errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(transformErrorPayload(errors.array()))
  }

  //validate against unique field(check if field value exists on another account for unique fields) 
  let uniqueValuesExist = await controllerValidatorTypes.isUnique(Profile,uniqueFieldsArr,body)

  if (uniqueValuesExist) {
    return res.status(400).json(uniqueValuesExist)
  }

  // use schemaBuild to remove unwanted fields
  let profileFields = schemaBuild(req.body, profileFieldsArr)

  try {
    // Update profile
    const profile = await Profile.findOneAndUpdate(
      {
        _id: req.user.id,
      },
      { $set: profileFields },
      { new: true }
    )

    if (profile) {
      return res.json(profile)
    } else {
      return res.status(401).json({ msg: "This profile does not exist" })
    }
  } catch (err) {
    console.error("err at update profile", err.message)
    res.status(500).send("Server Error")
  }
}

// @route    GET /profiles
// @desc     Get all profiles
// @access   Public
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({})

    if (!profiles) {
      return res.status(400).json({
        msg: "Profiles not found",
      })
    }

    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

// @route    PUT /profiles
// @desc     Disable/enable user profile
const enableDisableUser = async (req, res) => {
  // If errors, return errors

  try {
    await Profile.findById(req.body._id).then(async (profile) => {
      if (profile) {
        await Profile.updateOne(
          { _id: req.body._id },
          {
            isSuspended: !profile?.isSuspended,
          },
          (error) => {
            if (error)
              return res.status(500).json({
                error,
              })
            else {
              return res.status(200).json({
                status: "success",
                msg: `User account ${
                  !profile?.isSuspended ? "suspended" : "enabled"
                } successfully`,
              })
            }
          }
        )
      } else {
        return res.status(401).json({
          status: "error",
          msg: "This profile does not exist",
        })
      }
    })
  } catch (err) {
    console.error("error at disabling profile", err)
    return res.status(500).send("Server Error")
  }
}

const getUserProfile = async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      let fetch = await Promise.all([
        Profile.findById(req.user.id),
        Profile.findById(req.params.id),
      ])
      let onboard
      console.log("fetch role", fetch[0])

      if (fetch[0]?.role === "Admin") {
        onboard = await Onboard.findOne({ user: req.params.id }).then(
          async (onboardProfile) => {
            if (onboardProfile) {
              return onboardProfile
            } else {
              const createNew = await new Onboard({
                user: req.params.id,
              }).save()

              console.log("create new", createNew)
              return createNew
            }
          }
        )
      }

      fetchAndReturnJson(fetch[1], res, ["User profile"])

      console.log("final profile", fetch[1])

      return res.json({
        profile: fetch[1],
        ...(onboard ? { onboard: onboard } : {}),
      })
    } else {
      return res.status(400).json({
        msg: "User id not valid",
      })
    }
  } catch (err) {
    console.log("err at fetching", err)
  }
}

const updateRole = async (req, res) => {
  try {
    let user = await Profile.findOneAndUpdate(
      { _id: req.body["_id"] },
      { role: req.body["role"] },
      { new: true }
    )
    return res.json(user)
  } catch (err) {
    return res.status(500).send("500")
  }
}

module.exports = {
  getCurrentUserProfile,
  onboardUser,
  updateUserProfile,
  getAllProfiles,
  getUserProfile,
  enableDisableUser,
  updateRole,
  requiredProfileFields
}
