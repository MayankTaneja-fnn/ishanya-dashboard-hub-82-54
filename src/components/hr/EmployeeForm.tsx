
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FileUpload from '@/components/ui/file-upload';

type EmployeeFormProps = {
  employee: any;
  onSave: (updatedEmployee: any) => void;
  onCancel: () => void;
};

const EmployeeForm = ({ employee, onSave, onCancel }: EmployeeFormProps) => {
  const [formData, setFormData] = useState(() => {
    const initialData = { ...employee };
    return initialData;
  });
  
  const [centers, setCenters] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [centerName, setCenterName] = useState<string>('');

  useEffect(() => {
    const fetchCentersAndPrograms = async () => {
      setLoading(true);
      try {
        const { data: centersData, error: centersError } = await supabase
          .from('centers')
          .select('center_id, name')
          .order('name');
        
        if (centersError) {
          console.error('Error fetching centers:', centersError);
        } else if (centersData) {
          setCenters(centersData);
          
          // If center_id exists, get the center name
          if (formData.center_id) {
            const center = centersData.find(c => c.center_id === parseInt(formData.center_id));
            if (center) {
              setCenterName(center.name);
              setFormData(prev => ({
                ...prev,
                work_location: center.name
              }));
            }
          }
        }
        
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('program_id, name')
          .order('name');
        
        if (programsError) {
          console.error('Error fetching programs:', programsError);
        } else if (programsData) {
          setPrograms(programsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCentersAndPrograms();
  }, [formData.center_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    let updatedFormData = { ...formData, [name]: value };
    
    // Handle designation change and set department automatically
    if (name === 'designation') {
      let department = '';
      
      if (value === 'Educator') {
        department = 'Education';
      } else if (value === 'HR') {
        department = 'Human Resources';
      } else if (value === 'Administrator') {
        department = 'Management';
      }
      
      updatedFormData = { ...updatedFormData, department };
    }
    
    // Handle center_id change and update work_location
    if (name === 'center_id') {
      const center = centers.find(c => c.center_id === parseInt(value));
      if (center) {
        updatedFormData = { 
          ...updatedFormData, 
          work_location: center.name 
        };
        setCenterName(center.name);
      }
    }
    
    setFormData(updatedFormData);
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData({ ...formData, [name]: formattedDate });
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const handleFileUpload = (name: string, url: string) => {
    setFormData({ ...formData, [name]: url });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const requiredFields = [
      'name', 'gender', 'designation', 'employment_type',
      'email', 'phone', 'date_of_birth', 'date_of_joining', 'center_id',
      'employee_id'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    });
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Check if employee_id is an integer
    if (formData.employee_id && isNaN(parseInt(formData.employee_id))) {
      newErrors.employee_id = 'Employee ID must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = { ...formData };
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    // Convert employee_id to an integer
    if (submissionData.employee_id) {
      submissionData.employee_id = parseInt(submissionData.employee_id);
    }
    
    console.log("Submitting employee data:", submissionData);
    onSave(submissionData);
  };

  // This array defines the form fields and their properties
  const formFields = [
    { name: 'employee_id', label: 'Employee ID', type: 'number' },
    { name: 'name', label: 'Full Name', type: 'input' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
    { name: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    
    { name: 'email', label: 'Email', type: 'input' },
    { name: 'phone', label: 'Phone', type: 'input' },
    { name: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'input' },
    { name: 'emergency_contact', label: 'Emergency Contact', type: 'input' },
    
    { name: 'designation', label: 'Designation', type: 'select', options: ['Administrator', 'HR', 'Educator'] },
    { name: 'department', label: 'Department', type: 'department' },
    { name: 'employment_type', label: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Temporary'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'] },
    { name: 'work_location', label: 'Work Location', type: 'work_location' },
    { name: 'date_of_joining', label: 'Date of Joining', type: 'date' },
    { name: 'date_of_leaving', label: 'Date of Leaving', type: 'date' },
    
    { name: 'center_id', label: 'Center', type: 'center' },
    { name: 'program_id', label: 'Program', type: 'program' },
    { name: 'photo', label: 'Profile Photo', type: 'file', fileType: 'photo' },
    { name: 'lor', label: 'LOR Document', type: 'file', fileType: 'lor' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map((field) => {
          // Check if this field should be shown based on conditions
          if (field.name === 'department' && !formData.designation) {
            return null;
          }
          
          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label} 
                {field.name !== 'blood_group' && 
                 field.name !== 'date_of_leaving' && 
                 field.name !== 'program_id' && 
                 field.name !== 'status' && 
                 field.name !== 'photo' && 
                 field.name !== 'lor' &&
                 field.name !== 'emergency_contact_name' &&
                 field.name !== 'emergency_contact' && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              
              {field.type === 'input' && (
                <>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    className={errors[field.name] ? "border-red-500" : ""}
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                  )}
                </>
              )}
              
              {field.type === 'number' && (
                <>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    className={errors[field.name] ? "border-red-500" : ""}
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                  )}
                </>
              )}
              
              {field.type === 'select' && (
                <>
                  <Select 
                    value={formData[field.name] || ''} 
                    onValueChange={(value) => handleSelectChange(field.name, value)}
                  >
                    <SelectTrigger className={errors[field.name] ? "border-red-500" : ""}>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                  )}
                </>
              )}
              
              {field.type === 'date' && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData[field.name] && "text-muted-foreground",
                          errors[field.name] && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData[field.name] ? format(new Date(formData[field.name]), 'PPP') : `Select ${field.label}`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 max-w-[350px]">
                      <Calendar
                        mode="single"
                        selected={formData[field.name] ? new Date(formData[field.name]) : undefined}
                        onSelect={(date) => handleDateChange(field.name, date)}
                        className="pointer-events-auto"
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear() + 10}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                  )}
                </>
              )}
              
              {field.type === 'file' && (
                <FileUpload
                  bucketName={field.fileType === 'lor' ? 'employee-lor' : 'employee-photos'}
                  onFileUpload={(url) => handleFileUpload(field.name, url)}
                  existingUrl={formData[field.name]}
                  entityType="employee"
                  entityId={formData.employee_id}
                />
              )}
              
              {field.type === 'center' && (
                <>
                  <Select 
                    value={formData[field.name]?.toString() || ''} 
                    onValueChange={(value) => handleSelectChange(field.name, value)}
                  >
                    <SelectTrigger className={errors[field.name] ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.center_id} value={center.center_id.toString()}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                  )}
                </>
              )}
              
              {field.type === 'program' && (
                <>
                  <Select 
                    value={formData[field.name]?.toString() || ''} 
                    onValueChange={(value) => handleSelectChange(field.name, value)}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      {programs.map((program) => (
                        <SelectItem key={program.program_id} value={program.program_id.toString()}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              
              {field.type === 'department' && (
                <Input
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  disabled
                  readOnly
                  className="bg-gray-100"
                />
              )}
              
              {field.type === 'work_location' && (
                <Input
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || centerName}
                  disabled
                  readOnly
                  className="bg-gray-100"
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
