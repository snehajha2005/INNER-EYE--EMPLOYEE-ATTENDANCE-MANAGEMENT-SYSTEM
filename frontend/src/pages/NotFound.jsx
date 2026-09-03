import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mt-4">
          Uh-oh!
        </p>
        <p className="mt-4 text-gray-500">We can't find that page.</p>
        <div className="mt-6">
          <Link
            to="/login"
            className="btn-primary inline-flex items-center"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
