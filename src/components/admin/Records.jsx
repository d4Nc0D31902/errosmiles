import React, { useEffect, useState } from "react";
import supabase from "../utils/Supabase";
import {
  Typography,
  Skeleton,
  Table,
  Input,
  Button,
  Modal,
  Form,
  DatePicker,
  Select,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const Records = ({ patientId, onSuccess }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
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

  const showModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        record_date: dayjs(record.record_date),
        tooth_number: record.tooth_number,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
      form.setFieldsValue({ record_date: dayjs() });
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const userId = (await supabase.auth.getUser()).data.user.id;

      // Determine the record date:
      const recordDate = editingRecord
        ? editingRecord.record_date // keep existing for edits
        : dayjs().format("YYYY-MM-DD"); // default to today for new records

      if (editingRecord) {
        // Update existing record
        const { error } = await supabase
          .from("patient_records")
          .update({
            record_date: recordDate,
            tooth_number: values.tooth_number,
            diagnosis: values.diagnosis,
            treatment: values.treatment,
          })
          .eq("id", editingRecord.key);

        if (error) {
          console.error("Update error:", error);
          return;
        }
      } else {
        // Insert new record
        const { error } = await supabase.from("patient_records").insert([
          {
            patient_id: patientId,
            dentist_id: userId,
            record_date: recordDate,
            tooth_number: values.tooth_number,
            diagnosis: values.diagnosis,
            treatment: values.treatment,
          },
        ]);

        if (error) {
          console.error("Insert error:", error);
          return;
        }
      }

      // Refresh table
      await fetchRecords(pagination.current, pagination.pageSize);

      // Notify parent
      if (onSuccess) onSuccess();

      form.resetFields();
      setEditingRecord(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleCancel = () => setIsModalOpen(false);

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
        onRow={(record) => ({
          onClick: () => {
            const originalRecord = records.find((r) => r.id === record.key);
            showModal(originalRecord);
          },
          style: { cursor: "pointer" },
        })}
        title={() => (
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Records</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              />
            </div>
          </div>
        )}
      />
      <Modal
        title="Add Record"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tooth Number"
            name="tooth_number"
            rules={[{ required: true, message: "Please select tooth number" }]}
          >
            <Select placeholder="Select tooth number">
              {[
                // Upper Right (1)
                "18",
                "17",
                "16",
                "15",
                "14",
                "13",
                "12",
                "11",
                // Upper Left (2)
                "21",
                "22",
                "23",
                "24",
                "25",
                "26",
                "27",
                "28",
                // Lower Left (3)
                "38",
                "37",
                "36",
                "35",
                "34",
                "33",
                "32",
                "31",
                // Lower Right (4)
                "41",
                "42",
                "43",
                "44",
                "45",
                "46",
                "47",
                "48",
              ].map((tooth) => (
                <Select.Option key={tooth} value={tooth}>
                  Tooth {tooth}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Diagnosis" name="diagnosis">
            <Input.TextArea rows={3} placeholder="Enter diagnosis" />
          </Form.Item>

          <Form.Item label="Treatment" name="treatment">
            <Input.TextArea rows={3} placeholder="Enter treatment" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Records;
