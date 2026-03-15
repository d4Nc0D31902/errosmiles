import React, { useState } from "react";
import Sidebar from "../components/layouts/Sidebar";

const MINI_WIDTH = 72;
const FULL_WIDTH = 250;

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#20a1df]">
      <div>
        <Sidebar
          open={sidebarOpen}
          toggleOpen={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div
        className="flex-1 flex justify-center transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? FULL_WIDTH : MINI_WIDTH }}
      >
        Home
      </div>
    </div>
  );
};

export default Home;
