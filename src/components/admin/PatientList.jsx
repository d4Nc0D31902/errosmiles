import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button } from "antd";
import { SearchOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import Sidebar from "../layouts/Sidebar";
import supabase from "../utils/Supabase";
import dayjs from "dayjs";
import AddPatient from "./AddPatient";

const MINI_WIDTH = 72;
const FULL_WIDTH = 250;

const PatientList = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const openAddModal = () => {
    setSelectedPatient(null);
    setModalVisible(true);
  };

  const fetchPatients = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error fetching patients:", error.message);
    } else {
      setPatients(data);
      setPagination((prev) => ({
        ...prev,
        total: data.length,
      }));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Columns definition
  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Date of Birth",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      align: "center",
      render: (dob) => (dob ? dayjs(dob).format("MM/DD/YYYY") : ""),
    },
  ];

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Slice for current page
  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const paginatedPatients = filteredPatients.slice(start, end);

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
            columns={columns}
            dataSource={paginatedPatients}
            loading={loading}
            rowKey="id"
            bordered
            rowClassName={() => "cursor-pointer"}
            onRow={(record) => ({
              onClick: () => {
                console.log("Selected patient id:", record.id);
                navigate(`/patient/${record.id}`);
              },
            })}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredPatients.length,
              pageSizeOptions: ["20", "50", "100"],
              showSizeChanger: true,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, current: page, pageSize });
              },
              onShowSizeChange: (current, size) => {
                setPagination({ ...pagination, current: 1, pageSize: size });
              },
            }}
            title={() => (
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Patient List</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search..."
                    prefix={<SearchOutlined />}
                    style={{ width: 200 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openAddModal}
                  />
                </div>
              </div>
            )}
          />
        </div>

        {/* Place the modal here, after the table */}
        <AddPatient
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          patient={selectedPatient}
          onSuccess={fetchPatients}
        />
      </div>
    </div>
  );
};

export default PatientList;
