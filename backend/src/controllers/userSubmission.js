const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility");

const getStatus = (statusId) => {
  switch (statusId) {
    case 3: return "accepted";
    case 4: return "wrong";
    case 5: return "time_limit_exceeded";
    case 6: return "compilation_error";
    case 7:
    case 8:
    case 11: return "runtime_error";
    default: return "error";
  }
};

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    code = code.replace(/^```\w*\n?/, '').replace(/\n?```\s*$/, '');
    if (language === 'cpp') language = 'c++';

    const problem = await Problem.findById(problemId);
    const wrapper = problem.codeWrapper?.find(w => 
      w.language === language || (language === 'c++' && w.language === 'cpp')
    );
    const wrapperCode = wrapper?.wrapperCode || null;

    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      testCasesTotal: problem.hiddenTestCases.length
    });

    const languageId = getLanguageById(language);
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      language: language,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions, wrapperCode);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let statusCounts = {};
    let failedTestCase = null;

    testResult.forEach((result, index) => {
      const statusId = result?.status_id ?? result?.status?.id;
      const statusStr = getStatus(statusId);
      statusCounts[statusStr] = (statusCounts[statusStr] || 0) + 1;
      if (statusStr === 'accepted') {
        testCasesPassed++;
        runtime += parseFloat(result.time);
        memory = Math.max(memory, result.memory);
      } else if (!failedTestCase) {
        failedTestCase = {
          testCaseNumber: index + 1,
          input: problem.hiddenTestCases[index]?.input || "",
          expected: problem.hiddenTestCases[index]?.output || "",
          got: result.stdout || result.stderr || "No output"
        };
      }
    });

    let status = 'accepted';
    let maxCount = 0;
    Object.entries(statusCounts).forEach(([key, val]) => {
      if (key !== 'accepted' && val > maxCount) {
        status = key;
        maxCount = val;
      }
    });

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;
    submittedResult.errorMessage = failedTestCase?.got || '';
    await submittedResult.save();

    if (status === 'accepted' && !req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).json({
      accepted: status === 'accepted',
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      failedTestCase,
      status
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

const getSubmissionHistory = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.problemId;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const totalTestCases = problem.hiddenTestCases.length;

    const submissions = await Submission.find({ userId, problemId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log("First sub code:", submissions[0]?.code?.substring(0, 50));

    const result = submissions.map(sub => ({
      _id: sub._id,
      status: sub.status,
      language: sub.language,
      runtime: sub.runtime,
      memory: sub.memory,
      testCasesPassed: sub.testCasesPassed,
      totalTestCases,
      createdAt: sub.createdAt,
      code: sub.code || null
    }));

    res.json(result);
  } catch (err) {
    console.log("History error:", err);
    res.status(500).json({ message: 'Failed to fetch submission history' });
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    code = code.replace(/^```\w*\n?/, '').replace(/\n?```\s*$/, '');
    if (language === 'cpp') language = 'c++';

    const problem = await Problem.findById(problemId);
    const wrapper = problem.codeWrapper?.find(w => 
      w.language === language || (language === 'c++' && w.language === 'cpp')
    );
    const wrapperCode = wrapper?.wrapperCode || null;

    const languageId = getLanguageById(language);
    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      language: language,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions, wrapperCode);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        status = false;
      }
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory
    });
  } catch (err) {
    console.log("=== RUN CODE ERROR ===", err);
    res.status(500).send("Internal Server Error " + err);
  }
};

module.exports = { submitCode, runCode, getSubmissionHistory };