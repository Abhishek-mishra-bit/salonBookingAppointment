// Middleware to restrict route access to customers only
function customerOnly(req, res, next) {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({ message: "Access denied: Customers only" });
  }
  next();
}

// You can add similar middleware for staff and admin if needed
function staffOnly(req, res, next) {
  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ message: "Access denied: Staff only" });
  }
  next();
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
}

module.exports = { customerOnly, staffOnly, adminOnly };
