const ProfileDAO = require("../data/profile-dao").ProfileDAO;
const ESAPI = require("node-esapi");
const { environmentalScripts } = require("../../config/config");

// Simple escaping helper without external packages
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler(db) {
  "use strict";

  const profile = new ProfileDAO(db);

  this.displayProfile = (req, res, next) => {
    const { userId } = req.session;

    profile.getByUserId(parseInt(userId, 10), (err, doc) => {
      if (err) return next(err);
      doc.userId = userId;

      // XSS Mitigation
      doc.website = ESAPI.encoder().encodeForHTML(doc.website || "");

      return res.render("profile", {
        ...doc,
        environmentalScripts,
      });
    });
  };

  this.handleProfileUpdate = (req, res, next) => {
    const { firstName, lastName, ssn, dob, address, bankAcc, bankRouting } =
      req.body;

    // ReDoS Fix: Catastrophic backtracking වැළැක්වීම
    const regexPattern = /^[0-9]+#$/;
    const testComplyWithRequirements = regexPattern.test(bankRouting || "");

    // Stored XSS Mitigation: Safe Escaping
    const safeFirstName = escapeHTML(firstName);
    const safeLastName = escapeHTML(lastName);

    if (!testComplyWithRequirements) {
      return res.render("profile", {
        updateError:
          "Bank Routing number does not comply with requirements for format specified",
        firstNameSafeString: safeFirstName,
        firstName: safeFirstName,
        lastName: safeLastName,
        ssn,
        dob,
        address,
        bankAcc,
        bankRouting,
        environmentalScripts,
      });
    }

    const { userId } = req.session;

    profile.updateUser(
      parseInt(userId, 10),
      safeFirstName,
      safeLastName,
      ssn,
      dob,
      address,
      bankAcc,
      bankRouting,
      (err, user) => {
        if (err) return next(err);

        user.updateSuccess = true;
        user.userId = userId;

        return res.render("profile", {
          ...user,
          firstNameSafeString: safeFirstName,
          firstName: safeFirstName,
          lastName: safeLastName,
          environmentalScripts,
        });
      },
    );
  };
}

module.exports = ProfileHandler;
