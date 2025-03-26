
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { AccessibilityMenu } from '@/components/ui/AccessibilityMenu';
import ReadAloud from '@/components/ui/ReadAloud';
import KeyboardNavigation from '@/components/ui/KeyboardNavigation';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Add KeyboardNavigation component */}
      <KeyboardNavigation />
      
      <header 
        className={`sticky top-0 w-full bg-ishanya-yellow dark:bg-ishanya-yellow/80 py-4 px-4 md:px-8 transition-all duration-300 z-10 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-balance dark:text-gray-900">{t(title) || title}</h1>
            {subtitle && (
              <p className="mt-1 text-gray-700 dark:text-gray-800 max-w-3xl text-balance">{t(subtitle) || subtitle}</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Add ReadAloud component */}
            <ReadAloud />
            <AccessibilityMenu />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
