
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Calendar, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Employee = {
  id: string;
  employee_id: number;
  name: string;
  gender: string;
  designation: string;
  department: string;
  status: string;
  center_id: number;
  email: string;
};

type EmployeeListProps = {
  employees: Employee[];
};

const EmployeeList = ({ employees }: EmployeeListProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "on leave":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const handleViewDetails = (employeeId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/hr/employees/${employeeId}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Employee Directory</h2>
      {employees.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No employees found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <Card 
              key={employee.id} 
              className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              onClick={() => handleViewDetails(employee.employee_id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base line-clamp-1">{employee.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status || "Unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium line-clamp-1">{employee.designation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="line-clamp-1">{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">ID:</span>
                    <span>{employee.employee_id}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={(e) => handleViewDetails(employee.employee_id, e)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
