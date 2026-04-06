import { Link } from 'react-router-dom';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

const VideoSolutions = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Admin Panel
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <PlayCircle className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Video Solutions</h1>
            <p className="text-slate-500 text-sm">Manage video solutions for problems</p>
          </div>
        </div>

        <div className="auth-card rounded-2xl p-8 text-center">
          <p className="text-slate-500">Video solutions management interface will be built here.</p>
        </div>
      </main>
    </div>
  );
};

export default VideoSolutions;
