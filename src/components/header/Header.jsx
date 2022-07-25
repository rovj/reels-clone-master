/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, NavLink } from "react-router-dom";
import "./Header.scss";
import { Grid } from "@mui/material";
import {
  HomeOutlined,
  LightModeOutlined,
  DarkModeOutlined,
  AddBoxOutlined,
  ExploreOutlined,
} from "@mui/icons-material";
import { useRef } from "react";
import SearchBar from "../searchbar/SearchBar";

const Header = (props) => {
  let contextObj = useContext(AuthContext);
  let [id, setId] = useState("");
  let theme = contextObj.theme;
  let [profileUrl, setProfileUrl] = useState("");
  let [userList, setUserList] = useState([]);
  let setTheme = contextObj.setTheme;
  let aRef = useRef();

  useEffect(() => {
    setUserList(contextObj.userList);
  }, [contextObj.userList]);
  useEffect(() => {
    if (contextObj.user === null) {
      setProfileUrl("");
    } else {
      setProfileUrl(contextObj.user.profileUrl);
    }
  }, [contextObj.user]);
  useEffect(() => {
    if (contextObj.user === null) {
      setId("");
    } else {
      setId(contextObj.user.docId);
    }
  }, [contextObj.user]);

  const handleAdd = () => {
    if (window.location.pathname === "/feed") {
      props.handleClick();
    } else {
      props.handleClickProfile();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <a
        href="https://about.instagram.com/blog/announcements/introducing-instagram-reels-announcement"
        ref={aRef}
        style={{ display: "none" }}
      />
      <Grid
        container
        className="header"
        sx={{ backgroundColor: "background.paper" }}
      >
        <Grid
          style={{ width: "100%" }}
          item
          sm={12}
          lg={4}
          className="spacer header-logo"
          justifyContent="center"
        >
          <div
            style={{
              width: "100%",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              className={theme === "light" ? "light-logo" : "dark-logo"}
              src="https://www.instagram.com/static/images/web/logged_out_wordmark.png/7a252de00b20.png"
              height="110px"
              width="110px"
              alt=""
            />
          </div>
        </Grid>
        <Grid
          alignItems="center"
          lg={4}
          sm={12}
          className="spacer header-search"
          justifyContent="center"
        >
          <SearchBar placeholder={"Search Users"} data={userList} />
        </Grid>

        <Grid item sm={12} lg={4} className="spacer header-links">
          <Grid item>
            <Link style={{ textDecoration: "none" }} to="/feed">
              <HomeOutlined sx={{ color: "text.primary", fontSize: "28px" }} />
            </Link>
          </Grid>
          <Grid item>
            <AddBoxOutlined onClick={handleAdd} />
          </Grid>
          <Grid item>
            <ExploreOutlined onClick={() => aRef.current.click()} />
          </Grid>
          <Grid item onClick={toggleTheme}>
            {theme === "light" ? <DarkModeOutlined /> : <LightModeOutlined />}
          </Grid>
          <Grid item>
            <NavLink style={{ textDecoration: "none" }} to={`/profile/${id}`}>
              <img alt="" src={profileUrl} className="user-image" />
            </NavLink>
          </Grid>
          <Grid item></Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Header;
