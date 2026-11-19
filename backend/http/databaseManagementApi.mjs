function extractBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }
  return authorizationHeader.slice('Bearer '.length).trim();
}

function httpErrors(error) {
  return {
    status: error?.status || 500,
    message: error?.message || 'Internal Server Error',
    ...(error?.details ? { details: error.details } : {}),
  };
}

function handleRequest(handler) {
  return async function requestHandler(req, res) {
    try {
      const body = await handler(req, res);
      res.json(body);
    } catch (error) {
      console.error('Database management API error', error);
      const response = httpErrors(error);
      res.status(response.status).json(response);
    }
  };
}

export default function createDatabaseManagementApi(databaseManagementServices) {
  return {
    requireDatabaseAuth,
    authenticateAdmin: handleRequest(authenticateAdminAPI),
    getDatabaseHome: handleRequest(getDatabaseHomeAPI),
    getDatabaseBookings: handleRequest(getDatabaseBookingsAPI),
    getMailchimpClients: handleRequest(getMailchimpClientsAPI),
  };

  function requireDatabaseAuth(req, res, next) {
    try {
      const token = extractBearerToken(req.headers.authorization || '');
      const adminSession = databaseManagementServices.validateSessionToken(token);
      req.databaseAdmin = adminSession;
      next();
    } catch (error) {
      console.error('Database auth middleware error', error);
      const response = httpErrors(error);
      res.status(response.status).json(response);
    }
  }

  async function authenticateAdminAPI(req) {
    return databaseManagementServices.authenticateAdmin({
      username: req.body?.username,
      password: req.body?.password,
    });
  }

  async function getDatabaseHomeAPI(req) {
    const payload = await databaseManagementServices.getDatabaseHomeData();
    return {
      ...payload,
      authenticatedAs: req.databaseAdmin?.username || '',
    };
  }

  async function getDatabaseBookingsAPI(req) {
    return databaseManagementServices.getBookingsView({
      limit: req.query?.limit,
    });
  }

  async function getMailchimpClientsAPI(req) {
    return databaseManagementServices.getMailchimpClientsView({
      count: req.query?.count,
      offset: req.query?.offset,
    });
  }
}
