import React from "react";
import Sidebar from "../layouts/Sidebar";

const Header = () => {
  return (
    <div className="border-1 h-15 px-10 flex justify-between items-center">
      <Sidebar />
      <div className="bg-[#D3D3D3] rounded-full h-13 w-13 border" />
    </div>
  );
};

export default Header;
