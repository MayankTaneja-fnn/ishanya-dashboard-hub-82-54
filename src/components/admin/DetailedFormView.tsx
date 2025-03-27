
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, School, Calendar, Book, Star, Heart, Activity, Users, Home, FileText, Info } from 'lucide-react';

interface DetailedFormViewProps {
  entry: Record<string, any>;
  mode: 'view' | 'edit';
  onSave?: (updatedData: Record<string, any>) => void;
  onAccept?: (entry: Record<string, any>) => void;
  onReject?: (entry: Record<string, any>) => void;
}

const DetailedFormView = ({
  entry,
  mode,
  onSave,
  onAccept,
  onReject
}: DetailedFormViewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data with entry values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    
    // Filter out special fields and metadata
    Object.entries(entry).forEach(([key, value]) => {
      if (!['id', 'rowIndex'].includes(key)) {
        initialData[key] = value;
      }
    });
    
    setFormData(initialData);
  }, [entry]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!onSave) return;
    
    try {
      setIsLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!onAccept) return;
    
    try {
      setIsLoading(true);
      await onAccept(entry);
    } catch (error) {
      console.error('Error accepting entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    
    try {
      setIsLoading(true);
      await onReject(entry);
    } catch (error) {
      console.error('Error rejecting entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  function getFormFields() {
    // Define important fields to show at the top
    const priorityFields = [
      'First Name',
      'Last Name',
      'Gender',
      'Date of Birth',
      'Primary Diagnosis',
      'Comorbidity',
      'UDID',
      'Father\'s Name',
      'Mother\'s Name',
      'Blood Group',
      'Allergies',
      'Contact Number',
      'Alternate Contact Number',
      'Parent\'s Email',
      'Address',
    ];
    
    // Get all keys from formData
    const allFields = Object.keys(formData);
    
    // Filter out system fields and Timestamp
    const filteredFields = allFields.filter(
      field => !['id', 'rowIndex', 'Timestamp', 'submittedAt'].includes(field)
    );
    
    // Sort fields with priority fields first, then alphabetically
    return filteredFields.sort((a, b) => {
      const aIndex = priorityFields.indexOf(a);
      const bIndex = priorityFields.indexOf(b);
      
      // If both are priority fields, sort by priority order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only a is a priority field, it comes first
      if (aIndex !== -1) return -1;
      
      // If only b is a priority field, it comes first
      if (bIndex !== -1) return 1;
      
      // If neither are priority fields, sort alphabetically
      return a.localeCompare(b);
    });
  }

  function formatFieldLabel(field: string) {
    // If field is already well-formatted, return as is
    if (/^[A-Z]/.test(field) || field.includes("'")) {
      return field;
    }
    
    // Otherwise, convert from camelCase or snake_case
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  function shouldUseTextarea(field: string, value: string) {
    return field.toLowerCase().includes('address') || 
           (typeof value === 'string' && value.length > 50);
  }

  function organizeFieldsByCategory() {
    const fields = getFormFields();
    
    const categories = {
      personalInfo: ['First Name', 'Last Name', 'Gender', 'Date of Birth', 'Blood Group', 'Primary Diagnosis', 'Comorbidity', 'UDID', 'Allergies'],
      contactInfo: ['Contact Number', 'Alternate Contact Number', 'Parent\'s Email', 'Address'],
      familyInfo: ['Father\'s Name', 'Mother\'s Name'],
      programInfo: ['Program', 'Enrollment Year', 'Status', 'Educator', 'Center ID'],
      otherInfo: [] as string[]
    };
    
    // Put remaining fields in otherInfo
    const categorizedFields = [...categories.personalInfo, ...categories.contactInfo, 
                             ...categories.familyInfo, ...categories.programInfo];
    
    fields.forEach(field => {
      if (!categorizedFields.includes(field)) {
        categories.otherInfo.push(field);
      }
    });
    
    return categories;
  }

  function renderCategoryFields(categoryFields: string[]) {
    return categoryFields.filter(field => formData[field] !== undefined).map(field => (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="font-medium">
          {formatFieldLabel(field)}
        </Label>
        
        {mode === 'view' ? (
          <div className="p-2 bg-gray-50 rounded border min-h-[38px]">
            {formData[field] || '-'}
          </div>
        ) : shouldUseTextarea(field, formData[field] || '') ? (
          <Textarea
            id={field}
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full"
          />
        ) : (
          <Input
            id={field}
            type="text"
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        )}
      </div>
    ));
  }

  const categories = organizeFieldsByCategory();

  // Get student name from form data if available
  const studentName = formData['First Name'] && formData['Last Name'] 
    ? `${formData['First Name']} ${formData['Last Name']}` 
    : formData['first_name'] && formData['last_name']
    ? `${formData['first_name']} ${formData['last_name']}`
    : 'Student Details';

  return (
    <div>
      {mode === 'view' && onAccept && onReject && (
        <div className="flex justify-end mb-4 gap-2">
          <Button 
            onClick={handleAccept}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            Accept & Add Student
          </Button>
          <Button 
            onClick={handleReject}
            variant="destructive"
            disabled={isLoading}
          >
            Reject
          </Button>
        </div>
      )}
    
      <ScrollArea className="h-[60vh] pr-4">
        <Card className="border shadow-sm mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 pb-2 border-b">
            <CardTitle className="flex items-center gap-3 text-xl text-blue-700 dark:text-blue-300">
              <User className="h-6 w-6 text-blue-500" />
              {studentName}
            </CardTitle>
            <CardDescription>
              Student ID: {formData.student_id || formData['Student ID'] || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information Card */}
              <Card className="col-span-1 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {renderCategoryFields(categories.personalInfo)}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card className="col-span-1 shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {renderCategoryFields(categories.contactInfo)}
                  </div>
                </CardContent>
              </Card>

              {/* Family Information Card */}
              <Card className="col-span-1 shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Family Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {renderCategoryFields(categories.familyInfo)}
                  </div>
                </CardContent>
              </Card>

              {/* Program Information Card */}
              <Card className="col-span-1 shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <School className="h-4 w-4 text-amber-500" />
                    Program Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {renderCategoryFields(categories.programInfo)}
                  </div>
                </CardContent>
              </Card>

              {/* Other Information Card */}
              {categories.otherInfo.length > 0 && (
                <Card className="col-span-1 shadow-sm border-l-4 border-l-gray-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {renderCategoryFields(categories.otherInfo)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
        
        {mode === 'edit' && (
          <div className="flex justify-end mt-6 gap-2">
            <Button 
              onClick={handleSaveChanges} 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DetailedFormView;
