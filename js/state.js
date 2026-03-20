// ===================================================
// Estado global — AgroControl
// ===================================================
const State = (() => {
  let _state = {
    user: null,
    token: null,
    currentRoute: 'dashboard',
    dashboardData: null,
    theme: 'auto'
  };

  const _listeners = [];

  const get = (key) => key ? _state[key] : { ..._state };

  const set = (key, value) => {
    _state[key] = value;
    _listeners.forEach(fn => fn(key, value));
  };

  const subscribe = (fn) => {
    _listeners.push(fn);
    return () => {
      const idx = _listeners.indexOf(fn);
      if (idx > -1) _listeners.splice(idx, 1);
    };
  };

  // Persistencia token en localStorage
  const initAuth = () => {
    const token = localStorage.getItem('agro_token');
    const user = localStorage.getItem('agro_user');
    if (token && user) {
      _state.token = token;
      try { _state.user = JSON.parse(user); } catch {}
    }
  };

  const saveAuth = (token, user) => {
    localStorage.setItem('agro_token', token);
    localStorage.setItem('agro_user', JSON.stringify(user));
    set('token', token);
    set('user', user);
  };

  const clearAuth = () => {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    set('token', null);
    set('user', null);
  };

  const isAuthenticated = () => !!_state.token;
  const isAdmin = () => _state.user?.role === 'admin';
  const isJefeCultivo = () => _state.user?.role === 'jefecultivo';
  const canEditCalendar = () => ['admin', 'jefecultivo'].includes(_state.user?.role);
  const getRole = () => _state.user?.role || 'viewer';

  return { get, set, subscribe, initAuth, saveAuth, clearAuth, isAuthenticated, isAdmin, isJefeCultivo, canEditCalendar, getRole };
})();

export default State;
