import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
const MaskotImg = '/images/maskot.png'

const LandingHeader: React.FC = () => (
  <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <Link to="/" className="flex items-center gap-2">
        <img
          src={MaskotImg}
          className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-semibold">
        </img>
        <span className="text-xl font-semibold text-gray-800 dark:text-white">Proskladai</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Возможности</Link>
        <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Цены</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Войти
        </Link>
        <Button asChild size="sm">
          <Link to="/register">Начать бесплатно</Link>
        </Button>
      </div>
    </div>
  </header>
);

export default LandingHeader;