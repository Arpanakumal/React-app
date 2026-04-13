export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        if (!req.user.role) {
            return res.status(403).json({
                success: false,
                message: "Role not found"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};