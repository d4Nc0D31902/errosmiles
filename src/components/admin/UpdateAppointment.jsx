import React, { useState } from "react";
import { Modal, Select, Button, message } from "antd";
import supabase from "../utils/Supabase";

const { Option } = Select;

const UpdateAppointment = ({ appointment, onClose, onSuccess }) => {
  const [status, setStatus] = useState(appointment.status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointment.id);

    if (error) {
      message.error("Failed to update appointment");
      console.error(error);
    } else {
      message.success("Appointment updated");
      if (onSuccess) onSuccess();
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <strong>Update Status:</strong>
        <Select
          value={status}
          onChange={setStatus}
          style={{ width: "100%", marginTop: 8 }}
        >
          <Option value="scheduled">Scheduled</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" loading={loading} onClick={handleUpdate}>
          Update
        </Button>
      </div>
    </div>
  );
};

export default UpdateAppointment;
