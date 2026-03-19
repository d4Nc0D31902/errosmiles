import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, message } from "antd";
import supabase from "../utils/Supabase";
import dayjs from "dayjs";

const { Option } = Select;

const AddPatient = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (patient) {
      // If patient exists, prefill the form
      form.setFieldsValue({
        ...patient,
        date_of_birth: patient.date_of_birth
          ? dayjs(patient.date_of_birth)
          : null,
      });
    } else {
      form.resetFields();
    }
  }, [patient, form]);

  const handleSubmit = async (values) => {
    try {
      if (patient) {
        // Update existing patient
        const { error } = await supabase
          .from("patients")
          .update({
            ...values,
            date_of_birth: values.date_of_birth
              ? values.date_of_birth.format("YYYY-MM-DD")
              : null,
          })
          .eq("id", patient.id);

        if (error) throw error;
        message.success("Patient updated successfully!");
      } else {
        // Add new patient
        const { error } = await supabase.from("patients").insert([
          {
            ...values,
            date_of_birth: values.date_of_birth
              ? values.date_of_birth.format("YYYY-MM-DD")
              : null,
          },
        ]);

        if (error) throw error;
        message.success("Patient added successfully!");
      }

      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to save patient.");
    }
  };

  return (
    <Modal
      title={patient ? "View / Edit Patient" : "Add Patient"}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Middle Name" name="middle_name">
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Date of Birth" name="date_of_birth">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Gender" name="gender">
          <Select>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input type="email" />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Emergency Contact Name" name="emergency_contact_name">
          <Input />
        </Form.Item>

        <Form.Item
          label="Emergency Contact Phone"
          name="emergency_contact_phone"
        >
          <Input />
        </Form.Item>

        <Form.Item label="Allergies" name="allergies">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Medical Conditions" name="medical_conditions">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPatient;
