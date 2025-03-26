
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { toast } from 'sonner';

const KeyboardNavigation = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    // Check for keyboard navigation in localStorage
    const savedPreference = localStorage.getItem('keyboardNavigationEnabled');
    if (savedPreference === 'true') {
      setIsEnabled(true);
    }
    
    // Set up keyboard event listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle keyboard navigation with Alt+K
      if (e.altKey && e.key === 'k') {
        setIsEnabled(prev => {
          const newState = !prev;
          localStorage.setItem('keyboardNavigationEnabled', String(newState));
          toast.success(
            newState 
              ? (t('accessibility.keyboard_nav_enabled') || 'Keyboard navigation enabled') 
              : (t('accessibility.keyboard_nav_disabled') || 'Keyboard navigation disabled')
          );
          return newState;
        });
        e.preventDefault();
      }
      
      // Only process other keyboard shortcuts if navigation is enabled
      if (!isEnabled) return;
      
      // Handle navigation shortcuts
      switch (e.key) {
        case 'h':
          // Navigate home
          if (e.altKey) {
            window.location.href = '/';
            e.preventDefault();
          }
          break;
          
        case 'b':
          // Go back
          if (e.altKey) {
            window.history.back();
            e.preventDefault();
          }
          break;
          
        case 'f':
          // Focus first interactive element
          if (e.altKey) {
            const firstInteractive = document.querySelector('a, button, input, select, textarea') as HTMLElement;
            if (firstInteractive) {
              firstInteractive.focus();
              e.preventDefault();
            }
          }
          break;
          
        case 'Tab':
          // Enhanced tab navigation - add visual indicator for focused elements
          setTimeout(() => {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement !== document.body) {
              // Add temporary highlight effect
              const originalOutline = (focusedElement as HTMLElement).style.outline;
              (focusedElement as HTMLElement).style.outline = '2px solid #2563eb';
              (focusedElement as HTMLElement).style.outlineOffset = '2px';
              
              setTimeout(() => {
                (focusedElement as HTMLElement).style.outline = originalOutline;
                (focusedElement as HTMLElement).style.outlineOffset = '';
              }, 1000);
            }
          }, 10);
          break;
          
        default:
          break;
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Show initial toast for keyboard navigation if enabled
    if (isEnabled) {
      setTimeout(() => {
        toast.info(
          t('accessibility.keyboard_nav_info') || 
          'Keyboard navigation is active. Press Alt+K to toggle, Alt+H for home, Alt+B to go back, Alt+F to focus first element.'
        );
      }, 1000);
    }
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, t]);
  
  // This component doesn't render anything visible
  return null;
};

export default KeyboardNavigation;
