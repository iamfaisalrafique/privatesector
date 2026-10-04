import { defineMiddleware } from 'astro:middleware';

// -----------------------------------------------------------------------------
// Startup & Runtime Production Security Invariants
// -----------------------------------------------------------------------------

let startupChecked = false;

function enforceProductionStartupInvariants() {
  if (startupChecked) return;
  startupChecked = true;

  const isProduction = process.env.NODE_ENV === 'production';
  const siteOrigin = process.env.PUBLIC_SITE_ORIGIN || process.env.SITE_ORIGIN;
  const isTestBypass = process.env.SKIP_HTTPS_STARTUP_CHECK === 'true';

  if (isProduction && !isTestBypass) {
    if (!siteOrigin || !siteOrigin.startsWith('https://')) {
      const errMessage = `[FATAL STARTUP CHECK FAILED]: In production (NODE_ENV=production), PUBLIC_SITE_ORIGIN must be explicitly configured and MUST begin with 'https://'. Received: "${siteOrigin || ''}"`;
      console.error(errMessage);
      throw new Error(errMessage);
    }
  }
}

// Execute check at module evaluation time when server boots
try {
  enforceProductionStartupInvariants();
} catch (err) {
  // If in production, fail fast immediately
  if (process.env.NODE_ENV === 'production') {
    throw err;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  enforceProductionStartupInvariants();
  return next();
});
