import React, { useState, useEffect, useRef } from "react";
import { Drawer, Box, Avatar, Menu, MenuItem } from "@mui/material";
import {
  MenuOutlined,
  ExpandMore,
  ExpandLess,
  Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../utils/Supabase";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import PersonalInjuryIcon from "@mui/icons-material/PersonalInjury";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import GroupIcon from "@mui/icons-material/Group";
import PaymentsIcon from "@mui/icons-material/Payments";
import BarChartIcon from "@mui/icons-material/BarChart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";

const MINI_WIDTH = 72;
const FULL_WIDTH = 250;

const Sidebar = ({ open, toggleOpen }) => {
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [dropdownHeight, setDropdownHeight] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // Get current authenticated user
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setUserProfile(profile);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(documentsOpen ? dropdownRef.current.scrollHeight : 0);
    }
  }, [documentsOpen]);

  const handleNavigation = (path, isSubItem = false) => {
    if (path) navigate(path);
    if (!isSubItem) setDocumentsOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
      localStorage.removeItem("loginTime");

      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert(err.message || "Failed to logout.");
    }
  };

  const navCategories = [
    {
      items: [
        // { label: "Home", icon: <HomeOutlinedIcon />, path: "/" },
        { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
      ],
    },
    {
      category: "Clinic",
      items: [
        // { label: "Orders", icon: <ShoppingBagIcon />, path: "/orders" },
        {
          label: "Reservations",
          icon: <EventAvailableIcon />,
          path: "/reservations",
        },
        { label: "Patients", icon: <PersonalInjuryIcon />, path: "/patients" },
        {
          label: "Treatments",
          icon: <MedicalServicesIcon />,
          path: "/treatments",
        },
        { label: "Staff List", icon: <GroupIcon />, path: "/staffs" },
      ],
    },
    {
      category: "Finance",
      items: [
        { label: "Accounts", icon: <PaymentsIcon />, path: "/accounts" },
        { label: "Sales", icon: <BarChartIcon />, path: "/sales" },
        { label: "Purchases", icon: <ReceiptIcon />, path: "/purchases" },
        {
          label: "Payment Method",
          icon: <CreditCardIcon />,
          path: "/payment-method",
        },
      ],
    },
    {
      category: "Physical Asset",
      items: [
        { label: "Stocks", icon: <MedicationIcon />, path: "/stocks" },
        { label: "Peripherals", icon: <BiotechIcon />, path: "/peripherals" },
      ],
    },
  ];

  const botNav = [
    { label: "Settings", icon: <SettingsIcon /> },
    { label: "Help", icon: <HelpIcon /> },
    { label: "Logout", icon: <Logout />, isLogout: true },
  ];

  return (
    <div className="flex">
      <Drawer
        variant="permanent"
        PaperProps={{
          style: {
            width: open ? FULL_WIDTH : MINI_WIDTH,
            boxShadow: "none",
            border: "none",
            transition: "width 0.3s ease",
          },
        }}
      >
        <Box className="flex flex-col h-full justify-between">
          {/* Top Section */}
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={toggleOpen}
              >
                <div className="h-10 w-10 rounded-full bg-cover bg-center bg-[url('/images/logo.jpg')]"></div>
                {open && <p className="font-bold text-lg m-0">Errosmiles</p>}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col">
              {navCategories.map((category) => (
                <div key={category.category}>
                  {open && (
                    <p className="px-4 py-2 text-gray-500 uppercase text-xs font-semibold">
                      {category.category}
                    </p>
                  )}
                  {category.items.map((item) => {
                    const isActive = (() => {
                      const path = item.path;

                      // 1. Root path → exact match only
                      if (path === "/") {
                        return location.pathname === "/";
                      }

                      // 2. Patients special case (handles /patient/:id)
                      if (path === "/patients") {
                        return (
                          location.pathname.startsWith("/patients") ||
                          location.pathname.startsWith("/patient/")
                        );
                      }

                      // 3. Default → safe prefix match (with boundary)
                      return (
                        location.pathname.startsWith(path + "/") ||
                        location.pathname === path
                      );
                    })();

                    if (item.items) {
                      return (
                        <div key={item.label}>
                          <div
                            onClick={() => setDocumentsOpen(!documentsOpen)}
                            className={`flex items-center w-full cursor-pointer px-4 py-3 ${
                              isActive
                                ? "bg-[#20a1df] text-white"
                                : "text-gray-800 hover:text-[#20a1df] hover:bg-gray-100"
                            } ${
                              open ? "justify-start gap-2" : "justify-center"
                            }`}
                          >
                            {item.icon}
                            {open && <span>{item.label}</span>}
                            {open &&
                              (documentsOpen ? <ExpandLess /> : <ExpandMore />)}
                          </div>

                          {open && (
                            <div
                              ref={dropdownRef}
                              style={{
                                height: dropdownHeight,
                                overflow: "hidden",
                                transition: "height 0.3s ease",
                              }}
                              className="flex flex-col gap-2 ml-6"
                            >
                              {item.items.map((subItem) => (
                                <div
                                  key={subItem.label}
                                  onClick={() =>
                                    handleNavigation(subItem.path, true)
                                  }
                                  className={`flex items-center w-full cursor-pointer px-4 py-2 ${
                                    location.pathname === subItem.path
                                      ? "bg-[#20a1df] text-white"
                                      : "text-gray-800 hover:text-[#20a1df] hover:bg-gray-100"
                                  } ${
                                    open
                                      ? "justify-start gap-2"
                                      : "justify-center"
                                  }`}
                                >
                                  {subItem.icon}
                                  {open && <span>{subItem.label}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        onClick={() => handleNavigation(item.path)}
                        className={`flex items-center w-full cursor-pointer px-4 py-3 ${
                          isActive
                            ? "bg-[#20a1df] text-white"
                            : "text-gray-800 hover:text-[#20a1df] hover:bg-gray-100"
                        } ${open ? "justify-start gap-2" : "justify-center"}`}
                      >
                        {item.icon}
                        {open && <span>{item.label}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col">
            {/* {botNav.map((navItem) => (
              <div
                key={navItem.label}
                onClick={() =>
                  handleNavigation(`/${navItem.label.toLowerCase()}`)
                }
                className={`flex items-center w-full cursor-pointer px-4 py-3 text-gray-800 hover:text-[#20a1df] hover:bg-gray-100 transition-colors duration-200 ${
                  open ? "justify-start gap-2" : "justify-center"
                }`}
              >
                {navItem.icon}
                {open && <span>{navItem.label}</span>}
              </div>
            ))} */}

            {/* Authenticated User */}
            {userProfile && (
              <>
                <div
                  onClick={handleMenuOpen}
                  className="flex items-center gap-2 px-4 py-4 border-t cursor-pointer hover:bg-gray-100"
                >
                  <Avatar sx={{ bgcolor: "#20a1df", width: 40, height: 40 }}>
                    {userProfile.firstName
                      ? userProfile.firstName[0].toUpperCase()
                      : "U"}
                  </Avatar>

                  {open && (
                    <div className="flex items-center gap-2 w-auto justify-between">
                      <div className="flex flex-col gap-0 m-0 justify-center items-start">
                        <p className="text-md font-bold">
                          {userProfile.firstName}
                        </p>
                        <p className="text-sm">{userProfile.eid}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                  PaperProps={{
                    className: "w-56",
                  }}
                >
                  {botNav.map((item) => (
                    <MenuItem
                      key={item.label}
                      onClick={() => {
                        handleMenuClose();

                        if (item.isLogout) {
                          handleLogout();
                        } else {
                          navigate(`/login`);
                        }
                      }}
                      className={`flex items-center gap-2 ${
                        item.isLogout ? "text-red-500" : ""
                      }`}
                    >
                      <span className={item.isLogout ? "text-red-500" : ""}>
                        {item.icon}
                      </span>
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </div>
        </Box>
      </Drawer>
    </div>
  );
};

export default Sidebar;
