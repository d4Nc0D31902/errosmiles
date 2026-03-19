import React, { useState, useEffect, useRef } from "react";
import { Drawer, Box, Avatar } from "@mui/material";
import {
  MenuOutlined,
  ExpandMore,
  ExpandLess,
  Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../utils/Supabase";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PieChartIcon from "@mui/icons-material/PieChart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SellIcon from "@mui/icons-material/Sell";
import PeopleIcon from "@mui/icons-material/People";
import FolderIcon from "@mui/icons-material/Folder";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import PersonalInjuryIcon from '@mui/icons-material/PersonalInjury';

const MINI_WIDTH = 72;
const FULL_WIDTH = 250;

const Sidebar = ({ open, toggleOpen }) => {
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [dropdownHeight, setDropdownHeight] = useState(0);

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
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navCategories = [
    {
      category: "Main Menu",
      items: [
        // { label: "Home", icon: <HomeOutlinedIcon />, path: "/" },
        { label: "Dashboard", icon: <PieChartIcon />, path: "/" },
      ],
    },
    {
      category: "Records",
      items: [
        // { label: "Orders", icon: <ShoppingBagIcon />, path: "/orders" },
        { label: "Patients", icon: <PersonalInjuryIcon />, path: "/patients" },
        {
          label: "Documents",
          icon: <FolderIcon />,
          items: [
            {
              label: "Invoices",
              icon: <ReceiptIcon />,
              path: "/documents/invoices",
            },
            {
              label: "Reports",
              icon: <ArticleIcon />,
              path: "/documents/reports",
            },
          ],
        }
      ],
    },
    {
      category: "Management",
      items: [
        { label: "Users", icon: <PeopleIcon />, path: "/users" },
      ],
    },
  ];

  const botNav = [
    { label: "Settings", icon: <SettingsIcon /> },
    { label: "Help", icon: <HelpIcon /> },
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
                    const isActive = location.pathname === item.path;

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
            {botNav.map((navItem) => (
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
            ))}

            {/* Authenticated User */}
            {userProfile && (
              <div className="flex items-center gap-2 px-4 py-4 border-t">
                {/* Avatar with first letter of firstName */}
                <Avatar sx={{ bgcolor: "#20a1df", width: 40, height: 40 }}>
                  {userProfile.firstName
                    ? userProfile.firstName[0].toUpperCase()
                    : "U"}
                </Avatar>
                {open && (
                  <div className="flex items-center gap-2 w-auto justify-between">
                    <div className="flex flex-col gap-0 m-0 justify-center items-start">
                      <p className="text-md font-bold">{`${userProfile.firstName}`}</p>
                      <p className="text-sm">{userProfile.eid}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Box>
      </Drawer>
    </div>
  );
};

export default Sidebar;
