
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChevronLeft, UserCog, Kanban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';

const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isEducator, setIsEducator] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
        if (!employeeId) {
          navigate('/hr');
          return;
        }
        
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', employeeId)
          .single();
          
        if (employeeError) {
          toast.error('Failed to fetch employee details');
          navigate('/hr');
          return;
        }
        
        if (employeeData) {
          setEmployee(employeeData);
          setFormData(employeeData);
          
          // Check if employee is an educator
          const { data: educatorData, error: educatorError } = await supabase
            .from('educators')
            .select('*')
            .eq('employee_id', employeeId)
            .maybeSingle();
            
          if (!educatorError && educatorData) {
            setIsEducator(true);
          }
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast.error('An error occurred while loading employee data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [employeeId, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('employee_id', employeeId);
        
      if (error) {
        throw error;
      }
      
      toast.success('Employee details updated successfully');
      setEmployee(formData);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee details');
    } finally {
      setLoading(false);
    }
  };

  const openKanbanBoard = () => {
    if (employeeId) {
      window.open(`https://goalwize.vercel.app/kanban/${employeeId}`, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Could not retrieve employee ID.');
    }
  };

  if (loading && !employee) {
    return (
      <Layout title="Employee Details" subtitle="Loading employee information">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Employee Details" 
      subtitle={`Details for ${employee?.name || 'employee'}`}
      showBackButton={true}
      onBack={handleGoBack}
    >
      <div className="mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">Employee Information</CardTitle>
            <div className="flex gap-2">
              {isEducator && (
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={openKanbanBoard}
                >
                  <Kanban className="h-4 w-4" />
                  Kanban Board
                </Button>
              )}
              
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "default" : "outline"}
              >
                <UserCog className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel Editing' : 'Edit Details'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="employment">Employment Details</TabsTrigger>
                <TabsTrigger value="contact">Contact Information</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.name || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <Select
                        value={formData.gender || ''}
                        onValueChange={(value) => handleInputChange('gender', value)}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.gender || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">
                        {employee?.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="blood_group">Blood Group</Label>
                    {isEditing ? (
                      <Input
                        id="blood_group"
                        value={formData.blood_group || ''}
                        onChange={(e) => handleInputChange('blood_group', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.blood_group || 'N/A'}</div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="employment" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <div className="p-2 bg-gray-50 rounded border">{employee?.employee_id || 'N/A'}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    {isEditing ? (
                      <Input
                        id="designation"
                        value={formData.designation || ''}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.designation || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.department || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    {isEditing ? (
                      <Select
                        value={formData.employment_type || ''}
                        onValueChange={(value) => handleInputChange('employment_type', value)}
                      >
                        <SelectTrigger id="employment_type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.employment_type || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_of_joining">Date of Joining</Label>
                    {isEditing ? (
                      <Input
                        id="date_of_joining"
                        type="date"
                        value={formData.date_of_joining || ''}
                        onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">
                        {employee?.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : 'N/A'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select
                        value={formData.status || ''}
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                          <SelectItem value="Terminated">Terminated</SelectItem>
                          <SelectItem value="Resigned">Resigned</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.status || 'N/A'}</div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.email || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.phone || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work_location">Work Location</Label>
                    {isEditing ? (
                      <Input
                        id="work_location"
                        value={formData.work_location || ''}
                        onChange={(e) => handleInputChange('work_location', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.work_location || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    {isEditing ? (
                      <Input
                        id="emergency_contact_name"
                        value={formData.emergency_contact_name || ''}
                        onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.emergency_contact_name || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact Number</Label>
                    {isEditing ? (
                      <Input
                        id="emergency_contact"
                        value={formData.emergency_contact || ''}
                        onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{employee?.emergency_contact || 'N/A'}</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {isEditing && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveChanges} disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmployeeDetailPage;
