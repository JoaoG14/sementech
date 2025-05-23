export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent you an email with a link to verify your account. Please check
          your inbox and follow the instructions.
        </p>
      </div>
    </div>
  );
}
