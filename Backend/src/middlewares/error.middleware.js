/**
 * ─────────────────────────────────────────────────────────────
 * ERROR MIDDLEWARE — Centralized error handling for Express
 * ─────────────────────────────────────────────────────────────
 * Catches unhandled errors and sends consistent JSON responses.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * 404 handler — catches requests to undefined routes.
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
}

/**
 * Global error handler — catches all unhandled errors.
 * Must have 4 parameters for Express to recognize it as error middleware.
 */
function globalErrorHandler(err, req, res, _next) {
    console.error("─── GLOBAL ERROR ───");
    console.error("Message:", err?.message);
    console.error("Stack:", err?.stack);
    console.error("────────────────────");

    const statusCode = err?.statusCode || err?.status || 500;

    res.status(statusCode).json({
        success: false,
        message: err?.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err?.stack })
    });
}

module.exports = {
    notFoundHandler,
    globalErrorHandler
};
