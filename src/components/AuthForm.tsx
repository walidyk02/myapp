import React from 'react';
import { Code2 } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (e: React.FormEvent) => Promise<void>;
  onSignUp: (e: React.FormEvent) => Promise<void>;
  error: string;
}

export function AuthForm({ onSignIn, onSignUp, error }: AuthFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-md mx-auto">
        <header className="flex items-center gap-3 mb-12">
          <Code2 className="w-10 h-10 text-blue-400" />
          <h1 className="text-3xl font-bold">Script Generator AI</h1>
        </header>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Sign In</h2>
          <form onSubmit={onSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
            >
              Sign In
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                const form = e.currentTarget.closest('form');
                if (form) onSignUp(new Event('submit') as any);
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Don't have an account? Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}