import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getAllProblems, getSolvedProblems } from '../api/problemApi';

const PROBLEMS_PER_PAGE = 12;

const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

const TAG_OPTIONS = ['All Tags', 'array', 'linkedList', 'graph', 'dp'];

const HomePage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [problemSet, setProblemSet] = useState('all'); // 'all' | 'solved'
  const [difficulty, setDifficulty] = useState('all'); // 'all' | 'easy' | 'medium' | 'hard'
  const [selectedTag, setSelectedTag] = useState('All Tags');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          getAllProblems(),
          getSolvedProblems(),
        ]);

        const allProblems = Array.isArray(problemsRes.data) ? problemsRes.data : [];
        setProblems(allProblems);

        // Handle solved problems response
        const solvedData = solvedRes.data;
        if (Array.isArray(solvedData)) {
          const ids = solvedData.map((p) => p._id);
          setSolvedIds(new Set(ids));
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        toast.error('Failed to load problems');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter problems
  const filteredProblems = useMemo(() => {
    let result = [...problems];

    // Filter by problem set (all vs solved)
    if (problemSet === 'solved') {
      result = result.filter((p) => solvedIds.has(p._id));
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
      result = result.filter((p) => p.difficulty?.toLowerCase() === difficulty);
    }

    // Filter by tag
    if (selectedTag !== 'All Tags') {
      result = result.filter((p) => p.tags === selectedTag || p.tags?.includes(selectedTag));
    }

    return result;
  }, [problems, solvedIds, problemSet, difficulty, selectedTag]);

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE);
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
    return filteredProblems.slice(start, start + PROBLEMS_PER_PAGE);
  }, [filteredProblems, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [problemSet, difficulty, selectedTag]);

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Problems</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Filter Bar */}
        <div className="filter-card rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Problem Set Toggle */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setProblemSet('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  problemSet === 'all'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All Problems
              </button>
              <button
                onClick={() => setProblemSet('solved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  problemSet === 'solved'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Solved
              </button>
            </div>

            {/* Difficulty Toggle */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
              {['all', 'easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    difficulty === level
                      ? level === 'all'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : level === 'easy'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : level === 'medium'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Tags Dropdown */}
            <div className="relative">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag === 'All Tags' ? tag : tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Problem List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500">Loading problems...</p>
          </div>
        ) : paginatedProblems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No problems found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Problem Table */}
            <div className="problem-table rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
                <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
                <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</div>
                <div className="col-span-5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</div>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Difficulty</div>
                <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</div>
              </div>

              {/* Table Body */}
              {paginatedProblems.map((problem, index) => {
                const globalIndex = (currentPage - 1) * PROBLEMS_PER_PAGE + index + 1;
                const isSolved = solvedIds.has(problem._id);
                const difficultyLevel = problem.difficulty?.toLowerCase() || 'easy';
                const colors = DIFFICULTY_COLORS[difficultyLevel] || DIFFICULTY_COLORS.easy;

                return (
                  <div
                    key={problem._id}
                    onClick={() => handleProblemClick(problem._id)}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 hover:bg-amber-50/50 cursor-pointer transition-colors group"
                  >
                    {/* Status */}
                    <div className="col-span-1 flex items-center">
                      {isSolved ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                      )}
                    </div>

                    {/* Number */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm text-slate-500">{globalIndex}</span>
                    </div>

                    {/* Title */}
                    <div className="col-span-5 flex items-center">
                      <span className="text-sm font-medium text-slate-800 group-hover:text-amber-600 transition-colors">
                        {problem.title}
                      </span>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2 flex items-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${colors.bg} ${colors.text}`}>
                        {problem.difficulty || 'Easy'}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="col-span-3 flex items-center gap-1.5 flex-wrap">
                      {problem.tags && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                          {problem.tags}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-amber-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
