// Records.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/Supabase";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Skeleton,
} from "@mui/material";

const Records = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("patient_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("visit_date", { ascending: false });

      if (!error) {
        setRecords(data || []);
      } else {
        console.error("Error fetching patient records:", error);
      }

      setLoading(false);
    };

    if (patientId) fetchRecords();
  }, [patientId]);

  if (loading) {
    return (
      <Box className="p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={80} className="mb-2" />
        ))}
      </Box>
    );
  }

  if (!records.length) {
    return <Typography className="p-4">No records found.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, p: 2 }}>
      <Stepper orientation="vertical" nonLinear>
        {records.map((record, index) => (
          <Step key={record.id} active>
            <StepLabel>
              {record.visit_date
                ? new Date(record.visit_date).toLocaleDateString()
                : "Unknown Date"}{" "}
              - {record.chief_complaint || "No chief complaint"}
            </StepLabel>
            <StepContent>
              <Typography>
                <strong>Dentist:</strong> {record.dentist_name || "N/A"}
              </Typography>
              <Typography>
                <strong>Diagnosis:</strong> {record.diagnosis || "N/A"}
              </Typography>
              <Typography>
                <strong>Treatment Plan:</strong>{" "}
                {record.treatment_plan || "N/A"}
              </Typography>
              <Typography>
                <strong>Procedures Done:</strong>{" "}
                {record.procedures_done || "N/A"}
              </Typography>
              <Typography>
                <strong>Tooth Number:</strong> {record.tooth_number || "N/A"}
              </Typography>
              <Typography>
                <strong>Procedure Type:</strong>{" "}
                {record.procedure_type || "N/A"}
              </Typography>
              <Typography>
                <strong>Prescription:</strong> {record.prescription || "N/A"}
              </Typography>
              <Typography>
                <strong>Cost:</strong> {record.cost ? `$${record.cost}` : "N/A"}
              </Typography>
              <Typography>
                <strong>Payment Status:</strong>{" "}
                {record.payment_status || "N/A"}
              </Typography>
              {record.notes && (
                <Typography>
                  <strong>Notes:</strong> {record.notes}
                </Typography>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default Records;
