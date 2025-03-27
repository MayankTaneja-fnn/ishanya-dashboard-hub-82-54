# Ishanya Foundation Management Portal  

## Project Overview  
The Ishanya Foundation Management Portal is a hybrid Customer Relationship Management (CRM) system designed to digitize and streamline the operations of the foundation. It replaces traditional Excel-based data management with a structured system that provides role-based access to administrators, HR personnel, educators, and parents. The system includes features for managing student and employee data, attendance tracking, payroll processing, student progress reports, announcements, discussions, and automated notifications.  

## Tech Stack  
- Frontend: React.js, TypeScript  
- Backend: Flask API, FastAPI, Python  
- Microservices: SupaBase REST, LangChain, Google Cloud Platform (GCP)  
- Deployment: Vercel (Frontend), Render (Backend & Microservices)  

## Deployed Link
https://ishanya-portal.vercel.app/

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
 
```bash```
```git clone <repository_url>```
```cd <project_folder>```


### 2. Install Dependencies  
Run the following command to install all required dependencies for the frontend:  

```bash```
```npm install```


### 3. Start the Development Server  
Use the following command to start the frontend development server:  

```bash```
```npm run dev```

This will start the Next.js application, typically running on http://localhost:3000/.  

### 4. Backend Setup  
Ensure that the backend services (Flask API and FastAPI) are running.  

#### Setting up the Python Virtual Environment  
Create and activate a virtual environment to manage dependencies:  

```bash```
```python -m venv venv```

source venv/bin/activate  # On Windows, use venv\Scripts\activate


#### Install Backend Dependencies 
 
```bash```
```pip install -r requirements.txt```


#### Run Flask API  

```bash```
```flask run```

The Flask API will start on http://localhost:5000/.  

#### Run FastAPI  

```bash```
```uvicorn main:app --reload```

The FastAPI service will run on http://localhost:8000/.  


