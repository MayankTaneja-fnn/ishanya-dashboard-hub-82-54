
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DatePickerFormField } from '@/components/ui/DatePickerFormField';

// Simplified type definition to avoid excessive nesting
type PayrollFormProps = {
  employeeId: number;
  initialData?: PayrollData;
  onSuccess: () => void;
  onCancel: () => void;
};

type PayrollData = {
  id?: string;
  employee_id: number;
  current_salary: number;
  last_paid?: string | null;
};

const PayrollForm: React.FC<PayrollFormProps> = ({ 
  employeeId, 
  initialData,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<PayrollData>(initialData || {
    employee_id: employeeId,
    current_salary: 0,
    last_paid: null
  });
  
  const [loading, setLoading] = useState(false);
  
  // Simple handler to avoid deep type nesting
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'current_salary' ? Number(value) : value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      last_paid: date ? date.toISOString() : null 
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        employee_id: employeeId,
      };
      
      let response;
      
      if (initialData?.id) {
        // Update existing record
        response = await supabase
          .from('employee_payroll')
          .update(payload)
          .eq('id', initialData.id);
      } else {
        // Insert new record
        response = await supabase
          .from('employee_payroll')
          .insert(payload);
      }
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast.success('Payroll information saved successfully');
      onSuccess();
    } catch (error) {
      console.error('Error saving payroll data:', error);
      toast.error('Failed to save payroll information');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="border-none shadow-none">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current_salary">Salary</Label>
              <Input
                id="current_salary"
                name="current_salary"
                type="number"
                value={formData.current_salary || ''}
                onChange={handleChange}
                placeholder="Enter employee salary"
                required
              />
            </div>
            
            <DatePickerFormField
              label="Last Paid Date"
              value={formData.last_paid ? new Date(formData.last_paid) : undefined}
              onChange={handleDateChange}
              placeholder="Select last payment date"
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : initialData?.id ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayrollForm;
