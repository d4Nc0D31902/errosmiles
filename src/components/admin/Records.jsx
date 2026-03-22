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

      // Fetch patient records
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

      // Fetch notes and dentist profiles for each record
      const recordsWithExtras = await Promise.all(
        recordData.map(async (record) => {
          // Fetch dentist profile
          const { data: dentistData } = await supabase
            .from("profiles")
            .select("firstName, lastName")
            .eq("id", record.dentist_id)
            .single();

          // Fetch notes
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
        {records.map((record) => (
          <Step key={record.id} active>
            <StepLabel>
              {record.record_date
                ? new Date(record.record_date).toLocaleDateString()
                : "Unknown Date"}
            </StepLabel>
            <StepContent>
              <Typography>
                <strong>Dentist:</strong>{" "}
                {record.dentist
                  ? `${record.dentist.firstName} ${record.dentist.lastName}`
                  : "N/A"}
              </Typography>
              <Typography>
                <strong>Diagnosis:</strong> {record.diagnosis || "N/A"}
              </Typography>
              <Typography>
                <strong>Treatment:</strong> {record.treatment || "N/A"}
              </Typography>
              <Typography>
                <strong>Tooth Number:</strong> {record.tooth_number || "N/A"}
              </Typography>

              {record.notes.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Notes:</Typography>
                  {record.notes.map((note) => (
                    <Typography
                      key={note.id}
                      variant="body2"
                      sx={{ ml: 2, mb: 0.5 }}
                    >
                      - {note.note_text}
                    </Typography>
                  ))}
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default Records;
