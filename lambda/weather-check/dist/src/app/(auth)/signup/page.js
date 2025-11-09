"use strict";
/**
 * @fileoverview Signup/Registration page component
 * @module app/(auth)/signup/page
 */
'use client';
/**
 * @fileoverview Signup/Registration page component
 * @module app/(auth)/signup/page
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SignupPage;
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const trpc_1 = require("@/lib/trpc");
const link_1 = __importDefault(require("next/link"));
/**
 * Signup page component
 *
 * @returns Rendered signup page
 */
function SignupPage() {
    const router = (0, navigation_1.useRouter)();
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [confirmPassword, setConfirmPassword] = (0, react_1.useState)('');
    const [name, setName] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const signup = trpc_1.trpc.users.register.useMutation({
        onSuccess: () => {
            // Redirect to login page with success message
            router.push('/login?registered=true');
        },
        onError: (err) => {
            setError(err.message || 'Failed to create account. Please try again.');
        },
    });
    /**
     * Handle form submission
     *
     * @param e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Client-side validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        signup.mutate({
            email,
            password,
            name: name || undefined,
        });
    };
    return (<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your SkyShift account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Weather Cancellation & AI Rescheduling
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (<div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>)}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="Full Name (optional)"/>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="Email address"/>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="Password (min. 8 characters)"/>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="Confirm Password"/>
            </div>
          </div>

          <div>
            <button type="submit" disabled={signup.isPending} className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {signup.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <link_1.default href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </link_1.default>
            </p>
          </div>
        </form>
      </div>
    </div>);
}
