import React, { useEffect, useState } from "react";
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";
import { Skeleton } from "@mui/material";
import supabase from "../utils/Supabase";

const MyOdontogram = ({ patientId }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchDentalChart = async () => {
      if (!patientId) return;

      const { data, error } = await supabase
        .from("dental_chart")
        .select("*")
        .eq("patient_id", patientId);

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      if (data) {
        const ids = data
          .filter((t) => t.tooth_number)
          .map((t) => `teeth-${t.tooth_number}`);

        setSelectedIds(ids);
        setLoaded(true);
      }
    };

    fetchDentalChart();
  }, [patientId]);

  const handleChange = (teeth) => {
    console.log("Selected:", teeth);
  };

  if (!loaded) {
    return (
      <div
        className="w-full flex items-center justify-center border rounded-md p-5"
        style={{ height: 600 }}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded-md p-5 bg-gray-100 shadow">
      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 text-center">Odontogram</h3>

      {/* Odontogram */}
      <div className="w-full" style={{ height: 600 }}>
        <Odontogram
          key={selectedIds.join(",")}
          defaultSelected={selectedIds}
          onChange={handleChange}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default MyOdontogram;
