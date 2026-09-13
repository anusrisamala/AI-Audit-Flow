const { z } = require("zod");

// Helper for numeric route parameter validation
const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric integer").optional(),
    auditId: z.string().regex(/^\d+$/, "Audit ID must be a numeric integer").optional(),
    findingId: z.string().regex(/^\d+$/, "Finding ID must be a numeric integer").optional(),
    userId: z.string().regex(/^\d+$/, "User ID must be a numeric integer").optional(),
    reportId: z.string().regex(/^\d+$/, "Report ID must be a numeric integer").optional(),
  }),
});

// Middleware generator
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) req.body = parsed.body;

      next();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const issue = err.errors[0];
        const rawPath = issue.path ? issue.path.filter(p => p !== "body" && p !== "params" && p !== "query").join(".") : "";
        const message = issue.message || "Invalid input";
        return res.status(400).json({
          message: rawPath ? `${rawPath}: ${message}` : message,
        });
      }
      return res.status(400).json({ message: "Invalid input" });
    }
  };
};

// -------------------------------------------------------------
// Validation Schemas
// -------------------------------------------------------------

// Auth
const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().trim().email("Invalid email format").max(100, "Email is too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password is too long"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Audit
const idParamValidation = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric integer").optional(),
    auditId: z.string().regex(/^\d+$/, "Audit ID must be a numeric integer").optional(),
  }),
});

const createAuditSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
    department: z.string().trim().min(1, "Department is required").max(100, "Department is too long"),
    description: z.string().trim().max(3000, "Description is too long").optional().nullable(),
    start_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
    assigned_to: z.number().int().positive().optional().nullable(),
  }).refine((data) => {
    if (data.start_date && data.due_date) {
      return new Date(data.due_date) >= new Date(data.start_date);
    }
    return true;
  }, {
    message: "Due date cannot be earlier than start date",
    path: ["due_date"],
  }),
});

const updateAuditSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric integer"),
  }),
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200).optional(),
    department: z.string().trim().min(1, "Department is required").max(100).optional(),
    description: z.string().trim().max(3000).optional().nullable(),
    start_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
    assigned_to: z.number().int().positive().optional().nullable(),
  }).refine((data) => {
    if (data.start_date && data.due_date) {
      return new Date(data.due_date) >= new Date(data.start_date);
    }
    return true;
  }, {
    message: "Due date cannot be earlier than start date",
    path: ["due_date"],
  }),
});

const assignAuditorSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Audit ID must be a numeric integer"),
  }),
  body: z.object({
    assigned_to: z.number({ invalid_type_error: "assigned_to must be a numeric user ID" }).int().positive("Invalid user ID"),
  }),
});

// Findings
const createFindingSchema = z.object({
  body: z.object({
    audit_id: z.number({ invalid_type_error: "audit_id must be a numeric integer" }).int().positive(),
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().trim().max(3000, "Description is too long").optional().nullable(),
    risk_level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
      errorMap: () => ({ message: "risk_level must be LOW, MEDIUM, HIGH, or CRITICAL" }),
    }),
    recommendation: z.string().trim().max(3000, "Recommendation is too long").optional().nullable(),

    // Optional AI fields
    ai_risk_level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().nullable(),
    ai_confidence: z.number().optional().nullable(),
    ai_reason: z.string().max(3000).optional().nullable(),
    ai_recommendation: z.string().max(3000).optional().nullable(),
  }),
});

const updateFindingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Finding ID must be a numeric integer"),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(3000).optional().nullable(),
    risk_level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    recommendation: z.string().trim().max(3000).optional().nullable(),

    ai_risk_level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().nullable(),
    ai_confidence: z.number().optional().nullable(),
    ai_reason: z.string().max(3000).optional().nullable(),
    ai_recommendation: z.string().max(3000).optional().nullable(),
  }),
});

// User Profile & Settings
const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().trim().email("Invalid email format").max(100, "Email is too long"),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(100, "New password is too long"),
  }),
});

const notificationPreferencesSchema = z.object({
  body: z.object({
    notify_audits: z.boolean().optional(),
    notify_findings: z.boolean().optional(),
    notify_reports: z.boolean().optional(),
    notify_registrations: z.boolean().optional(),
  }),
});

// AI
const aiRiskScoreSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().trim().min(1, "Description is required").max(3000, "Description is too long"),
    department: z.string().trim().min(1, "Department is required").max(100, "Department is too long"),
  }),
});

module.exports = {
  validate,
  idParamValidation,
  registerSchema,
  loginSchema,
  createAuditSchema,
  updateAuditSchema,
  assignAuditorSchema,
  createFindingSchema,
  updateFindingSchema,
  updateProfileSchema,
  changePasswordSchema,
  notificationPreferencesSchema,
  aiRiskScoreSchema,
};
