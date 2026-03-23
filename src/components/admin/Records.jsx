import React, { useEffect, useState } from "react";
import supabase from "../utils/Supabase";
import { Steps, Typography, Skeleton, Table } from "antd";

const { Step } = Steps;

const Records = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      title: "Dentist",
      dataIndex: "dentist",
      key: "dentist",
    },
    {
      title: "Diagnosis",
      dataIndex: "diagnosis",
      key: "diagnosis",
    },
    {
      title: "Treatment",
      dataIndex: "treatment",
      key: "treatment",
    },
  ];

  const getTableData = (record) => [
    {
      key: record.id,
      dentist: record.dentist
        ? `${record.dentist.firstName} ${record.dentist.lastName}`
        : "N/A",
      diagnosis: record.diagnosis || "N/A",
      treatment: record.treatment || "N/A",
    },
  ];

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);

      const { data: recordData, error: recordError } = await supabase
        .from("patient_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("record_date", { ascending: false });

      if (recordError) {
        console.error("Error fetching patient records:", recordError);
        setLoading(false);
        return;
      }

      if (!recordData || recordData.length === 0) {
        setRecords([]);
        setLoading(false);
        return;
      }

      const recordsWithExtras = await Promise.all(
        recordData.map(async (record) => {
          const { data: dentistData } = await supabase
            .from("profiles")
            .select("firstName, lastName")
            .eq("id", record.dentist_id)
            .single();

          const { data: notesData } = await supabase
            .from("patient_record_notes")
            .select("id, note_text, created_at")
            .eq("record_id", record.id)
            .order("created_at", { ascending: true });

          return {
            ...record,
            dentist: dentistData || null,
            notes: notesData || [],
          };
        }),
      );

      setRecords(recordsWithExtras);
      setLoading(false);
    };

    if (patientId) fetchRecords();
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} active paragraph={{ rows: 4 }} className="mb-4" />
        ))}
      </div>
    );
  }

  if (!records.length) {
    return <Typography className="p-4">No records found.</Typography>;
  }

  return (
    <div className="p-5 w-full h-[650px] overflow-auto">
      <Steps direction="vertical" progressDot>
        {records.map((record) => (
          <Step
            key={record.id}
            title={
              <div className="bg-white rounded-md p-5 shadow-sm mb-5 flex flex-col gap-2 w-full">
                <Typography>
                  <strong>Date:</strong>{" "}
                  {record.record_date
                    ? new Date(record.record_date).toLocaleDateString()
                    : "N/A"}
                </Typography>

                <Table
                  columns={columns}
                  dataSource={getTableData(record)}
                  pagination={false}
                  size="large"
                  bordered
                />
              </div>
            }
          />
        ))}
      </Steps>
    </div>
  );
};

export default Records;
