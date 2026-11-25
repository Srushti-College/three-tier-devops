import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/employees`);
      const data = await response.json();

      setEmployees(data);
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const addEmployee = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          department
        })
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      setName("");
      setEmail("");
      setDepartment("");

      setMessage("Employee added successfully");

      loadEmployees();
    } catch (error) {
      setMessage("Failed to add employee");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await fetch(`${API_URL}/api/employees/${id}`, {
        method: "DELETE"
      });

      loadEmployees();
    } catch (error) {
      setMessage("Failed to delete employee");
    }
  };

  return (
    <div className="container">
      <h1>Employee Management</h1>

      <form onSubmit={addEmployee}>
        <input
          type="text"
          placeholder="Employee name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />

        <button type="submit">
          Add Employee
        </button>
      </form>

      <p>{message}</p>

      <h2>Employees</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>
                <button
                  onClick={() => deleteEmployee(employee.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
