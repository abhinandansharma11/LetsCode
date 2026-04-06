import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2, PlayCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const AdminCard = ({ icon: Icon, title, description, onClick, variant = 'default' }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);

    // Glare effect
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  };

  const isDestructive = variant === 'destructive';

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`admin-card group relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ease-out overflow-hidden ${
        isDestructive
          ? 'border-red-200 hover:border-red-300'
          : 'border-amber-100 hover:border-amber-300'
      }`}
      style={{ transform }}
    >
      {/* Glare overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
        style={glareStyle}
      />

      {/* Content */}
      <div className="relative z-10">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
            isDestructive
              ? 'bg-red-50 border border-red-100'
              : 'bg-amber-50 border border-amber-100'
          }`}
        >
          <Icon
            className={`w-7 h-7 ${
              isDestructive ? 'text-red-500' : 'text-amber-500'
            }`}
          />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>

        <div
          className={`mt-4 inline-flex items-center text-sm font-semibold transition-all duration-300 group-hover:translate-x-1 ${
            isDestructive ? 'text-red-500' : 'text-amber-500'
          }`}
        >
          Open
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
          isDestructive
            ? 'bg-gradient-to-br from-red-50/50 to-transparent'
            : 'bg-gradient-to-br from-amber-50/50 to-transparent'
        }`}
      />
    </div>
  );
};

const AdminPanel = () => {
  const navigate = useNavigate();

  const adminActions = [
    {
      icon: PlusCircle,
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      path: '/admin/create-problem',
      variant: 'default',
    },
    {
      icon: Pencil,
      title: 'Update Problem',
      description: 'Edit or update an existing problem',
      path: '/admin/update-problem',
      variant: 'default',
    },
    {
      icon: Trash2,
      title: 'Delete Problem',
      description: 'Remove a problem from the platform',
      path: '/admin/delete-problem',
      variant: 'destructive',
    },
    {
      icon: PlayCircle,
      title: 'Video Solutions',
      description: 'Manage video solutions for problems',
      path: '/admin/video-solutions',
      variant: 'default',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Problems
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-500">Manage problems and content</p>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {adminActions.map((action) => (
            <AdminCard
              key={action.path}
              icon={action.icon}
              title={action.title}
              description={action.description}
              variant={action.variant}
              onClick={() => navigate(action.path)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
