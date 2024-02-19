switch (location.pathname) {
case '/pointInTime':
  window.loadApp(window.mockData.get('pointInTime'));
  break;
case '/quantityWithUnit':
  window.loadApp(window.mockData.get('quantityWithUnit'));
  break;
case '/addStatement':
  window.loadApp(null);
}
