
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  onSuccess: () => void;
}

const dataTypes = [
  { value: 'text', label: 'Text' },
  { value: 'integer', label: 'Number (Integer)' },
  { value: 'boolean', label: 'Yes/No (Boolean)' },
  { value: 'date', label: 'Date' },
  { value: 'timestamp', label: 'Date and Time' },
  { value: 'decimal', label: 'Decimal Number' },
];

export default function AddColumnDialog({ isOpen, onClose, tableName, onSuccess }: AddColumnDialogProps) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddColumn = async () => {
    if (!columnName.trim()) {
      setError('Column name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call the add_custom_column database function
      const { data, error: dbError } = await supabase.rpc('add_custom_column', {
        p_table_name: tableName.toLowerCase(),
        p_column_name: columnName,
        p_column_type: columnType
      });

      if (dbError) {
        console.error('Error adding column:', dbError);
        setError(dbError.message || 'Failed to add column');
        toast.error('Failed to add column: ' + dbError.message);
        return;
      }

      toast.success('Column added successfully');
      setColumnName('');
      setColumnType('text');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding column:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Column to {tableName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="columnName">Column Name</Label>
            <Input
              id="columnName"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name"
            />
            <p className="text-xs text-muted-foreground">
              Column names should only contain letters, numbers, and underscores
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="columnType">Data Type</Label>
            <Select value={columnType} onValueChange={setColumnType}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddColumn} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
