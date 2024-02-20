switch (location.pathname) {
  case '/pointInTime':
    window.loadApp(window.mockData.get('pointInTime'));
    break;
  case '/quantityWithUnit':
    window.loadApp(window.mockData.get('quantityWithUnit'));
    break;
  case '/quantityWithoutUnit':
    window.loadApp(window.mockData.get('quantityWithoutUnit'));
    break;
  case '/quantityWithBounds':
    window.loadApp(window.mockData.get('quantityWithBounds'));
    break;
  case '/addStatement':
    window.loadApp(null);
}
