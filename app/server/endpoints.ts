const MODULES = {
  AUTH: `auth`,
  BOOKINGS: `bookings`,
  EXPENSES: `expenses`,
  ROOMS: `rooms`,
  USERS: `users`,
};

const AUTH = {
  LOGIN: `${MODULES.AUTH}/login`, // POST
  LOGOUT: `${MODULES.AUTH}/logout`, // DELETE
  ME: `${MODULES.AUTH}/me`, // GET
};
const BOOKINGS = {
  INDEX: `${MODULES.BOOKINGS}`, // GET
  SHOW: `${MODULES.BOOKINGS}/:id`, // GET
  STATS: `${MODULES.BOOKINGS}/stats`, // GET
  CHART: `${MODULES.BOOKINGS}/chart`, // GET
};
const EXPENSES = {
  INDEX: `${MODULES.EXPENSES}`, // GET
  SHOW: `${MODULES.EXPENSES}/:id`, // GET
  STATS: `${MODULES.EXPENSES}/stats`, // GET
};
const ROOMS = {
  INDEX: `${MODULES.ROOMS}`, // GET
  SHOW: `${MODULES.ROOMS}/:id`, // GET
};
const USERS = {
  INDEX: `${MODULES.USERS}`, // GET
  SHOW: `${MODULES.USERS}/:id`, // GET
  STATS: `${MODULES.USERS}/stats`, // GET
  DELETE: `${MODULES.USERS}/:id`, // DELETE
};

export { AUTH, BOOKINGS, EXPENSES, ROOMS, USERS };
