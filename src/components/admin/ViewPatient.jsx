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
import { Button, Table, Modal, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import MyOdontogram from "./Odontogram";
import Records from "./Records";
import PatientDetails from "./PatientDetails";
import AddAppointment from "./AddAppointment";
import UpdateAppointment from "./UpdateAppointment";

const MINI_WIDTH = 72;
const FULL_WIDTH = 250;

const ViewPatient = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  const showEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalVisible(true);
  };
  const hideEditModal = () => {
    setSelectedAppointment(null);
    setIsEditModalVisible(false);
  };

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

  const fetchAppointments = async () => {
    if (!id) return;

    setAppointmentsLoading(true);

    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", id)
      .order("appointment_date", { ascending: false });

    if (appointmentsError) {
      console.error(appointmentsError);
      setAppointments([]);
      setAppointmentsLoading(false);
      return;
    }

    const appointmentsWithReason = await Promise.all(
      appointmentsData.map(async (appt) => {
        const { data: reasonsData } = await supabase
          .from("appointment_reasons")
          .select("reason_text")
          .eq("appointment_id", appt.id)
          .order("created_at", { ascending: false })
          .limit(1);

        return {
          ...appt,
          reason:
            reasonsData && reasonsData.length ? reasonsData[0].reason_text : "",
        };
      }),
    );

    setAppointments(appointmentsWithReason);
    setAppointmentsLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
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

  const appointmentColumns = [
    {
      title: "Date",
      dataIndex: "appointment_date",
      key: "appointment_date",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "completed"
            ? "green"
            : status === "scheduled"
              ? "blue"
              : status === "cancelled"
                ? "red"
                : "default";

        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
  ];

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
        {/* Breadcrumb & Create Appointment */}
        <div className="flex w-full p-3 justify-between">
          <div>
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
          <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Create Appointment
            </Button>
          </div>
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
            {/* Overview */}
            {tabValue === 0 && (
              <PatientDetails patient={patient} loading={loading} />
            )}
            {/* Records */}
            {tabValue === 1 && (
              <div className="flex gap-2">
                {/* Odontogram */}
                <div className="p-4 flex-1 bg-gray-100 rounded-md ">
                  <MyOdontogram patientId={id} />
                </div>
                {/* Records */}
                <div className="flex-1 bg-gray-100 rounded-md p-5">
                  <Records patientId={id} />
                </div>
              </div>
            )}
            {/* Appointments */}
            {tabValue === 2 && (
              <div className="w-full">
                {appointmentsLoading ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton height={40} />
                    <Skeleton height={40} />
                    <Skeleton height={40} />
                  </div>
                ) : (
                  <Table
                    columns={appointmentColumns}
                    dataSource={appointments}
                    rowKey="id"
                    bordered
                    pagination={{ pageSize: 10 }}
                    onRow={(record) => ({
                      onClick: () => showEditModal(record),
                      style: { cursor: "pointer" },
                    })}
                  />
                )}
              </div>
            )}
          </Box>
        </div>
        {/* Add Appointment Modal */}
        <Modal
          title="Create Appointment"
          open={isModalVisible}
          onCancel={hideModal}
          footer={null}
          width={600}
        >
          <AddAppointment
            patientId={id}
            onClose={hideModal}
            onSuccess={() => fetchAppointments()}
          />
        </Modal>
        {/* Update Appointment */}
        <Modal
          open={isEditModalVisible}
          onCancel={hideEditModal}
          footer={null}
          width={400}
        >
          {selectedAppointment && (
            <UpdateAppointment
              appointment={selectedAppointment}
              onClose={hideEditModal}
              onSuccess={() => fetchAppointments()}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ViewPatient;
