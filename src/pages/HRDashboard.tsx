
import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';
import DiscussionRoom from '@/components/discussion/DiscussionRoom';
import EmployeeSearch from '@/components/hr/EmployeeSearch';
import EmployeeList from '@/components/hr/EmployeeList';
import { fetchCenters } from '@/lib/api';
import { toast } from 'sonner';

type Center = {
  id: string;
  center_id: number;
  name: string;
};

const HRDashboard = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'discussion'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [centers, setCenters] = useState<Center[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const user = getCurrentUser();
  const dataFetched = useRef(false);

  // Fetch employee count directly from the database
  const fetchEmployeeCount = async () => {
    try {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching employee count:', error);
        return;
      }
      
      if (count !== null) {
        setTotalEmployees(count);
      }
    } catch (error) {
      console.error('Error in fetchEmployeeCount:', error);
    }
  };

  useEffect(() => {
    if (dataFetched.current || !user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        dataFetched.current = true;

        // Fetch centers
        const centersData = await fetchCenters();
        if (centersData) {
          setCenters(centersData);
        }

        // Fetch employee count
        await fetchEmployeeCount();

        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');

        if (employeesError) {
          console.error('Error fetching employees:', employeesError);
          toast.error('Failed to load employees data');
          return;
        }

        if (employeesData) {
          setEmployees(employeesData);
          setFilteredEmployees(employeesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup real-time subscription for employee count updates
    const channel = supabase
      .channel('employee-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' }, 
        () => {
          // Refresh employee count when any changes occur
          fetchEmployeeCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (employees.length === 0) return;
    
    let filtered = [...employees];
    
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCenter !== 'all') {
      const centerId = parseInt(selectedCenter);
      filtered = filtered.filter(emp => emp.center_id === centerId);
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, selectedCenter, employees]);

  return (
    <Layout
      title="HR Dashboard" 
      subtitle={`Welcome back, ${user?.name || 'HR Manager'}`}
    >
      <div className="mb-6">
        <Tabs defaultValue="employees" onValueChange={(value) => setActiveTab(value as 'employees' | 'discussion')}>
          <TabsList className="mb-4">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="discussion">Discussion Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalEmployees}</div>
                    <p className="text-sm text-muted-foreground">Across all centers</p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Search & Filter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmployeeSearch 
                      onSearch={setSearchTerm} 
                      onCenterChange={setSelectedCenter} 
                      centers={centers} 
                      selectedCenter={selectedCenter}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <EmployeeList employees={filteredEmployees} />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="discussion">
            <DiscussionRoom />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HRDashboard;
