import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Eye, EyeOff, Code, Braces, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { createProblem } from '../../api/problemApi';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TAG_OPTIONS = [
  { value: 'array', label: 'Array' },
  { value: 'string', label: 'String' },
  { value: 'hash-table', label: 'Hash Table' },
  { value: 'dynamic-programming', label: 'Dynamic Programming' },
  { value: 'math', label: 'Math' },
  { value: 'sorting', label: 'Sorting' },
  { value: 'greedy', label: 'Greedy' },
  { value: 'depth-first-search', label: 'Depth First Search' },
  { value: 'binary-search', label: 'Binary Search' },
  { value: 'breadth-first-search', label: 'Breadth First Search' },
  { value: 'tree', label: 'Tree' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'two-pointers', label: 'Two Pointers' },
  { value: 'bit-manipulation', label: 'Bit Manipulation' },
  { value: 'stack', label: 'Stack' },
  { value: 'graph', label: 'Graph' },
  { value: 'heap', label: 'Heap' },
  { value: 'sliding-window', label: 'Sliding Window' },
  { value: 'backtracking', label: 'Backtracking' },
  { value: 'linked-list', label: 'Linked List' },
  { value: 'recursion', label: 'Recursion' },
  { value: 'divide-and-conquer', label: 'Divide and Conquer' },
  { value: 'queue', label: 'Queue' },
];

const LANGUAGE_OPTIONS = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
];

