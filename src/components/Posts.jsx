/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useState } from "react";
import { query, orderBy } from "firebase/firestore";
import { firestore } from "../Firebase";
import { collection } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import Modal from "./Modal";
import Video from "./Video";
import Like from "./Like";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Posts.scss";
import noPosts from "../no-posts.png";

const Posts = ({ user }) => {
  const [posts, setPosts] = useState(null);
  const [prePosts, setPrePosts] = useState(null);
  let [isOpen, setIsOpen] = useState(false);
  let [userList, setUserList] = useState(null);
  let [cInd, setCIndex] = useState(0);
  let contextObj = useContext(AuthContext);
  let [seenPosts, setSeenPosts] = useState(null);
  let navigate = useNavigate();

  const handleOpen = (val, ind) => {
    setCIndex(ind);
    setIsOpen(val);
  };
  const handleVisit = (user) => {
    contextObj.setVisitedUser(user);
    navigate("/visit/" + user.docId);
  };
  useEffect(() => {
    if (contextObj.seenPosts !== null) {
      setSeenPosts(contextObj.seenPosts);
    }
  }, [contextObj.seenPosts]);
  useEffect(() => {
    if (posts !== null) {
      if (
        prePosts !== null &&
        prePosts.length < posts.length &&
        prePosts[0].postId !== posts[0].postId
      ) {
        const topLink = document.getElementById(`#${posts[0].postId}`);
        topLink.click();
      }
      setPrePosts(posts);
    }
    // eslint-disable-next-line
  }, [posts]);
  useEffect(() => {
    let userArr = [];
    contextObj.userList.forEach((listItem) => {
      if (!listItem.followers.includes(contextObj.user.docId)) {
        userArr.push(listItem);
      }
    });
    setUserList(userArr.slice(0, 5));
  }, [contextObj.userList]);
  useEffect(() => {
    if (contextObj.user) {
      let postArr = [];
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("createdAt")
      );
      const unsub = onSnapshot(postQuery, (querySnapshot) => {
        postArr = [];
        querySnapshot.forEach((doc) => {
          let data = { ...doc.data(), postId: doc.id };
          if (data.userId === contextObj.user.docId) {
            postArr.unshift(data);
          } else {
            postArr.push(data);
          }
        });
        setPosts(postArr);
      });
      return () => {
        unsub();
      };
    }
    // eslint-disable-next-line
  }, [contextObj.user?.docId]);

  const callback = (entries) => {
    entries.forEach((entry) => {
      let ele = entry.target;
      ele.play().then(() => {
        if (!ele.paused && !entry.isIntersecting) {
          ele.pause();
        }
      });
    });
  };
  let observer = new IntersectionObserver(callback, { threshold: 0.6 });

  useEffect(() => {
    const elements = document.querySelectorAll(".videos");
    elements?.forEach((element) => {
      observer.observe(element.children[0]);
    });
    return () => {
      observer.disconnect();
    };
  }, [posts, user]);

  const displayPosts = posts?.filter((post) => {
    return (
      (contextObj.user.following.includes(post.userId) ||
        contextObj.user.docId === post.userId) &&
      (seenPosts[post.postId]
        ? !seenPosts[post.postId].includes(contextObj.user.docId)
        : true)
    );
  });
  return (
    <>
      {posts === null || user === null || seenPosts === null ? (
        <div class="loader">
          <svg className="circular">
            <circle
              class="path"
              cx="50"
              cy="50"
              r="0"
              fill="none"
              stroke-width="5"
              strokeMiterlimit="10"
            ></circle>
          </svg>
        </div>
      ) : (
        <div className="post-container">
          <div className="post-right-container">
            {!userList ? (
              <div class="loader">
                <svg className="circular">
                  <circle
                    class="path"
                    cx="50"
                    cy="50"
                    r="0"
                    fill="none"
                    stroke-width="5"
                    strokeMiterlimit="10"
                  ></circle>
                </svg>
              </div>
            ) : (
              <div className="suggested-posts-container">
                {userList.slice(0, 5).map((user, index) => {
                  return (
                    <div
                      className="posts"
                      key={index}
                      onClick={() => handleVisit(user)}
                    >
                      <div className="posts-wrapper">
                        <div className="">
                          <img
                            src={user?.profileUrl}
                            alt=""
                            className="user-image"
                          />
                        </div>
                        <div className="">{user.fullname}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="video-user-container">
            <div className="video-left-container"></div>

            {displayPosts?.length > 0 ? (
              <div
                onClick={() => {
                  const video = document.querySelector("#video-container-box");

                  const rfs =
                    video.requestFullscreen ||
                    video.webkitRequestFullScreen ||
                    video.mozRequestFullScreen ||
                    video.msRequestFullscreen;
                }}
                id="video-container-box"
                className="video-container"
              >
                {displayPosts.map((post, index) => {
                  return (
                    <span key={index}>
                      <a
                        href={`#${post.postId}`}
                        id={`#${post.postId}`}
                        style={{ display: "none" }}
                      />
                      <div className="videos" id={post.postId}>
                        <Video
                          postId={post.postId}
                          src={post.pUrl}
                          post={post}
                        />
                        <div class="fa">
                          <img
                            alt=""
                            className="img_reel"
                            src={post.uProfile}
                          />
                          <h4 className="name">{post.uName}</h4>
                        </div>
                        <div className="like">
                          <Like user={user} post={post} />
                        </div>
                        <div
                          onClick={() => handleOpen(true, index)}
                          className="chat"
                        >
                          <i class="far fa-comment"></i>
                        </div>
                        <Modal
                          open={isOpen}
                          handleOpen={handleOpen}
                          post={post}
                          index={index}
                          cIndex={cInd}
                        />
                      </div>
                    </span>
                  );
                })}
              </div>
            ) : (
              (!displayPosts || displayPosts?.length === 0) && (
                <>
                  <div
                    style={{ padding: "20px 0" }}
                    className={
                      (contextObj.theme === "dark" ? "dark " : "") +
                      "feed-no-post"
                    }
                  >
                    <div className="inner">
                      <img
                        className="display-image"
                        src={noPosts}
                        width={200}
                        alt=""
                        srcset=""
                      />
                    </div>
                    <div className="inner p">No posts yet.</div>
                  </div>
                </>
              )
            )}

            <div className="video-right-container">
              <div className="suggested-users-heading">
                <b>Suggested Users</b>
              </div>
              {userList.slice(0, 5).map((user, index) => {
                let nameArr = user.fullname.split(" ");
                let tempUserName = "";
                nameArr.forEach((name) => {
                  tempUserName = tempUserName + name.toLowerCase() + "_";
                });
                tempUserName = tempUserName + user.email.length;
                return (
                  <div
                    className="suggested-users"
                    key={index}
                    onClick={() => handleVisit(user)}
                  >
                    <div className="suggested-users-wrapper">
                      <div className="suggested-users-img">
                        <img
                          src={user?.profileUrl}
                          alt=""
                          className="user-image"
                        />
                      </div>
                      <div className="suggested-users-details">
                        <p>
                          <b>{user.fullname}</b>
                        </p>
                        <p>{tempUserName}</p>
                      </div>

                      <div className="suggested-users-view">
                        <button>View</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Posts;
