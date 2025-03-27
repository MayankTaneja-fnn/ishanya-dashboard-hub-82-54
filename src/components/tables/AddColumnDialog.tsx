
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  onSuccess: () => void;
  displayTableName: string;
}

const AddColumnDialog = ({ isOpen, onClose, tableName, onSuccess, displayTableName }: AddColumnDialogProps) => {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columnTypes = [
    { value: 'text', label: 'Text' },
    { value: 'integer', label: 'Number (Integer)' },
    { value: 'decimal', label: 'Number (Decimal)' },
    { value: 'boolean', label: 'Yes/No (Boolean)' },
    { value: 'date', label: 'Date' },
    { value: 'timestamp', label: 'Date and Time' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!columnName.trim()) {
      setError('Column name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the SQL function to add the column
      const { data, error: fnError } = await supabase.rpc('add_custom_column', {
        p_table_name: tableName,
        p_column_name: columnName,
        p_column_type: columnType
      });
      
      if (fnError) {
        console.error('Error adding column:', fnError);
        throw new Error(fnError.message || 'Failed to add column');
      }
      
      toast.success(`Column "${columnName}" added successfully to ${displayTableName}`);
      setColumnName('');
      onSuccess();
      onClose();
      
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error('Failed to add column');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Column to {displayTableName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="column-name">Column Name</Label>
            <Input
              id="column-name"
              placeholder="Enter column name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="column-type">Column Type</Label>
            <Select value={columnType} onValueChange={setColumnType}>
              <SelectTrigger id="column-type">
                <SelectValue placeholder="Select column type" />
              </SelectTrigger>
              <SelectContent>
                {columnTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Add Column
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;
