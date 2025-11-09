"use strict";
/**
 * @fileoverview Login page component
 * @module app/(auth)/login/page
 */
'use client';
/**
 * @fileoverview Login page component
 * @module app/(auth)/login/page
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("next-auth/react");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
const link_1 = __importDefault(require("next/link"));
/**
 * Login page component
 *
 * @returns Rendered login page
 */
function LoginPage() {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const [email, setEmail] = (0, react_2.useState)('');
    const [password, setPassword] = (0, react_2.useState)('');
    const [error, setError] = (0, react_2.useState)('');
    const [success, setSuccess] = (0, react_2.useState)('');
    const [loading, setLoading] = (0, react_2.useState)(false);
    // Check for registration success message
    (0, react_2.useEffect)(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccess('Account created successfully! Please sign in.');
        }
    }, [searchParams]);
    /**
     * Handle form submission
     *
     * @param e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await (0, react_1.signIn)('credentials', {
                email,
                password,
                redirect: false,
            });
            if (result?.error) {
                setError('Invalid email or password');
            }
            else {
                router.push('/dashboard');
                router.refresh();
            }
        }
        catch (err) {
            setError('An error occurred. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to SkyShift
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Weather Cancellation & AI Rescheduling
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {success && (<div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>)}
          {error && (<div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>)}
          <div className="space-y-4 rounded-md shadow-sm">
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
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="Password"/>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <link_1.default href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </link_1.default>
            </p>
          </div>
        </form>
      </div>
    </div>);
}
