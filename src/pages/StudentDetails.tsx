import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  BarChart as BarChartIcon,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  ListChecks,
  User,
  Activity,
  CalendarDays,
  Clock4,
  Heart,
  AlertCircle,
  HelpCircle,
  Info,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

type Student = {
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  fathers_name: string;
  mothers_name: string;
  primary_diagnosis: string;
  comorbidity: string | null;
  blood_group: string | null;
  allergies: string | null;
  udid: string | null;
  contact_number: string;
  alt_contact_number: string | null;
  status: string;
  enrollment_year: number;
  address: string;
  parents_email: string | null;
  student_email: string | null;
  center_id: number;
  program_id: number;
  educator_employee_id: number;
};

type Task = {
  task_id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  created_at: string;
  priority: string;
  category: string;
  feedback?: string;
  educator_employee_id?: number;
  program_id?: number;
  student_id?: number;
  stage?: string;
};

type AttendanceSummary = {
  present: number;
  absent: number;
};

type Assessment = {
  assessment_id: string;
  title: string;
  score: number;
  max_score: number;
  date: string;
  notes: string | null;
  student_id: string;
  area: string;
};

type Guardian = {
  guardian_id: string;
  name: string;
  relationship: string;
  email: string | null;
  phone: string;
  address: string | null;
  is_primary: boolean;
  student_id: string;
};

type PerformanceRecord = {
  id: string | null;
  student_id: number;
  program_id: number;
  educator_employee_id: number;
  quarter: string;
  area_of_development: string;
  is_sent: boolean;
  skill_area?: string | null;
  comments?: string | null;
  [key: string]: any;
};

type GeneralReport = {
  id: string | null;
  student_id: number;
  program_id: number;
  educator_employee_id: number;
  quarter: string;
  is_sent: boolean;
  punctuality?: string | null;
  preparedness?: string | null;
  assistance_required?: string | null;
  parental_support?: string | null;
  any_behavioral_issues?: string | null;
};

const QUARTERS = [
  "January 2025 - March 2025",
  "April 2025 - June 2025",
  "July 2025 - September 2025",
  "October 2025 - December 2025"
];

const YEARS = [2024, 2025, 2026];

