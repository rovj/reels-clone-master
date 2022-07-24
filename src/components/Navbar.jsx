import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
function Navbar() {
  let contextObj = useContext(AuthContext);
  let [id, setId] = useState("");
  useEffect(() => {
    if (contextObj.user === null) {
      setId("");
    } else {
      setId(contextObj.user.docId);
    }
  }, [contextObj.user]);
  const handleSignOut = () => {
    contextObj.signout();
  };

  return (
    <div className="Navbar">
      <div className="left">
        <img
          src="
                https://www.instagram.com/static/images/web/logged_out_wordmark.png/7a252de00b20.png
                "
          height="110px"
          width="110px"
          alt=""
        />
      </div>
      <div className="rest">
        <Link id="feedLink" className="hide" to={"/feed"}></Link>
        <div className="enclose">
          <i
            onClick={() => {
              document.getElementById("feedLink").click();
            }}
            className="fa-solid fa-house icon "
          ></i>
        </div>

        <Link id="profileLink" className="hide" to={`/profile/${id}`}></Link>
        <div className="enclose">
          <i
            onClick={() => {
              document.getElementById("profileLink").click();
            }}
            className="fa-solid fa-user icon"
          ></i>
        </div>

        <div className="enclose">
          <i
            onClick={() => handleSignOut()}
            class="fa-solid fa-right-from-bracket icon"
          ></i>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
