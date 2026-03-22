import React, { useEffect, useState } from "react";
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";
import supabase from "../utils/Supabase";

export default function MyOdontogram({ patientId }) {
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
        // convert DB → odontogram IDs
        const ids = data
          .filter((t) => t.tooth_number) // safety
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

  // prevent rendering before data is ready
  if (!loaded) return <div>Loading odontogram...</div>;

  return (
    <Odontogram
      key={selectedIds.join(",")} // 🔥 forces re-mount when data changes
      defaultSelected={selectedIds}
      onChange={handleChange}
      className="h-[500px]"
    />
  );
}