const StudentDetails = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);
  const [generalReports, setGeneralReports] = useState<GeneralReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary>({ present: 0, absent: 0 });
  const [expandedQuarter, setExpandedQuarter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<number>(2025);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        const studentIdNum = parseInt(studentId, 10);
        
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', studentIdNum)
          .single();

        if (studentError) throw studentError;
        
        if (studentData) {
          setStudent(studentData as Student);
        }

        const { data: perfData, error: perfError } = await supabase
          .from('performance_records')
          .select('*')
          .eq('student_id', studentIdNum);

        if (perfError) throw perfError;
        setPerformanceRecords(perfData || []);

        const { data: reportData, error: reportError } = await supabase
          .from('general_reporting')
          .select('*')
          .eq('student_id', studentIdNum);

        if (reportError) throw reportError;
        setGeneralReports(reportData || []);

        const { data: taskData, error: taskError } = await supabase
          .from('goals_tasks')
          .select('*')
          .eq('student_id', studentIdNum);

        if (taskError) throw taskError;
        
        const transformedTasks = (taskData || []).map(task => ({
          ...task,
          title: task.title || '',
          description: task.description || '',
          category: task.category || '',
          feedback: task.feedback || '',
          created_at: new Date().toISOString()
        }));
        
        setTasks(transformedTasks);

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('student_attendance')
          .select('attendance')
          .eq('student_id', studentIdNum);

        if (attendanceError) throw attendanceError;
        
        const present = attendanceData?.filter(a => a.attendance === true).length || 0;
        const absent = attendanceData?.filter(a => a.attendance === false).length || 0;
        setAttendance({ present, absent });

      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const getQuarterlyPerformance = (quarter: string) => {
    if (!student) return null;
    
    const yearPrefix = currentYear.toString();
    const fullQuarter = quarter.includes(yearPrefix) ? quarter : quarter.replace(/\d{4}/g, yearPrefix);
    
    return performanceRecords.find(record => 
      record.student_id === student.student_id &&
      record.program_id === student.program_id &&
      record.educator_employee_id === student.educator_employee_id &&
      record.quarter === fullQuarter
    );
  };

  const getQuarterlyReport = (quarter: string) => {
    if (!student) return null;
    
    const yearPrefix = currentYear.toString();
    const fullQuarter = quarter.includes(yearPrefix) ? quarter : quarter.replace(/\d{4}/g, yearPrefix);
    
    return generalReports.find(report => 
      report.student_id === student.student_id &&
      report.program_id === student.program_id &&
      report.educator_employee_id === student.educator_employee_id &&
      report.quarter === fullQuarter
    );
  };

  const handleDownloadReport = async (quarter: string) => {
    if (!student) return;
    
    setLoadingReport(true);
    const yearPrefix = currentYear.toString();
    const fullQuarter = quarter.includes(yearPrefix) ? quarter : quarter.replace(/\d{4}/g, yearPrefix);
    
    try {
      const response = await axios({
        method: 'post',
        url: 'https://fast-api-ubv8.onrender.com/generate_report',
        data: {
          student_id: student.student_id,
          program_id: student.program_id,
          educator_employee_id: student.educator_employee_id,
          quarter: fullQuarter
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.first_name}_${student.last_name}_${fullQuarter.replace(/\s/g, '_')}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading report:', error);
      
      if (error.response?.status === 404) {
        toast.error('No report data found for this student and quarter');
      } else {
        toast.error('Failed to download report');
      }
    } finally {
      setLoadingReport(false);
    }
  };

  const toggleQuarter = (quarter: string) => {
    if (expandedQuarter === quarter) {
      setExpandedQuarter(null);
    } else {
      setExpandedQuarter(quarter);
    }
  };

  const adjustYear = (increment: number) => {
    const newYear = currentYear + increment;
    if (YEARS.includes(newYear)) {
      setCurrentYear(newYear);
    }
  };

  const formatDisplayKey = (key: string) => {
    if (key.includes('_')) {
      const [number, type] = key.split('_');
      return `${type.charAt(0).toUpperCase() + type.slice(1)} ${number}`;
    } else {
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  const hasScoreData = (performance: any) => {
    if (!performance) return false;
    return Object.keys(performance).some(key => 
      key.includes('_score') && performance[key] !== null && performance[key] !== undefined
    );
  };

  const prepareChartData = (performance: any) => {
    if (!performance) return [];
    
    const scoreData = Object.entries(performance)
      .filter(([key, value]) => key.includes('_score') && value !== null && value !== undefined)
      .map(([key, value]) => {
        const skillNumber = key.split('_')[0];
        const descriptionKey = `${skillNumber}_description`;
        const description = performance[descriptionKey] || `Skill ${skillNumber}`;
        
        return {
          name: description.length > 30 ? description.substring(0, 30) + '...' : description,
          score: typeof value === 'number' ? value : parseFloat(value as string) || 0,
          fullDescription: description
        };
      });
      
    return scoreData;
  };

  if (loading) {
    return (
      <Layout
        title="Loading..."
        subtitle="Please wait while we fetch the student details"
        showBackButton
        onBack={() => window.history.back()}
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout
        title="Student Not Found"
        subtitle="The requested student could not be found"
        showBackButton
        onBack={() => window.history.back()}
      >
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No student found with ID: {studentId}</p>
        </div>
      </Layout>
    );
  }

  const updatedQuarters = QUARTERS.map(quarter => 
    quarter.replace(/\d{4}/g, currentYear.toString())
  );

  return (
    <Layout
      title={`${student.first_name} ${student.last_name}`}
      subtitle={`Student ID: ${student.student_id} | Program ID: ${student.program_id}`}
      showBackButton
      onBack={() => window.history.back()}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-500">Student Information</h3>
                <p className="mt-1"><strong>Name:</strong> {student.first_name} {student.last_name}</p>
                <p><strong>Student ID:</strong> {student.student_id}</p>
                <p><strong>Gender:</strong> {student.gender}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Program Information</h3>
                <p className="mt-1"><strong>Program ID:</strong> {student.program_id}</p>
                <p><strong>Educator ID:</strong> {student.educator_employee_id}</p>
                <p><strong>Center ID:</strong> {student.center_id}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Attendance Summary</h3>
                <p className="mt-1"><strong>Present:</strong> {attendance.present} days</p>
                <p><strong>Absent:</strong> {attendance.absent} days</p>
                <p><strong>Attendance Rate:</strong> {
                  attendance.present + attendance.absent > 0 
                    ? `${Math.round((attendance.present / (attendance.present + attendance.absent)) * 100)}%` 
                    : 'N/A'
                }</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustYear(-1)}
            disabled={!YEARS.includes(currentYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold">{currentYear}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustYear(1)}
            disabled={!YEARS.includes(currentYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {updatedQuarters.map((quarter) => {
            const performance = getQuarterlyPerformance(quarter);
            const report = getQuarterlyReport(quarter);
            const isExpanded = expandedQuarter === quarter;
            const chartData = prepareChartData(performance);
            const hasScores = hasScoreData(performance);

            return (
              <Card key={quarter} className={`border-l-4 ${isExpanded ? 'border-l-ishanya-green' : 'border-l-gray-200'}`}>
                <CardHeader 
                  className="flex flex-row items-center justify-between cursor-pointer"
                  onClick={() => toggleQuarter(quarter)}
                >
                  <CardTitle className="text-lg">{quarter}</CardTitle>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="shadow-sm">
                        <CardHeader className="bg-gray-50 pb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-ishanya-green" />
                            <CardTitle className="text-lg font-medium">Performance Records</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {performance ? (
                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 rounded-md">
                                <h4 className="font-medium mb-1">Area of Development</h4>
                                <p>{performance.area_of_development}</p>
                              </div>
                              
                              {hasScores && (
                                <div className="mt-4 bg-white p-2 rounded-lg border">
                                  <h4 className="font-medium mb-3 text-center">Performance Scores</h4>
                                  <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip 
                                          formatter={(value, name, props) => [`Score: ${value}`, '']}
                                          labelFormatter={(label) => chartData.find(item => item.name === label)?.fullDescription || label}
                                        />
                                        <Line 
                                          type="monotone" 
                                          dataKey="score" 
                                          stroke="#16a34a" 
                                          activeDot={{ r: 8 }} 
                                          strokeWidth={2}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 gap-2 mt-4">
                                {Object.entries(performance).map(([key, value]) => {
                                  if (
                                    value === null || 
                                    ['id', 'student_id', 'program_id', 'educator_employee_id', 'quarter', 'area_of_development', 'is_sent'].includes(key)
                                  ) {
                                    return null;
                                  }
                                  
                                  const displayKey = formatDisplayKey(key);
                                  
                                  if (key.includes('_score')) {
                                    return (
                                      <div key={key} className="flex items-center gap-2 p-2 border rounded">
                                        <div className="font-medium text-gray-700 min-w-32">{displayKey}:</div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={Number(value) * 10} 
                                              className="h-2.5" 
                                            />
                                            <span className="text-sm font-medium">{value}/10</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div key={key} className="p-2 border rounded">
                                      <div className="font-medium text-gray-700">{displayKey}</div>
                                      <div className="mt-1">{String(value)}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <Info className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-gray-500">No performance records available for this quarter.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-sm">
                        <CardHeader className="bg-gray-50 pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-ishanya-green" />
                            <CardTitle className="text-lg font-medium">General Report</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {report ? (
                            <div className="space-y-3">
                              {report.punctuality && (
                                <div className="p-3 bg-white rounded-md border">
                                  <div className="flex items-start gap-2">
                                    <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Punctuality</h4>
                                      <p className="mt-1">{report.punctuality}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {report.preparedness && (
                                <div className="p-3 bg-white rounded-md border">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Preparedness</h4>
                                      <p className="mt-1">{report.preparedness}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {report.assistance_required && (
                                <div className="p-3 bg-white rounded-md border">
                                  <div className="flex items-start gap-2">
                                    <HelpCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Assistance Required</h4>
                                      <p className="mt-1">{report.assistance_required}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {report.parental_support && (
                                <div className="p-3 bg-white rounded-md border">
                                  <div className="flex items-start gap-2">
                                    <Heart className="h-5 w-5 text-pink-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Parental Support</h4>
                                      <p className="mt-1">{report.parental_support}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {report.any_behavioral_issues && (
                                <div className="p-3 bg-white rounded-md border">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Behavioral Issues</h4>
                                      <p className="mt-1">{report.any_behavioral_issues}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {!report.punctuality && !report.preparedness && !report.assistance_required && 
                               !report.parental_support && !report.any_behavioral_issues && (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                  <Info className="h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-gray-500">No report details available.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <Info className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-gray-500">No general report available for this quarter.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button 
                        onClick={() => handleDownloadReport(quarter)}
                        disabled={loadingReport || (!performance && !report)}
                        className="bg-ishanya-green hover:bg-ishanya-green/80 text-white"
                      >
                        {loadingReport ? <LoadingSpinner size="sm" /> : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Student's Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tasks and Goals</h2>
          {tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.task_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{task.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(task.due_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{task.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{task.feedback || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No tasks or goals assigned to this student.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDetails;
