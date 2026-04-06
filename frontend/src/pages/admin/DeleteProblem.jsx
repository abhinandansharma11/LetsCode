import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { getAllProblems, deleteProblem } from '../../api/problemApi';

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'hard': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4 animate-pulse">
    <div className="flex items-center gap-4 flex-1">
      <div className="w-8 h-5 bg-slate-200 rounded"></div>
      <div className="h-5 bg-slate-200 rounded w-48"></div>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
      <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
      <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
    </div>
  </div>
);

// Delete Confirmation Modal Component
const DeleteModal = ({ isOpen, problem, isDeleting, onClose, onConfirm }) => {
  if (!isOpen || !problem) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 absolute inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 max-w-md w-full">
        {/* Warning Icon */}
        <div className="flex justify-center mb-5">
          <div className="p-4 bg-red-100 rounded-full">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-slate-800 text-center mb-3">
          Delete Problem?
        </h2>

        {/* Problem Title */}
        <p className="text-center text-slate-600 mb-3">
          You are about to delete:
        </p>
        <p className="text-center font-semibold text-amber-600 mb-4">
          "{problem.title}"
        </p>

        {/* Warning Text */}
        <p className="text-sm text-red-500 text-center mb-6 leading-relaxed">
          This action cannot be undone. All test cases, solutions, and data for this problem will be permanently removed.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-5 py-2.5 text-slate-600 font-medium rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteProblem = () => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch problems on mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        console.log('Fetching problems...');
        const response = await getAllProblems();
        console.log('API Response:', response);
        console.log('Response data:', response.data);
        setProblems(response.data || []);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
        console.error('Error response:', error.response);
        // If 404 means no problems exist (not an actual error)
        if (error.response?.status === 404) {
          setProblems([]);
        } else {
          toast.error('Failed to load problems');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // Filter problems based on search
  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open delete confirmation modal
  const handleDeleteClick = (problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setSelectedProblem(null);
    }
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!selectedProblem) return;

    setIsDeleting(true);
    try {
      await deleteProblem(selectedProblem._id);
      toast.success('Problem deleted successfully!');

      // Remove from local state immediately
      setProblems(prev => prev.filter(p => p._id !== selectedProblem._id));

      // Close modal
      setIsModalOpen(false);
      setSelectedProblem(null);
    } catch (error) {
      console.error('Delete problem error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete problem');
      setIsModalOpen(false);
      setSelectedProblem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pb-10 relative">
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
          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Delete Problem</h1>
            <p className="text-slate-500 text-sm mt-0.5">Permanently remove a problem from the platform</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Problem List */}
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton Loading State
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredProblems.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <Trash2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchQuery ? 'No problems found matching your search.' : 'No problems available.'}
              </p>
            </div>
          ) : (
            // Problem Cards
            filteredProblems.map((problem, index) => (
              <div
                key={problem._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:border-red-200 transition-all group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-400 w-8">
                    #{index + 1}
                  </span>
                  <h3 className="text-slate-800 font-medium truncate">
                    {problem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
                    {problem.tags}
                  </span>
                  <button
                    onClick={() => handleDeleteClick(problem)}
                    className="px-4 py-1.5 text-sm font-medium text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        problem={selectedProblem}
        isDeleting={isDeleting}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default DeleteProblem;
