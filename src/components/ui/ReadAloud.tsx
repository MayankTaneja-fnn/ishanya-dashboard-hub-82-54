
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { toast } from 'sonner';

const ReadAloud = () => {
  const [isReading, setIsReading] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Initialize speech synthesis
    const speechUtterance = new SpeechSynthesisUtterance();
    setUtterance(speechUtterance);

    // Clean up on unmount
    return () => {
      if (speechUtterance && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Update language when it changes
    if (utterance && language) {
      // Map our language codes to BCP 47 language tags
      const langMap: Record<string, string> = {
        'english': 'en-US',
        'hindi': 'hi-IN',
        'kannada': 'kn-IN'
      };
      
      utterance.lang = langMap[language] || 'en-US';
    }
  }, [language, utterance]);

  const readPageContent = () => {
    if (!utterance || !window.speechSynthesis) {
      toast.error(t('accessibility.speech_not_supported') || 'Speech synthesis not supported in this browser');
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    // Get all text content from the page, focusing on meaningful content
    const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, button, a, label, span');
    let textToRead = '';

    contentElements.forEach(element => {
      // Skip hidden elements and UI controls that don't need to be read
      if (
        element.closest('[role="menu"]') || 
        element.closest('[role="menuitem"]') ||
        element.closest('[aria-hidden="true"]') || 
        window.getComputedStyle(element).display === 'none' ||
        (element as HTMLElement).getAttribute('aria-label') === 'Accessibility Settings'
      ) {
        return;
      }

      // Get direct text content without child element texts to avoid duplication
      let directText = '';
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          directText += node.textContent?.trim() + ' ';
        }
      }

      if (directText.trim()) {
        textToRead += directText + ' ';
      }
    });

    // Read the text
    utterance.text = textToRead;
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={readPageContent}
      title={isReading ? 
        (t('accessibility.stop_reading') || 'Stop reading') : 
        (t('accessibility.read_aloud') || 'Read page aloud')}
      className="rounded-full"
      aria-label={isReading ? 
        (t('accessibility.stop_reading') || 'Stop reading') : 
        (t('accessibility.read_aloud') || 'Read page aloud')}
    >
      {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  );
};

export default ReadAloud;
