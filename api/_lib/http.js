function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  sendJson(res, 405, { message: 'Method not allowed.' });
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      const error = new Error('Request body must be valid JSON.');
      error.statusCode = 400;
      throw error;
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? 'Something went wrong on the server.' : error.message;
  if (statusCode === 500) {
    console.error(error);
  }
  sendJson(res, statusCode, { message });
}

module.exports = { handleError, methodNotAllowed, readJson, sendJson };
