import React, { useEffect, useState } from "react";
import supabase from "../utils/Supabase";
import { Typography, Skeleton, Table } from "antd";

const Records = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Tooth #",
      dataIndex: "tooth",
      key: "tooth",
    },
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

  const getTableData = (records) =>
    records.map((record) => ({
      key: record.id,
      date: record.record_date
        ? new Date(record.record_date).toLocaleDateString()
        : "N/A",
      tooth: record.tooth_number || "N/A",
      dentist: record.dentist
        ? `${record.dentist.firstName} ${record.dentist.lastName}`
        : "N/A",
      diagnosis: record.diagnosis || "N/A",
      treatment: record.treatment || "N/A",
    }));

  const fetchRecords = async (page = 1, pageSize = 10) => {
    setLoading(true);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: recordData,
      error,
      count,
    } = await supabase
      .from("patient_records")
      .select("*", { count: "exact" })
      .eq("patient_id", patientId)
      .order("record_date", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching patient records:", error);
      setLoading(false);
      return;
    }

    if (!recordData || recordData.length === 0) {
      setRecords([]);
      setPagination((prev) => ({ ...prev, total: count || 0 }));
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

        return {
          ...record,
          dentist: dentistData || null,
        };
      }),
    );

    setRecords(recordsWithExtras);
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
      total: count || 0,
    }));

    setLoading(false);
  };

  useEffect(() => {
    if (patientId) {
      fetchRecords(pagination.current, pagination.pageSize);
    }
  }, [patientId]);

  const handleTableChange = (paginationConfig) => {
    fetchRecords(paginationConfig.current, paginationConfig.pageSize);
  };

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
    <div className="p-5 w-full">
      <Table
        columns={columns}
        dataSource={getTableData(records)}
        bordered
        size="large"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default Records;
