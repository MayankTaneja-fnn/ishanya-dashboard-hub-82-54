
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simplified type definition to avoid excessive nesting
type PayrollFormProps = {
  employeeId?: string;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
};

const PayrollForm: React.FC<PayrollFormProps> = ({ 
  employeeId, 
  onSubmit,
  defaultValues = {}
}) => {
  const [formData, setFormData] = useState(defaultValues);
  
  // Simple handler to avoid deep type nesting
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                value={formData.salary || ''}
                onChange={handleChange}
              />
            </div>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayrollForm;
