
import { Button } from '@/components/ui/button';
import { DownloadIcon, PlusCircle, RefreshCcw, Upload, Columns } from 'lucide-react';
import { useState } from 'react';
import AddColumnDialog from './AddColumnDialog';

interface TableActionsProps {
  tableName: string;
  onInsert?: () => void;
  onUpload?: () => void; 
  onRefresh?: () => void;
  table?: any;
}

const TableActions = ({ tableName, onInsert, onUpload, onRefresh, table }: TableActionsProps) => {
  const [showAddColumn, setShowAddColumn] = useState(false);

  const handleAddColumn = () => {
    setShowAddColumn(true);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-2">
        {onInsert && (
          <Button 
            className="flex items-center"
            variant="default"
            onClick={onInsert}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add {tableName.slice(0, -1)}
          </Button>
        )}
        
        {onUpload && (
          <Button
            variant="outline"
            onClick={onUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        <Button 
          variant="outline"
          onClick={handleAddColumn}
        >
          <Columns className="h-4 w-4 mr-2" />
          Add Column
        </Button>
        
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showAddColumn && (
        <AddColumnDialog
          isOpen={showAddColumn}
          onClose={() => setShowAddColumn(false)}
          tableName={tableName.toLowerCase()}
          displayTableName={tableName}
          onSuccess={onRefresh || (() => {})}
        />
      )}
    </div>
  );
};

export default TableActions;
