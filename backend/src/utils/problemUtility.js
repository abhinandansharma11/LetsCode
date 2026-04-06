const axios = require("axios");

const HEADERS = {
  "content-type": "application/json",
  "x-rapidapi-host": "judge029.p.rapidapi.com",
  "x-rapidapi-key": process.env.JUDGE0_KEY,
};

// 1. getLanguageById
function getLanguageById(lang) {
  const map = {
    "cpp": 54,
    "c++": 54,
    "java": 62,
    "javascript": 63,
    "python": 71,
  };
  return map[lang.toLowerCase()] || 54;
}

// 2. wrapCode — wraps user's solution class into a complete runnable program
function wrapCode(userCode, language, wrapperCode) {
  // If no wrapper provided, return code as-is
  if (!wrapperCode) {
    return userCode;
  }

  // Check if user code already contains main() — send as-is
  const hasMain = checkIfHasMain(userCode, language);
  if (hasMain) {
    return userCode;
  }

  // Replace {USER_CODE} placeholder with user's code
  return wrapperCode.replace('{USER_CODE}', userCode);
}

// Helper to check if code already has main()
function checkIfHasMain(code, language) {
  const lang = language.toLowerCase();

  if (lang === 'cpp' || lang === 'c++') {
    return /int\s+main\s*\(/.test(code);
  }
  if (lang === 'java') {
    return /public\s+static\s+void\s+main\s*\(/.test(code);
  }
  if (lang === 'python') {
    return /if\s+__name__\s*==\s*['"]__main__['"]\s*:/.test(code) ||
           /def\s+main\s*\(/.test(code);
  }
  if (lang === 'javascript') {
    // For JS, check if there's direct execution code (not just class/function definitions)
    // If code has Solution class without being called, it needs wrapper
    return false; // JS typically needs wrapper for leetcode-style problems
  }

  return false;
}

// 3. submitBatch — with base64 encoding and optional wrapper support
async function submitBatch(submissions, wrapperCode = null) {
  console.log("=== SUBMIT BATCH ===");
  console.log("Number of submissions:", submissions.length);
  console.log("Wrapper provided:", !!wrapperCode);

  // Apply wrapper to each submission if provided
  const processedSubmissions = submissions.map((s, index) => {
    let finalSourceCode = s.source_code;

    // If wrapper is provided and code doesn't have main(), wrap it
    if (wrapperCode) {
      finalSourceCode = wrapCode(s.source_code, s.language || 'cpp', wrapperCode);
      console.log(`Final code after wrapping (first 300 chars):`,
        finalSourceCode?.substring(0, 300));
    }

    console.log(`Submission ${index + 1}:`);
    console.log("  language_id:", s.language_id);
    console.log("  language:", s.language);
    console.log("  source_code (first 200 chars):", finalSourceCode?.substring(0, 200));
    console.log("  stdin:", s.stdin);
    console.log("  expected_output:", s.expected_output);

    return {
      source_code: finalSourceCode,
      language_id: s.language_id,
      stdin: s.stdin,
      expected_output: s.expected_output
    };
  });

  // Base64 encode all text fields
  const encodedSubmissions = processedSubmissions.map(s => ({
    source_code: Buffer.from(s.source_code || '').toString('base64'),
    language_id: s.language_id,
    stdin: Buffer.from(s.stdin || '').toString('base64'),
    expected_output: Buffer.from(s.expected_output || '').toString('base64')
  }));

  console.log("Sending to CodeArena (base64):", JSON.stringify({
    submissions: processedSubmissions.map(s => ({
      language_id: s.language_id,
      source_code: s.source_code?.substring(0, 100),
      stdin: s.stdin?.substring(0, 50),
      expected_output: s.expected_output?.substring(0, 50)
    }))
  }, null, 2));

  try {
    const response = await axios.post(
      "https://judge029.p.rapidapi.com/submissions/batch?base64_encoded=true",
      { submissions: encodedSubmissions },
      { headers: HEADERS }
    );
    console.log("CodeArena submitBatch response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log("CodeArena error status:", error.response?.status);
    console.log("CodeArena error data:", JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

// 3. submitToken — with polling + base64 decoding
async function submitToken(tokens) {
  // tokens is an array of token strings (extracted by controller)
  const tokenString = tokens.join(",");
  console.log("=== SUBMIT TOKEN ===");
  console.log("Tokens:", tokenString);

  let attempts = 0;
  const maxAttempts = 15; // max 30 seconds wait (15 attempts * 2s)

  while (true) {
    attempts++;

    const response = await axios.get(
      `https://judge029.p.rapidapi.com/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=*`,
      { headers: HEADERS }
    );

    console.log("=== POLL RESULT (attempt " + attempts + ") ===");
    console.log("Raw response:", JSON.stringify(response.data, null, 2));

    // CodeArena wraps results in "submissions" key
    const results = response.data?.submissions || response.data;

    console.log("CodeArena poll attempt", attempts, ":",
      results.map(r => ({ token: r.token, status_id: r?.status_id ?? r?.status?.id }))
    );

    // Check if all submissions are done (status_id > 2 means not queued/processing)
    const allDone = results.every(r => {
      const statusId = r?.status_id ?? r?.status?.id ?? 0;
      return statusId > 2;
    });

    if (allDone) {
      // Decode base64 fields
      return results.map(r => ({
        ...r,
        status_id: r?.status_id ?? r?.status?.id,
        stdout: r.stdout ? Buffer.from(r.stdout, 'base64').toString('utf-8').trim() : '',
        stderr: r.stderr ? Buffer.from(r.stderr, 'base64').toString('utf-8').trim() : '',
        compile_output: r.compile_output ? Buffer.from(r.compile_output, 'base64').toString('utf-8').trim() : '',
      }));
    }

    if (attempts >= maxAttempts) {
      throw new Error("Code execution timed out. Please try again.");
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

module.exports = { getLanguageById, submitBatch, submitToken, wrapCode };
