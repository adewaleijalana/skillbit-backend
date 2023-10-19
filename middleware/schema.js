//ensure all
const schemaBuild = (body, profileFieldsArr) => {
  const profileFields = {}

  for (const key in body) {
    if (profileFieldsArr.includes(key) && body[key] ) {
      profileFields[key] = body[key]
    }
  }

  return profileFields
}

const fetchAndReturnJson = (object, res, errorArr) => {
  if (!object) {
    return res.status(400).json({
      msg: `${errorArr[0]} ${errorArr?.length > 1 ? errorArr[1] : "not found"}`,
    })
  }
}

module.exports = {
  schemaBuild,
  fetchAndReturnJson,
}
