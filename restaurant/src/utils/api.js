export async function secureFetch(url, options = {}, navigate, setLoggedIn) {
  const token = localStorage.getItem('token');

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    // Token άκυρο ή έληξε
    localStorage.removeItem('token');
    setLoggedIn(false);
    alert('⛔ Η συνεδρία έληξε. Παρακαλώ συνδεθείτε ξανά.');
    navigate('/login');
    return null;
  }

  return res;
}
