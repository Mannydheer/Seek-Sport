export const fetchUserProfile = async () => {
  let token = localStorage.getItem("accesstoken");
  if (!token) {
    console.log("token is not value.");
  }
  try {
    //validate for no tokens
    let response = await fetch("/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `${token}`,
      },
    });
    return response;
  } catch (err) {
    console.log(err, "inside helper try/catch");
  }
};
