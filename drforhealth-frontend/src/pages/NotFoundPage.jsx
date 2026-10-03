import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-6xl font-extrabold bg-brand-gradient bg-clip-text text-transparent mb-4">
        404
      </h1>
      <p className="text-charcoal/60 mb-8">This page doesn't exist. Let's get you back on track.</p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
