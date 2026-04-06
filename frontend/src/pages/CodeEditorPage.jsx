import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft, RotateCcw, Check, X, Play, Send, Loader2, Clock, User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getProblemById } from '../api/problemApi';
import { runCode, submitCode, getSubmissionHistory } from '../api/submissionApi';

const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-emerald-500', text: 'text-white' },
  medium: { bg: 'bg-amber-500', text: 'text-white' },
  hard: { bg: 'bg-red-500', text: 'text-white' },
};

const LANGUAGE_MAP = {
  cpp: 'cpp',
  java: 'java',
  python: 'python',
  javascript: 'javascript',
};

const CodeEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeTestTab, setActiveTestTab] = useState('case-0');
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSolved = user?.problemSolved?.includes(id);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await getProblemById(id);
        const problemData = res.data;
        setProblem(problemData);
        if (problemData.startCode && problemData.startCode.length > 0) {
          const defaultLang = problemData.startCode[0].language;
          setSelectedLanguage(defaultLang);
          setCode(problemData.startCode[0].initialCode || '');
        }
      } catch (error) {
        console.error('Failed to fetch problem:', error);
        toast.error('Failed to load problem');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, id]);

  function timeAgo(date) {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    const starterCode = problem?.startCode?.find((s) => s.language === lang);
    setCode(starterCode?.initialCode || '');
    setRunResults(null);
    setSubmitResult(null);
  };

  const handleResetCode = () => {
    const starterCode = problem?.startCode?.find((s) => s.language === selectedLanguage);
    setCode(starterCode?.initialCode || '');
    setRunResults(null);
    setSubmitResult(null);
    toast.success('Code reset to initial');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    try {
      setIsRunning(true);
      setRunResults(null);
      setSubmitResult(null);
      const res = await runCode(id, { code, language: selectedLanguage }) ;
      setRunResults(res.data);
    } catch (error) {
      console.error('Run code failed:', error);
      toast.error(error.response?.data || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmitResult(null);
      setRunResults(null);
      setActiveTestTab('case-0');
      const res = await submitCode(id, { code, language: selectedLanguage });
      setSubmitResult(res.data);
      setActiveTestTab('result');
      if (res.data.accepted) {
        toast.success('All test cases passed!');
      }
      fetchSubmissions();
    } catch (error) {
      console.error('Submit code failed:', error);
      toast.error(error.response?.data || 'Failed to submit code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const res = await getSubmissionHistory(id);
      setSubmissions(res.data);
    } catch (err) {
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen bg-[#f0f4f8] flex items-center justify-center">
        <p className="text-slate-600">Problem not found</p>
      </div>
    );
  }

  const difficultyLevel = problem.difficulty?.toLowerCase() || 'easy';
  const colors = DIFFICULTY_COLORS[difficultyLevel] || DIFFICULTY_COLORS.easy;

  return (
    <div className="h-screen flex flex-col bg-[#f0f4f8]">
      <div className="editor-topbar h-14 flex items-center justify-between px-4 border-b border-slate-200">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Problems</span>
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-slate-800 hidden sm:block">{problem.title}</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${colors.bg} ${colors.text}`}>
            {problem.difficulty || 'Easy'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user?.name || user?.firstName || 'User'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={45} minSize={25} className="h-full">
            <div className="h-full overflow-y-auto editor-left-panel p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-800">{problem.title}</h2>
                  {isSolved && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      <Check className="w-3 h-3" />
                      Solved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${colors.bg} ${colors.text}`}>
                    {problem.difficulty || 'Easy'}
                  </span>
                  {problem.tags && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium capitalize">
                      {problem.tags}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 border-b border-slate-200 mb-6">
                {['description', 'submissions', 'video'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors relative cursor-pointer ${
                      activeTab === tab ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div className="prose prose-slate prose-sm max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                  {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((testCase, index) => (
                        <div key={index} className="example-block rounded-lg p-4 bg-slate-50 border-l-4 border-amber-400">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">Example {index + 1}</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-slate-500">Input:</span>
                              <pre className="mt-1 p-2 bg-white rounded text-sm font-mono text-slate-800 overflow-x-auto">{testCase.input}</pre>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-500">Output:</span>
                              <pre className="mt-1 p-2 bg-white rounded text-sm font-mono text-slate-800 overflow-x-auto">{testCase.output}</pre>
                            </div>
                            {testCase.explanation && (
                              <div>
                                <span className="text-xs font-medium text-slate-500">Explanation:</span>
                                <p className="mt-1 text-sm text-slate-600">{testCase.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="py-4">
                  {submissionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-3" />
                      <p className="text-sm font-medium">Loading submissions...</p>
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Clock className="w-12 h-12 mb-3" />
                      <p className="text-sm font-medium">No submissions yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600">
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Language</th>
                            <th className="px-4 py-2">Runtime</th>
                            <th className="px-4 py-2">Memory</th>
                            <th className="px-4 py-2">Tests</th>
                            <th className="px-4 py-2">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map((sub) => (
                            <tr
                              key={sub._id}
                              className="border-b border-slate-200 cursor-pointer hover:bg-amber-50 transition-colors group"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                console.log("Clicked submission:", sub);
                                console.log("sub.code:", sub.code);
                                if (sub.code) {
                                  setCode(sub.code);
                                  setSelectedLanguage(sub.language);
                                  setActiveTab('description');
                                  toast.success('Code loaded from submission');
                                } else {
                                  toast.error('Code not available for this submission');
                                }
                              }}
                            >
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                                  ${sub.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                    sub.status === 'wrong' ? 'bg-red-100 text-red-600' :
                                    sub.status === 'runtime_error' ? 'bg-red-100 text-red-600' :
                                    sub.status === 'compilation_error' ? 'bg-orange-100 text-orange-600' :
                                    sub.status === 'time_limit_exceeded' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-200 text-slate-600'}`}>
                                  {sub.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-xs">
                                  {sub.language}
                                </span>
                              </td>
                              <td className="px-4 py-2">{sub.runtime?.toFixed(2) || 0} ms</td>
                              <td className="px-4 py-2">{sub.memory || 0} KB</td>
                              <td className="px-4 py-2">{sub.testCasesPassed}/{sub.totalTestCases}</td>
                              <td className="px-4 py-2 flex items-center gap-2">
                                {timeAgo(sub.createdAt)}
                                <span className="text-slate-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  ← load
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'video' && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mb-3" />
                  <p className="text-sm font-medium">Coming soon</p>
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle>
            <div style={{ width: "4px", height: "100%", background: "#374151", cursor: "col-resize" }} />
          </PanelResizeHandle>

          <Panel defaultSize={55} minSize={30} className="h-full">
            <div className="h-full flex flex-col bg-[#1e1e1e]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-1.5 rounded bg-[#3c3c3c] text-white text-sm border border-[#4a4a4a] focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {problem.startCode?.map((sc) => (
                    <option key={sc.language} value={sc.language}>
                      {sc.language === 'cpp' ? 'C++' : sc.language.charAt(0).toUpperCase() + sc.language.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-slate-300 hover:text-white hover:bg-[#3c3c3c] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset Code</span>
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={LANGUAGE_MAP[selectedLanguage] || 'javascript'}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    tabSize: 2,
                    automaticLayout: true,
                    padding: { top: 16 },
                  }}
                />
              </div>

              <div className="h-50 bg-[#252526] border-t border-[#3c3c3c] flex flex-col">
                <div className="flex items-center gap-1 px-4 py-2 border-b border-[#3c3c3c]">
                  {problem.visibleTestCases?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => { setActiveTestCase(index); setActiveTestTab(`case-${index}`); }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors relative cursor-pointer ${
                        activeTestTab === `case-${index}` ? 'text-white bg-[#3c3c3c]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Case {index + 1}
                      {runResults?.testCases?.[index] && (
                        <span className="ml-1.5">
                          {runResults.testCases[index].status_id === 3
                            ? <Check className="w-3 h-3 inline text-emerald-400" />
                            : <X className="w-3 h-3 inline text-red-400" />}
                        </span>
                      )}
                    </button>
                  ))}
                  {submitResult && (
                    <button
                      onClick={() => setActiveTestTab('result')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        activeTestTab === 'result' ? 'text-white bg-[#3c3c3c]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Result
                      <span className={`w-2 h-2 rounded-full ${submitResult.accepted ? 'bg-[#00b8a3]' : 'bg-[#ef4444]'}`} />
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {activeTestTab === 'result' && submitResult && (
                    <div>
                      {submitResult.status === 'accepted' ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-[#00b8a3]">
                            <Check className="w-6 h-6" />
                            <span className="text-xl font-bold">✓ Accepted</span>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1 p-3 bg-[#23272b] rounded-lg text-center">
                              <div className="text-white font-semibold">{submitResult.runtime?.toFixed(2) || 0} ms</div>
                              <div className="text-xs text-slate-400 mt-1">Runtime</div>
                            </div>
                            <div className="flex-1 p-3 bg-[#23272b] rounded-lg text-center">
                              <div className="text-white font-semibold">{submitResult.memory || 0} KB</div>
                              <div className="text-xs text-slate-400 mt-1">Memory</div>
                            </div>
                            <div className="flex-1 p-3 bg-[#23272b] rounded-lg text-center">
                              <div className="text-white font-semibold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div>
                              <div className="text-xs text-slate-400 mt-1">Tests</div>
                            </div>
                          </div>
                        </div>
                      ) : submitResult.status === 'wrong' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[#ef4444]">
                            <X className="w-6 h-6" />
                            <span className="text-xl font-bold">✗ Wrong Answer</span>
                          </div>
                          <div className="text-sm text-slate-400">{submitResult.passedTestCases}/{submitResult.totalTestCases} test cases passed</div>
                          {submitResult.failedTestCase && (
                            <div className="space-y-2">
                              <span className="text-xs font-medium text-slate-400 block">Test Case #{submitResult.failedTestCase.testCaseNumber}</span>
                              <div>
                                <span className="text-xs font-medium text-slate-400 block mb-1">Input</span>
                                <pre className="p-2 bg-[#23272b] rounded text-sm font-mono text-slate-200 overflow-x-auto">{submitResult.failedTestCase.input}</pre>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-slate-400 block mb-1">Expected</span>
                                <pre className="p-2 bg-[#23272b] rounded text-sm font-mono text-green-300 border-l-4 border-green-500 overflow-x-auto">{submitResult.failedTestCase.expected}</pre>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-slate-400 block mb-1">Got</span>
                                <pre className="p-2 bg-[#23272b] rounded text-sm font-mono text-red-300 border-l-4 border-red-500 overflow-x-auto">{submitResult.failedTestCase.got}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : submitResult.status === 'compilation_error' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-orange-500">
                            <X className="w-6 h-6" />
                            <span className="text-xl font-bold">✗ Compilation Error</span>
                          </div>
                          <pre className="p-3 bg-[#23272b] rounded text-sm font-mono text-red-300 border-2 border-orange-500 overflow-x-auto">
                            {submitResult.failedTestCase?.got || submitResult.errorMessage || 'Compilation error'}
                          </pre>
                        </div>
                      ) : submitResult.status === 'time_limit_exceeded' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-amber-500">
                            <X className="w-6 h-6" />
                            <span className="text-xl font-bold">✗ Time Limit Exceeded</span>
                          </div>
                          <div className="text-xs text-slate-400">Your solution took too long to execute.</div>
                        </div>
                      ) : submitResult.status === 'runtime_error' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-red-500">
                            <X className="w-6 h-6" />
                            <span className="text-xl font-bold">✗ Runtime Error</span>
                          </div>
                          <pre className="p-3 bg-[#23272b] rounded text-sm font-mono text-red-300 border-2 border-red-500 overflow-x-auto">
                            {submitResult.failedTestCase?.got || submitResult.errorMessage || 'Runtime error'}
                          </pre>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <X className="w-6 h-6" />
                          <span className="text-xl font-bold">✗ Error</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTestTab.startsWith('case-') && problem.visibleTestCases?.[activeTestCase] && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-slate-400 mb-1 block">Input</span>
                        <pre className="p-2 bg-[#1e1e1e] rounded text-sm font-mono text-slate-200 overflow-x-auto">
                          {problem.visibleTestCases[activeTestCase].input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-400 mb-1 block">Expected Output</span>
                        <pre className="p-2 bg-[#1e1e1e] rounded text-sm font-mono text-slate-200 overflow-x-auto">
                          {problem.visibleTestCases[activeTestCase].output}
                        </pre>
                      </div>
                      {runResults?.testCases?.[activeTestCase] && (
                        <div className="col-span-2">
                          <span className={`text-xs font-medium mb-1 block ${
                            runResults.testCases[activeTestCase].status_id === 3 ? 'text-emerald-400' : 'text-red-400'
                          }`}>Your Output</span>
                          <pre className={`p-2 rounded text-sm font-mono overflow-x-auto ${
                            runResults.testCases[activeTestCase].status_id === 3
                              ? 'bg-emerald-900/30 text-emerald-300'
                              : 'bg-red-900/30 text-red-300'
                          }`}>
                            {runResults.testCases[activeTestCase].stdout ||
                              runResults.testCases[activeTestCase].stderr || '(no output)'}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-4 py-3 bg-[#1e1e1e] border-t border-[#3c3c3c]">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500 text-amber-500 text-sm font-semibold hover:bg-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run Code
                </button>
                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit
                </button>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default CodeEditorPage;