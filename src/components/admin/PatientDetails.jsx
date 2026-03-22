import React, { useState, useEffect } from "react";
import { Input, Skeleton, message, Button, DatePicker, Select } from "antd";
import supabase from "../utils/Supabase";
import dayjs from "dayjs";

const { Option } = Select;

const PatientDetails = ({ patient, loading }) => {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize formData and originalData when patient loads
  useEffect(() => {
    if (patient) {
      const initData = {
        date_of_birth: patient.date_of_birth || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        emergency_contact_name: patient.emergency_contact_name || "",
        emergency_contact_phone: patient.emergency_contact_phone || "",
        allergies: patient.allergies || "",
        medical_conditions: patient.medical_conditions || "",
        notes: patient.notes || "",
      };
      setFormData(initData);
      setOriginalData(initData);
    }
  }, [patient]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!patient?.id) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("patients")
      .update({
        ...formData,
        date_of_birth: formData.date_of_birth
          ? dayjs(formData.date_of_birth).format("YYYY-MM-DD")
          : null,
      })
      .eq("id", patient.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      message.error("Failed to save changes");
      console.error(error);
    } else {
      message.success("Patient updated successfully");
      setOriginalData(formData); // update originalData to new saved state
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
  };

  // Check if formData has changed compared to originalData
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* BASIC INFO */}
      <div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Date of Birth</label>
            <DatePicker
              value={
                formData.date_of_birth ? dayjs(formData.date_of_birth) : null
              }
              onChange={(date) => handleChange("date_of_birth", date)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Gender</label>
            <Select
              value={formData.gender || ""}
              onChange={(value) => handleChange("gender", value)}
              placeholder="Select Gender"
              style={{ width: "100%" }}
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* CONTACT INFO */}
      <div>
        <h3 className="font-semibold mb-2">Contact Information</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div>
            <label>Email</label>
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div>
            <label>Address</label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* EMERGENCY CONTACT */}
      <div>
        <h3 className="font-semibold mb-2">Emergency Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Contact Name</label>
            <Input
              value={formData.emergency_contact_name}
              onChange={(e) =>
                handleChange("emergency_contact_name", e.target.value)
              }
            />
          </div>
          <div>
            <label>Contact Phone</label>
            <Input
              value={formData.emergency_contact_phone}
              onChange={(e) =>
                handleChange("emergency_contact_phone", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* MEDICAL INFO */}
      <div>
        <h3 className="font-semibold mb-2">Medical Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Allergies</label>
            <Input
              value={formData.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
            />
          </div>
          <div>
            <label>Medical Conditions</label>
            <Input
              value={formData.medical_conditions}
              onChange={(e) =>
                handleChange("medical_conditions", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* NOTES */}
      <div>
        <h3 className="font-semibold mb-2">Notes</h3>
        <Input.TextArea
          value={formData.notes}
          rows={3}
          onChange={(e) => handleChange("notes", e.target.value)}
        />
      </div>

      {/* SAVE & CANCEL BUTTONS */}
      {hasChanges && (
        <div className="mt-4 flex gap-2">
          <Button type="primary" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
          <Button onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;