import React from "react";
import "../styles/Feed.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { firestore } from "../Firebase";
import { addDoc, collection } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { storage } from "../Firebase";
import { updateDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import Posts from "./Posts";
import Header from "./header/Header";

function Feed() {
  let contextObj = useContext(AuthContext);
  let [error, setError] = useState("");
  let user = contextObj.user;

  const handleClick = () => {
    document.getElementById("upload-input").value = "";
    document.getElementById("upload-input").click();
  };
  const apply = () => {
    document.getElementById("pb").style.display = "block";
  };
  const remove = () => {
    document.getElementById("pb").style.display = "none";
  };
  const handleChange = (file) => {
    if (file === null) {
      setError("Please upload a file");
      setTimeout(() => {
        setError("");
      }, 2000);
      return;
    }
    if (file.size / (1024 * 1024) > 100) {
      setError("Please select a file less than 100MB");
      setTimeout(() => {
        setError("");
      }, 2000);
      return;
    }
    apply();
    let uid = uuidv4();
    const storageRef = ref(storage, `/users/${uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // eslint-disable-next-line no-unused-vars
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        setError(error);

        setTimeout(() => {
          setError("");
        }, 2000);
        remove();
        return;
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          addDoc(collection(firestore, "seenposts"), {
            postId: "",
            visitedUsers: [],
          }).then((seenRef) => {
            let obj = {
              likes: [],
              comments: [],
              pId: uid,
              pUrl: downloadURL,
              uName: user.fullname,
              uProfile: user.profileUrl,
              userId: user.docId,
              createdAt: Timestamp.now(),
              seenpost: seenRef.id,
            };

            addDoc(collection(firestore, "posts"), obj)
              .then(async (ref) => {
                let newArr = [...user.postIds, ref.id];
                await updateDoc(doc(firestore, "users", user.docId), {
                  postIds: newArr,
                });
                await updateDoc(doc(firestore, "seenposts", seenRef.id), {
                  postId: ref.id,
                });
              })
              .then(() => {
                remove();
              })
              .catch((err) => {
                contextObj.setPostedByUser(false);
                setError(err.message);
                setTimeout(() => {
                  setError("");
                }, 2000);
                remove();
              });
          });
        });
      }
    );
  };
  return (
    <>
      <Header handleClick={handleClick} />

      <div className="main_continer">
        <input
          type="file"
          accept="video/*"
          id="upload-input"
          onChange={(e) => handleChange(e.target.files[0])}
          style={{ display: "none" }}
        />

        <progress
          className="progress is-danger progress-bar"
          id="pb"
          max="100"
          style={{ display: "none" }}
        >
          10%
        </progress>
        {error !== "" && <div>{error}</div>}
        <Posts user={user} />
      </div>
    </>
  );
}

export default Feed;
