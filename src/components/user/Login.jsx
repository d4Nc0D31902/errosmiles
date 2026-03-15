import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import supabase from "../utils/Supabase";

const Login = () => {
  const [formData, setFormData] = useState({
    eid: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { eid, password } = formData;

    // recreate the generated email used during registration
    const email = `${eid}@errosmiles.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful");
    console.log(data);
  };

  return (
    <div className="h-screen flex p-5 justify-center items-start">
      <form onSubmit={handleLogin} className="w-100 p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <TextField
          label="Employee ID"
          name="eid"
          fullWidth
          margin="normal"
          value={formData.eid}
          onChange={handleChange}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
        />

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
