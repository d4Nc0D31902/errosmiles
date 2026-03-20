import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, message } from "antd";
import supabase from "../utils/Supabase";
import dayjs from "dayjs";

const { Option } = Select;

const AddPatient = ({ visible, onClose, patient, onSuccess }) => {
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
      onSuccess?.();
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
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Name */}
        <div className="flex gap-2 w-full">
          <Form.Item
            className="flex-1"
            label="First Name"
            name="first_name"
            rules={[{ required: true }]}
            required
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="flex-1"
            label="Middle Name"
            name="middle_name"
            required
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="flex-1"
            label="Last Name"
            name="last_name"
            rules={[{ required: true }]}
            required
          >
            <Input />
          </Form.Item>
        </div>

        {/* Birthday & Gender */}
        <div className="flex gap-2 w-full">
          <Form.Item
            label="Date of Birth"
            name="date_of_birth"
            className="flex-1"
            required
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Gender" name="gender" className="flex-1" required>
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Contact */}
        <div className="flex gap-2 w-full">
          <Form.Item label="Phone" name="phone" className="flex-1" required>
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email" className="flex-1" required>
            <Input type="email" />
          </Form.Item>
        </div>

        {/* Address */}
        <Form.Item label="Address" name="address" required>
          <Input.TextArea rows={2} />
        </Form.Item>

        <div className="flex gap-2 w-full">
          <Form.Item
            className="flex-1"
            label="Emergency Contact Name"
            name="emergency_contact_name"
            required
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="flex-1"
            label="Emergency Contact Phone"
            name="emergency_contact_phone"
            required
          >
            <Input />
          </Form.Item>
        </div>

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
