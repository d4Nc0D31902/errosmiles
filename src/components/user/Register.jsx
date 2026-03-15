import React, { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import supabase from "../utils/Supabase";

const Register = () => {
  const positions = ["Dentist", "Nurse"];

  const [formData, setFormData] = useState({
    eid: "",
    firstName: "",
    middleName: "",
    lastName: "",
    password: "",
    position: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { eid, password, firstName, middleName, lastName, position } =
      formData;

    // auto generate email
    const email = `${eid}@errosmiles.com`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      await supabase.from("profiles").insert({
        id: user.id,
        eid,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        position,
      });
    }

    alert("User registered successfully");
  };

  return (
    <div className="h-screen flex justify-center items-start">
      <form onSubmit={handleRegister} className="w-100 p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

        <TextField
          label="Employee ID"
          name="eid"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <div className="w-full flex gap-2">
          <TextField
            label="First Name"
            name="firstName"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />

          <TextField
            label="Middle Name"
            name="middleName"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
        </div>

        <TextField
          label="Last Name"
          name="lastName"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <TextField
          label="Position"
          name="position"
          select
          fullWidth
          margin="normal"
          value={formData.position}
          onChange={handleChange}
        >
          {positions.map((pos) => (
            <MenuItem key={pos} value={pos}>
              {pos}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </div>
  );
};

export default Register;
