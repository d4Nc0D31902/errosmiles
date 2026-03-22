import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../layouts/Sidebar";
import supabase from "../utils/Supabase";
import {
  Breadcrumbs,
  Link,
  Typography,
  Tabs,
  Tab,
  Box,
  Divider,
  Skeleton,
} from "@mui/material";
import { Table, Input } from "antd";

const MINI_WIDTH = 72;
const FULL_WIDTH = 250;

const ViewPatient = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  const [tabValue, setTabValue] = useState(0);

  const [loading, setLoading] = useState(true);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setPatient(data);

      setLoading(false);
    };

    if (id) fetchPatient();
  }, [id]);

  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Middle Name",
      dataIndex: "middle_name",
      key: "middle_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
  ];

  const dataSource = patient ? [patient] : [];

  return (
    <div className="min-h-screen flex bg-[#20a1df] p-6">
      <div>
        <Sidebar
          open={sidebarOpen}
          toggleOpen={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div
        className="flex-1 flex flex-col items-start justify-start transition-all duration-300 rounded-md bg-white p-5 gap-5"
        style={{ marginLeft: sidebarOpen ? FULL_WIDTH : MINI_WIDTH }}
      >
        {/* Breadcrumb */}
        <div className="flex w-full p-3">
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/patients")}
            >
              Patients
            </Link>

            <Typography color="text.primary">
              {loading ? <Skeleton width={80} /> : "Patient"}
            </Typography>
          </Breadcrumbs>
        </div>
        {/* Divider */}
        <Divider className="w-full" />
        {/* Patient Name */}
        <div className="w-full text-xl">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton height={40} />
              <Skeleton height={40} />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              bordered
              rowKey="id"
              size="middle"
              style={{ fontSize: "18px" }}
              components={{
                header: {
                  cell: (props) => (
                    <th
                      {...props}
                      style={{ fontSize: "19px", fontWeight: 600 }}
                    />
                  ),
                },
                body: {
                  cell: (props) => (
                    <td {...props} style={{ fontSize: "18px" }} />
                  ),
                },
              }}
            />
          )}
        </div>
        {/* Tabs */}
        <div className="w-full">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Medical Records" />
              <Tab label="Appointments" />
            </Tabs>
          </Box>

          <Box className="p-4">
            {tabValue === 0 && (
              <div className="w-full flex flex-col">
                <div className="flex gap-5 w-full justify-center">
                  <div>
                    <label>Date of Birth</label>
                    {loading ? (
                      <Skeleton width={150} height={40} />
                    ) : (
                      <Input value={patient?.date_of_birth} disabled />
                    )}
                  </div>

                  <div>
                    <label>Gender</label>
                    {loading ? (
                      <Skeleton width={150} height={40} />
                    ) : (
                      <Input value={patient?.gender || ""} disabled />
                    )}
                  </div>
                </div>
              </div>
            )}
            {tabValue === 1 && <div>Medical Records Content</div>}
            {tabValue === 2 && <div>Appointments Content</div>}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;
