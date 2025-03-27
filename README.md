# Ishanya Foundation Management Portal  

## Project Overview  
The Ishanya Foundation Management Portal is a hybrid Customer Relationship Management (CRM) system designed to digitize and streamline the operations of the foundation. It replaces traditional Excel-based data management with a structured system that provides role-based access to administrators, HR personnel, educators, and parents. The system includes features for managing student and employee data, attendance tracking, payroll processing, student progress reports, announcements, discussions, and automated notifications.  

## Tech Stack  
- Frontend: React.js, TypeScript  
- Backend: Flask API, FastAPI, Python  
- Microservices: SupaBase REST, LangChain, Google Cloud Platform (GCP)  
- Deployment: Vercel (Frontend), Render (Backend & Microservices)  

## Features & Functionalities  

### 1. Role-Based Login  
Users can log in with specific role-based access levels:  
- Administrator – Full access to all system functionalities, including data management, analytics, and announcements.  
- HR – Access to employee records, attendance tracking, payroll management, and the discussion forum.  
- Educator – Access to student records, attendance, reports, and task management through a Kanban board.  
- Parent – Access to their child’s profile, performance reports, and direct communication with educators.  

### 2. Administrator Dashboard  
- Analytics & Insights: View real-time data and trends, including center-wise, program-wise, and gender-based analytics.  
- Center & Program Management: View a list of centers, their programs, and associated students/employees.  
- Student & Employee Management:  
  - View and edit student/employee details.  
  - Add new students/employees manually, via voice input, or through bulk CSV upload.  
- Student Reports: View and download student progress reports.  
- Announcement Board: Post important announcements, visible to all employees.  
- Chatbot Integration: Fetch student, employee, or program details quickly via an AI-powered chatbot connected to the database.  
- Parent Form Review: Review and either approve or reject forms submitted by parents.  

### 3. HR Dashboard  
- Employee Management: View and update employee details.  
- Attendance Tracking: Mark employee attendance and generate attendance reports.  
- Payroll Management: Input payroll data and process salary details.  
- Discussion Forum: A communication space for HR personnel and employees.  

### 4. Educator Dashboard  
- Student Management: View, update, and manage student records.  
- Attendance Tracking: Mark student attendance and view attendance history.  
- Student Reports: Input and update student performance reports.  
- Task Management: A Kanban board to organize and track educator tasks efficiently.  

### 5. Parent Portal  
- Child’s Profile: View details, attendance, and academic reports of their child.  
- Educator Contact: Directly communicate with the assigned educator.  
- Automated Notifications: Receive WhatsApp notifications when new reports are uploaded or student scores are updated by educators.  

## Installation & Setup  

### 1. Clone the Repository  
To set up the project on your local system, clone the repository using the following command:  
bash
git clone <repository_url>
cd <project_folder>


### 2. Install Dependencies  
Run the following command to install all required dependencies for the frontend:  
bash
npm install


### 3. Start the Development Server  
Use the following command to start the frontend development server:  
bash
npm run dev

This will start the Next.js application, typically running on http://localhost:3000/.  

### 4. Backend Setup  
Ensure that the backend services (Flask API and FastAPI) are running.  

#### Setting up the Python Virtual Environment  
Create and activate a virtual environment to manage dependencies:  
bash
python -m venv venv
source venv/bin/activate  # On Windows, use venv\Scripts\activate


#### Install Backend Dependencies  
bash
pip install -r requirements.txt


#### Run Flask API  
bash
flask run

The Flask API will start on http://localhost:5000/.  

#### Run FastAPI  
bash
uvicorn main:app --reload

The FastAPI service will run on http://localhost:8000/.  

### 5. Database Configuration  
- The system uses Supabase REST as the backend database. Ensure Supabase is configured correctly by providing the required API keys and database credentials in the environment variables.  

### 6. Deployment  
- Frontend: Deployed using Vercel  
- Backend: Deployed on Render (Flask API, FastAPI)  
- Microservices: Hosted on Google Cloud Platform (GCP)  

## Usage Instructions  

1. Logging In: Users should enter their credentials and select their role. Based on the role, different dashboards will be accessible.  
2. Managing Students & Employees:  
   - Administrators can add/edit student and employee details, upload CSV files, and use voice input for data entry.  
3. HR Tasks:  
   - HR can view employee lists, track attendance, and input payroll data.  
4. Educator Workflow:  
   - Educators can manage student details, track attendance, update reports, and organize tasks using a Kanban board.  
5. Parent Access:  
   - Parents can access their child’s profile, view performance reports, and receive notifications about updates.  

## Contributing  

### 1. Fork the Repository  
Click the "Fork" button on the repository page to create your own copy of the project.  

### 2. Create a Feature Branch  
Create a new branch for your feature or bug fix:  
bash
git checkout -b feature-name


### 3. Commit Your Changes  
After making changes, commit them using:  
bash
git commit -m "Added new feature"


### 4. Push to GitHub  
Push your changes to your forked repository:  
bash
git push origin feature-name


### 5. Create a Pull Request  
Go to the original repository, open a pull request, and describe the changes you made.
