
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Upload, Mic } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CsvUpload from './CsvUpload';
import VoiceInputDialog from '@/components/ui/VoiceInputDialog';
import { openVoiceInputDialog, listenForVoiceInputDialog } from '@/utils/formEventUtils';

export type TableActionsProps = {
  tableName: string;
  onInsert: () => void;
  onRefresh: () => void;
  onUpload?: () => void;
  table?: any; // For access to center_id and other table properties
  prefilledData?: Record<string, any>; // For prefilled form data
};

const TableActions = ({ 
  tableName, 
  onInsert, 
  onRefresh, 
  onUpload, 
  table 
}: TableActionsProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);

  // Listen for custom event to open the add record form with prefilled data
  useEffect(() => {
    const handleOpenAddRecordForm = (event: CustomEvent) => {
      const { tableName: eventTableName, formData, sourceEntry } = event.detail;
      
      // Only proceed if this is the correct table
      if (eventTableName === tableName) {
        console.log('Opening add record form with prefilled data:', formData);
        
        // Store the source entry information in sessionStorage for retrieval after form submission
        if (sourceEntry) {
          sessionStorage.setItem('formSubmitCallback', JSON.stringify({
            sourceEntry,
            hasCallback: true
          }));
        }
        
        // Trigger the form to open
        onInsert();
        
        // Dispatch a new event to provide form data to the record form component
        window.dispatchEvent(new CustomEvent('setFormData', {
          detail: { formData }
        }));
      }
    };

    // Listen for voice input dialog events
    const handleVoiceInputDialog = (eventTableName: string) => {
      if (eventTableName === tableName) {
        setIsVoiceInputOpen(true);
      }
    };

    // Add event listeners
    window.addEventListener('openAddRecordForm', handleOpenAddRecordForm as EventListener);
    const cleanupVoiceListener = listenForVoiceInputDialog(handleVoiceInputDialog);

    // Clean up
    return () => {
      window.removeEventListener('openAddRecordForm', handleOpenAddRecordForm as EventListener);
      cleanupVoiceListener();
    };
  }, [tableName, onInsert]);

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
  };

  const handleCloseVoiceInput = () => {
    setIsVoiceInputOpen(false);
  };

  const handleUploadClick = () => {
    if (onUpload) {
      onUpload();
    } else {
      setIsUploadOpen(true);
    }
  };

  const handleVoiceEntryClick = () => {
    openVoiceInputDialog(tableName);
  };

  const handleVoiceDataComplete = (data: Record<string, any>) => {
    // Pre-fill the form with voice data and open it
    window.dispatchEvent(new CustomEvent('setFormData', {
      detail: { formData: data }
    }));
    
    onInsert();
    setIsVoiceInputOpen(false);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-ishanya-green">
        {tableName.charAt(0).toUpperCase() + tableName.slice(1)} Data
      </h2>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="sm"
          className="border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"
          onClick={handleUploadClick}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"
          onClick={handleVoiceEntryClick}
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice Entry
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-ishanya-green hover:bg-ishanya-green/90"
          onClick={onInsert}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* CSV Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ishanya-green">Import CSV Data</DialogTitle>
          </DialogHeader>
          <CsvUpload 
            tableName={tableName} 
            onClose={handleCloseUpload} 
            onSuccess={onRefresh} 
          />
        </DialogContent>
      </Dialog>

      {/* Voice Input Dialog */}
      {isVoiceInputOpen && (
        <VoiceInputDialog
          isOpen={isVoiceInputOpen}
          onClose={handleCloseVoiceInput}
          table={tableName}
          onComplete={handleVoiceDataComplete}
        />
      )}
    </div>
  );
};

export default TableActions;
