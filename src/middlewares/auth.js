export const adminAuth = (req, res, next) => {
  console.log("checking admin");

  const token = "xyz";
  const isAdminAuthorized = token === "xyz"; // Simulating admin check
  if (!isAdminAuthorized) {
    res.send("Unauthorized access to admin route");
  } else {
    next();
  }
};
