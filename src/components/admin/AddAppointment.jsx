import React, { useState, useEffect } from "react";
import supabase from "../utils/Supabase";
import { Button, DatePicker, Input, Select, message, Space } from "antd";

const { TextArea } = Input;

const AddAppointment = ({ patientId, onClose, onSuccess }) => {
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [dentistId, setDentistId] = useState(null);
  const [dentists, setDentists] = useState([]);
  const [reasons, setReasons] = useState([""]); // array of reasons
  const [loading, setLoading] = useState(false);

  // Fetch dentists on mount
  useEffect(() => {
    const fetchDentists = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, firstName, middleName, lastName")
        .eq("position", "dentist"); // only dentists

      if (!error) setDentists(data);
      else console.error(error);
    };
    fetchDentists();
  }, []);

  // Update reason at a specific index
  const updateReason = (index, value) => {
    const newReasons = [...reasons];
    newReasons[index] = value;
    setReasons(newReasons);
  };

  // Add a new empty reason field
  const addReason = () => setReasons([...reasons, ""]);

  // Remove a reason field
  const removeReason = (index) => {
    const newReasons = reasons.filter((_, i) => i !== index);
    setReasons(newReasons);
  };

  const handleCreate = async () => {
    if (!appointmentDate || !dentistId) {
      message.error("Please select a dentist and date");
      return;
    }

    setLoading(true);

    // Insert appointment first
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .insert([
        {
          patient_id: patientId,
          dentist_id: dentistId,
          appointment_date: appointmentDate.toISOString(),
          // status omitted; DB default 'scheduled' will apply
        },
      ])
      .select("id"); // return the id

    if (appointmentError) {
      console.error(appointmentError);
      message.error("Failed to create appointment");
      setLoading(false);
      return;
    }

    const appointmentId = appointmentData[0].id;

    // Insert reasons if any non-empty
    const reasonEntries = reasons
      .filter((r) => r.trim() !== "")
      .map((r) => ({ appointment_id: appointmentId, reason_text: r.trim() }));

    if (reasonEntries.length) {
      const { error: reasonsError } = await supabase
        .from("appointment_reasons")
        .insert(reasonEntries);

      if (reasonsError) {
        console.error(reasonsError);
        message.error("Appointment created but failed to save reasons");
        setLoading(false);
        onClose();
        return;
      }
    }

    message.success("Appointment created successfully");
    setLoading(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <DatePicker
        showTime
        onChange={(value) => setAppointmentDate(value)}
        style={{ width: "100%" }}
        placeholder="Select appointment date"
      />

      <Select
        placeholder="Select Dentist"
        value={dentistId}
        onChange={(val) => setDentistId(val)}
        options={dentists.map((d) => ({
          label: `${d.firstName} ${d.middleName} ${d.lastName}`,
          value: d.id,
        }))}
        style={{ width: "100%" }}
      />

      <div>
        <strong>Appointment Reasons (optional)</strong>
        <Space direction="vertical" style={{ width: "100%" }}>
          {reasons.map((r, index) => (
            <div key={index} className="flex gap-2">
              <TextArea
                value={r}
                onChange={(e) => updateReason(index, e.target.value)}
                rows={2}
                placeholder="Enter reason"
              />
              {reasons.length > 1 && (
                <Button onClick={() => removeReason(index)}>Remove</Button>
              )}
            </div>
          ))}
          <Button type="dashed" onClick={addReason}>
            Add Another Reason
          </Button>
        </Space>
      </div>

      <Button type="primary" loading={loading} onClick={handleCreate}>
        Create
      </Button>
    </div>
  );
};

export default AddAppointment;
