import ButtonLink from "../ui/ButtonLink";

// 404 Not Found Page
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-6">
      {/* Error Code */}
      <h1 className="text-7xl font-bold text-primary">404</h1>

      {/* Message */}
      <p className="mt-4 text-lg text-darkGray mb-5">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      {/* CTA Button */}
      <ButtonLink to="/login" variant="outline" fullWidth={false}>
        Go to Home Page
      </ButtonLink>
    </div>
  );
}
