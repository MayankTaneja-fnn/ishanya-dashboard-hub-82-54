
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const payrollSchema = z.object({
  current_salary: z.number().min(1, "Salary must be greater than 0"),
  last_paid: z.string().optional(),
});

type PayrollFormData = {
  current_salary: number;
  last_paid?: string;
};

type PayrollFormProps = {
  employeeId: number;
  initialData?: {
    id?: string;
    employee_id?: number;
    current_salary?: number;
    last_paid?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
};

const PayrollForm = ({ employeeId, initialData, onSuccess, onCancel }: PayrollFormProps) => {
  const [formData, setFormData] = useState<PayrollFormData>({
    current_salary: initialData?.current_salary || 0,
    last_paid: initialData?.last_paid || undefined,
  });
  const [date, setDate] = useState<Date | undefined>(
    initialData?.last_paid ? new Date(initialData.last_paid) : undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'current_salary') {
      const numericValue = parseFloat(value);
      setFormData({ ...formData, [name]: isNaN(numericValue) ? 0 : numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    if (date) {
      setFormData(prev => ({ ...prev, last_paid: date.toISOString() }));
    }
  }, [date]);

  const validateForm = () => {
    try {
      payrollSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          errors[path] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const payrollData = {
        employee_id: employeeId,
        current_salary: formData.current_salary,
        last_paid: formData.last_paid,
      };

      let response;
      
      if (initialData?.id) {
        // Update existing record
        response = await supabase
          .from('employee_payroll')
          .update(payrollData)
          .eq('id', initialData.id);
      } else {
        // Insert new record
        response = await supabase
          .from('employee_payroll')
          .insert(payrollData);
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: `Payroll ${initialData?.id ? 'updated' : 'added'} successfully`,
        variant: "default",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving payroll data:', error);
      toast({
        title: "Error saving payroll data",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current_salary">
          Salary <span className="text-red-500">*</span>
        </Label>
        <Input
          id="current_salary"
          name="current_salary"
          type="number"
          value={formData.current_salary}
          onChange={handleInputChange}
          placeholder="Enter salary amount"
          className={validationErrors.current_salary ? "border-red-500" : ""}
        />
        {validationErrors.current_salary && (
          <p className="text-sm text-red-500">{validationErrors.current_salary}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Last Payment Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : initialData?.id ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default PayrollForm;
