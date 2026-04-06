const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo")

const createProblem = async (req,res)=>{

  console.log("createProblem called with:", {
    title: req.body.title,
    difficulty: req.body.difficulty,
    tags: req.body.tags,
    referenceSolutionCount: req.body.referenceSolution?.length,
    visibleTestCasesCount: req.body.visibleTestCases?.length,
    hiddenTestCasesCount: req.body.hiddenTestCases?.length,
    userId: req.result?._id
  });

  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution,codeWrapper
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required" });
    }
    if (!description || !description.trim()) {
        return res.status(400).json({ message: "Description is required" });
    }
    if (!referenceSolution || !Array.isArray(referenceSolution) || referenceSolution.length === 0) {
        return res.status(400).json({ message: "Reference solution is required" });
    }
    if (!visibleTestCases || !Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
        return res.status(400).json({ message: "Visible test cases are required" });
    }
    if (!hiddenTestCases || !Array.isArray(hiddenTestCases) || hiddenTestCases.length === 0) {
        return res.status(400).json({ message: "Hidden test cases are required" });
    }
    if (!startCode || !Array.isArray(startCode) || startCode.length === 0) {
        return res.status(400).json({ message: "Starter code is required" });
    }

    try{

      for(const {language,completeCode} of referenceSolution){

        if (!language || !completeCode) {
            return res.status(400).json({ message: "Reference solution must have language and code" });
        }

        const languageId = getLanguageById(language);

        if (!languageId) {
            return res.status(400).json({ message: `Language "${language}" is not supported` });
        }

        // Validate visible test cases have input and output
        const validVisibleTestCases = visibleTestCases.filter(tc => tc.input && tc.output);
        if (validVisibleTestCases.length === 0) {
            return res.status(400).json({ message: "All visible test cases must have input and output" });
        }

        // I am creating Batch submission
        const submissions = validVisibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        console.log(`[CreateProblem] Submitting ${submissions.length} test cases to Judge0 for ${language}`);

        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);

        if (!submitResult || !Array.isArray(submitResult)) {
            console.error("[CreateProblem] Judge0 submitBatch error:", submitResult);
            return res.status(400).json({ message: "Failed to submit code to Judge0. Please check your reference solution code." });
        }

        const resultToken = submitResult.map((value)=> value.token);

        console.log(`[CreateProblem] Got tokens, waiting for results...`);

       const testResult = await submitToken(resultToken);

       console.log(`[CreateProblem] Test results:`, testResult);

       for(let i = 0; i < testResult.length; i++) {
        const test = testResult[i];
        console.log(`[CreateProblem] Test case ${i+1}: status_id=${test.status_id} (description=${test.status?.description || 'N/A'})`);
        if(test.status_id != 3){
         console.error(`[CreateProblem] Test case ${i+1} failed:`, test);
         return res.status(400).json({ 
            message: `Reference solution failed test case ${i+1}. Status: ${test.status?.description || 'Unknown error'}. Error: ${test.compile_error || test.stderr || 'N/A'}` 
         });
        }
       }

      }


      // We can store it in our DB

    const userProblem =  await Problem.create({
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        codeWrapper: codeWrapper || [],
        problemCreator: req.result._id
      });

      res.status(201).json({ message: "Problem created successfully", problem: userProblem });
    }
    catch(err){
        console.error("[CreateProblem] Catch block error:", err.message || err);
        console.error("[CreateProblem] Full error:", err);
        res.status(400).json({ message: err.message || "Failed to create problem. Check server logs." });
    }
}

const updateProblem = async (req,res)=>{
    
  const {id} = req.params;
  const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, codeWrapper, problemCreator
   } = req.body;

  try{

     if(!id){
      return res.status(400).send("Missing ID Field");
     }

    const DsaProblem =  await Problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).send("ID is not persent in server");
    }
      
    for(const {language,completeCode} of referenceSolution){
         

      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);
        
      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
          source_code:completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));


      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value)=> value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
     const testResult = await submitToken(resultToken);

    //  console.log(testResult);

     for(const test of testResult){
      if(test.status_id!=3){
       return res.status(400).send("Error Occured");
      }
     }

    }


  const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
  res.status(200).send(newProblem);
  }
  catch(err){
      res.status(500).send("Error: "+err);
  }
}

const deleteProblem = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

   const deletedProblem = await Problem.findByIdAndDelete(id);

   if(!deletedProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send("Successfully Deleted");
  }
  catch(err){
     
    res.status(500).send("Error: "+err);
  }
}


const getProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution codeWrapper');
   
    // video ka jo bhi url wagera le aao

   if(!getProblem)
    return res.status(404).send("Problem is Missing");

   const videos = await SolutionVideo.findOne({problemId:id});

   if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }
    
   res.status(200).send(getProblem);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async(req,res)=>{

  try{
     
    const getProblem = await Problem.find({}).select('_id title difficulty tags');

   if(getProblem.length==0)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}


const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const submittedProblem = async(req,res)=>{

  try{
     
    const userId = req.result._id;
    const problemId = req.params.pid;

   const ans = await Submission.find({userId,problemId});
  
  if(ans.length==0)
    res.status(200).send("No Submission is persent");

  res.status(200).send(ans);

  }
  catch(err){
     res.status(500).send("Internal Server Error");
  }
}



module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};


