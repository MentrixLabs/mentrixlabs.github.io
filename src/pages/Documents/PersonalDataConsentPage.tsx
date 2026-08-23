// src/pages/Documents/PersonalDataConsentPage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // импортируйте ваш компонент Button, если он нужен
import termsMarkdown from './md_texts/consent.md?raw';

const PersonalDataConsentPage: React.FC = () => {
  return (
    <>
      {/* Шапка (Header) */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-semibold text-lg shadow-md">
              P
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Proskladai
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Возможности
            </Link>
            <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Цены
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Войти
            </Link>
            <Button asChild size="sm" className="hover:text-white text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md shadow-blue-500/20 transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/5 active:scale-98">
              <Link to="/register" className="hover:text-white">Начать бесплатно</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент документа */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 sm:p-8 md:p-12 transition-all duration-300">
            <div className="prose prose-lg max-w-none prose-slate dark:prose-invert
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h1:text-4xl prose-h1:font-extrabold prose-h1:tracking-tight prose-h1:mb-6
              prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-700 dark:prose-h2:text-blue-400
              prose-h3:text-xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-blue-500
              prose-li:leading-relaxed
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
            ">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                    >
                      {children}
                    </a>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 space-y-1">{children}</ul>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
                  ),
                }}
              >
                {termsMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalDataConsentPage;