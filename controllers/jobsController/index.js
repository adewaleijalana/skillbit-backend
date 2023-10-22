
const Applications = require('../../models/Applications');
const Jobs = require('../../models/Jobs')

const createJob  = async(req,res)=>{
    try{

        let newJob = await new Jobs({
            title:'Bitcoin Designer to design a Bitcoin Wallet with full functional prototype',
            description:'We are seeking a talented UX/UI designer to join our team and help us complete our business event marketplace. The designer will be responsible for creating visually appealing and user-friendly interfaces and experiences for our platform. The ideal candidate should have a strong understanding of UX/UI principles and be able to apply them to solve complex design challenges. Excellent communication skills and the ability to collaborate with cross-functional teams are essential. Familiarity with design tools such as Sketch, Adobe XD, or Figma is required. Experience designing for marketplaces or similar platforms is a plus.',
            hours:50,
            skills:['Figma','Prototyping','Brand Design'],
            owner:'43943983495495495',
            payment:0.0005,
            duration:60
        }).save();

        res.json(newJob)
    }
    catch(err){
        console.log('an error occured')
    }
}

const getJobs = async(req,res)=>{
    try{

        let jobSearch = await Jobs.find({})

        res.json(jobSearch)

    }
    catch(err){
        console.log('err in finding jobs');

        res.status(500).json({
            error:'Oops an error occured'
        })
    }
}


const acceptApplication = async(req,res)=>{
    try{
        let {jobId} = req?.body;
        let jobSearch = await Jobs.findOneAndUpdate({_id:jobId},
            {},
            {new:true}
        )

    }
    catch(err){
        console.log('err in accept application');

        res.status(500).json({
            error:'Oops an error occured'
        })

    }
}


const applyForJob = async(req,res)=>{
    try{

        let jobSearch = await new Applications({
            job:req?.jobId,
            applicant:req?.userId
        }).save()

        res.json(jobSearch);

    }
    catch(err){
        console.log('err in finding jobs')
    }
    
}

module.exports = {
    createJob,
    getJobs,
    applyForJob
}