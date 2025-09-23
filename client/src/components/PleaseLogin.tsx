import ButtonLink from "../ui/ButtonLink";
function PleaseLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back!</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Please log in to access your profile or join us to get started.
          </p>
        </div>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <ButtonLink to="/login" variant="primary" fullWidth className="py-3 text-base sm:text-lg">
            Login Now
          </ButtonLink>
          <ButtonLink
            to="/signup"
            variant="outline"
            fullWidth
            className="py-3 text-base sm:text-lg"
          >
            Join Now
          </ButtonLink>
        </div>
        <p className="text-center text-xs sm:text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default PleaseLogin;
