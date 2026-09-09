const roleMiddleware = (...allowedRoles) => {
    const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const userRole = String(req.user.role).toUpperCase();

        if (!normalizedAllowed.includes(userRole)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = roleMiddleware;