const CreateProblem = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: 'array',
    visibleTestCases: [{ input: '', output: '', explanation: '' }],
    hiddenTestCases: [{ input: '', output: '' }],
    startCode: [{ language: 'cpp', initialCode: '' }],
    referenceSolution: [{ language: 'cpp', completeCode: '' }],
    codeWrapper: [{ language: 'cpp', wrapperCode: '' }],
  });

  // Basic field handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Visible Test Cases
  const addVisibleTestCase = () => {
    setFormData(prev => ({
      ...prev,
      visibleTestCases: [...prev.visibleTestCases, { input: '', output: '', explanation: '' }],
    }));
  };

  const removeVisibleTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      visibleTestCases: prev.visibleTestCases.filter((_, i) => i !== index),
    }));
  };

  const updateVisibleTestCase = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      visibleTestCases: prev.visibleTestCases.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  // Hidden Test Cases
  const addHiddenTestCase = () => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: [...prev.hiddenTestCases, { input: '', output: '' }],
    }));
  };

  const removeHiddenTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: prev.hiddenTestCases.filter((_, i) => i !== index),
    }));
  };

  const updateHiddenTestCase = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: prev.hiddenTestCases.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  // Starter Code
  const addStarterCode = () => {
    setFormData(prev => ({
      ...prev,
      startCode: [...prev.startCode, { language: 'cpp', initialCode: '' }],
    }));
  };

  const removeStarterCode = (index) => {
    setFormData(prev => ({
      ...prev,
      startCode: prev.startCode.filter((_, i) => i !== index),
    }));
  };

  const updateStarterCode = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      startCode: prev.startCode.map((sc, i) =>
        i === index ? { ...sc, [field]: value } : sc
      ),
    }));
  };

  // Reference Solution
  const addReferenceSolution = () => {
    setFormData(prev => ({
      ...prev,
      referenceSolution: [...prev.referenceSolution, { language: 'cpp', completeCode: '' }],
    }));
  };

  const removeReferenceSolution = (index) => {
    setFormData(prev => ({
      ...prev,
      referenceSolution: prev.referenceSolution.filter((_, i) => i !== index),
    }));
  };

  const updateReferenceSolution = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      referenceSolution: prev.referenceSolution.map((rs, i) =>
        i === index ? { ...rs, [field]: value } : rs
      ),
    }));
  };

  // Code Wrapper
  const addCodeWrapper = () => {
    setFormData(prev => ({
      ...prev,
      codeWrapper: [...prev.codeWrapper, { language: 'cpp', wrapperCode: '' }],
    }));
  };

  const removeCodeWrapper = (index) => {
    setFormData(prev => ({
      ...prev,
      codeWrapper: prev.codeWrapper.filter((_, i) => i !== index),
    }));
  };

  const updateCodeWrapper = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      codeWrapper: prev.codeWrapper.map((cw, i) =>
        i === index ? { ...cw, [field]: value } : cw
      ),
    }));
  };

  // Validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }

    const hasValidVisibleTestCase = formData.visibleTestCases.some(
      tc => tc.input.trim() && tc.output.trim()
    );
    if (!hasValidVisibleTestCase) {
      toast.error('At least one visible test case with input and output is required');
      return false;
    }

    const hasValidHiddenTestCase = formData.hiddenTestCases.some(
      tc => tc.input.trim() && tc.output.trim()
    );
    if (!hasValidHiddenTestCase) {
      toast.error('At least one hidden test case with input and output is required');
      return false;
    }

    const hasValidStarterCode = formData.startCode.some(
      sc => sc.initialCode.trim()
    );
    if (!hasValidStarterCode) {
      toast.error('At least one starter code entry is required');
      return false;
    }

    const hasValidReferenceSolution = formData.referenceSolution.some(
      rs => rs.completeCode.trim()
    );
    if (!hasValidReferenceSolution) {
      toast.error('At least one reference solution is required');
      return false;
    }

    return true;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createProblem(formData);
      toast.success('Problem created successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Create problem error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to create problem';
      console.error('Error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Navbar />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/admin"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to Admin Panel
        </Link>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <PlusCircle className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Create Problem</h1>
            <p className="text-slate-500 text-sm mt-0.5">Add a new coding problem to the platform</p>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <FileText className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-800">Basic Information</h2>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Two Sum"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the problem in detail..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  style={{ minHeight: '150px' }}
                />
              </div>

              {/* Difficulty + Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                  >
                    {DIFFICULTY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tag</label>
                  <select
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                  >
                    {TAG_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Visible Test Cases */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-800">Visible Test Cases</h2>
              </div>
              <button
                type="button"
                onClick={addVisibleTestCase}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {formData.visibleTestCases.map((tc, index) => (
                <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">Test Case {index + 1}</span>
                    {formData.visibleTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVisibleTestCase(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Input</label>
                      <textarea
                        value={tc.input}
                        onChange={(e) => updateVisibleTestCase(index, 'input', e.target.value)}
                        placeholder="Enter input..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Output</label>
                      <textarea
                        value={tc.output}
                        onChange={(e) => updateVisibleTestCase(index, 'output', e.target.value)}
                        placeholder="Expected output..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Explanation</label>
                    <textarea
                      value={tc.explanation}
                      onChange={(e) => updateVisibleTestCase(index, 'explanation', e.target.value)}
                      placeholder="Explain how the output is derived..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Hidden Test Cases */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <EyeOff className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-800">Hidden Test Cases</h2>
              </div>
              <button
                type="button"
                onClick={addHiddenTestCase}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {formData.hiddenTestCases.map((tc, index) => (
                <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">Test Case {index + 1}</span>
                    {formData.hiddenTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHiddenTestCase(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Input</label>
                      <textarea
                        value={tc.input}
                        onChange={(e) => updateHiddenTestCase(index, 'input', e.target.value)}
                        placeholder="Enter input..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Output</label>
                      <textarea
                        value={tc.output}
                        onChange={(e) => updateHiddenTestCase(index, 'output', e.target.value)}
                        placeholder="Expected output..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Starter Code */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Code className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-800">Starter Code</h2>
              </div>
              <button
                type="button"
                onClick={addStarterCode}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Language
              </button>
            </div>

            <div className="space-y-4">
              {formData.startCode.map((sc, index) => (
                <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <select
                      value={sc.language}
                      onChange={(e) => updateStarterCode(index, 'language', e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                    >
                      {LANGUAGE_OPTIONS.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                    {formData.startCode.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStarterCode(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={sc.initialCode}
                    onChange={(e) => updateStarterCode(index, 'initialCode', e.target.value)}
                    placeholder="// Write starter code template here..."
                    rows={8}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Reference Solution */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Code className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-800">Reference Solution</h2>
              </div>
              <button
                type="button"
                onClick={addReferenceSolution}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Language
              </button>
            </div>

            <div className="space-y-4">
              {formData.referenceSolution.map((rs, index) => (
                <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <select
                      value={rs.language}
                      onChange={(e) => updateReferenceSolution(index, 'language', e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                    >
                      {LANGUAGE_OPTIONS.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                    {formData.referenceSolution.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReferenceSolution(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={rs.completeCode}
                    onChange={(e) => updateReferenceSolution(index, 'completeCode', e.target.value)}
                    placeholder="// Write complete reference solution here..."
                    rows={10}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Code Wrapper */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Braces className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-800">Code Wrapper</h2>
              </div>
              <button
                type="button"
                onClick={addCodeWrapper}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Language
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Define how user's solution class gets wrapped into a complete runnable program. Use <code className="bg-slate-100 px-1 rounded">{'{USER_CODE}'}</code> as placeholder.
            </p>

            <div className="space-y-4">
              {formData.codeWrapper.map((cw, index) => (
                <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <select
                      value={cw.language}
                      onChange={(e) => updateCodeWrapper(index, 'language', e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                    >
                      {LANGUAGE_OPTIONS.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                    {formData.codeWrapper.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCodeWrapper(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={cw.wrapperCode}
                    onChange={(e) => updateCodeWrapper(index, 'wrapperCode', e.target.value)}
                    placeholder={`#include<bits/stdc++.h>\nusing namespace std;\n{USER_CODE}\nint main(){\n  // read input and call Solution\n}`}
                    rows={12}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-5 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Create Problem
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProblem;
