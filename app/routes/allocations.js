const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;
const {
    environmentalScripts
} = require("../../config/config");

function AllocationsHandler(db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        // DEFENSIVE REMEDIATION: Session-Bound Authorization Guard
        // Extract authenticated userId strictly from session
        const sessionUserId = req.session && req.session.userId;
        const paramUserId = req.params.userId;
        const { threshold } = req.query;

        // Prevent unauthorized access if parameter does not match the active session
        if (!sessionUserId || (paramUserId && String(sessionUserId) !== String(paramUserId))) {
            return res.status(403).send("Forbidden: Unauthorized access to requested resource.");
        }

        // Strictly query using session-bound identifier
        allocationsDAO.getByUserIdAndThreshold(sessionUserId, threshold, (err, allocations) => {
            if (err) return next(err);
            return res.render("allocations", {
                userId: sessionUserId,
                allocations,
                environmentalScripts
            });
        });
    };
}

module.exports = AllocationsHandler;
