import React, { useState } from "react";
import { Table, Input, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import Sidebar from "../layouts/Sidebar";

const MINI_WIDTH = 72;
const FULL_WIDTH = 250;

const PatientList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample data for the table
  const dataSource = [
    {
      key: "1",
      eid: "E001",
      firstName: "John",
      lastName: "Doe",
      dob: "1990-01-01",
      position: "Patient",
    },
    {
      key: "2",
      eid: "E002",
      firstName: "Jane",
      lastName: "Smith",
      dob: "1985-06-15",
      position: "Patient",
    },
  ];

  // Columns definition
  const columns = [
    {
      title: "Employee ID",
      dataIndex: "eid",
      key: "eid",
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      key: "dob",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#20a1df]">
      <Sidebar
        open={sidebarOpen}
        toggleOpen={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? FULL_WIDTH : MINI_WIDTH }}
      >
        <div className="w-full">
          <Table
            dataSource={dataSource}
            columns={columns}
            title={() => (
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Patient List</h3>

                {/* Search bar and icon button */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search patients"
                    prefix={<SearchOutlined />}
                    style={{ width: 200 }}
                    onChange={(e) => {
                      // Optionally handle search filtering here
                      console.log("Search:", e.target.value);
                    }}
                  />

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => console.log("Add patient")}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientList;
