
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Upload, Download } from 'lucide-react';

type TableActionsProps = {
  tableName: string;
  onInsert: () => void;
  onRefresh: () => void;
  onUpload?: () => void;
  className?: string;
};

const TableActions = ({ tableName, onInsert, onRefresh, onUpload, className }: TableActionsProps) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 ${className || ''}`}>
      <h2 className="text-xl font-semibold">{tableName} Management</h2>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault(); // Prevent any default navigation
            onRefresh();
          }}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onUpload}
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={onInsert}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>
    </div>
  );
};

export default TableActions;
