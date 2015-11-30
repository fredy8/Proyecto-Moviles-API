import geolib from 'geolib';

export default (latitude, longitude) => (a, b) => {
  if (latitude === null || (a.latitude === null && b.latitude == null)) {
    if (a.id < b.id) return -1;
    return 1;
  }

  if (a.latitude === null) {
    return 1;
  }

  if (b.latitude === null) {
    return -1;
  }

  const distA = geolib.getDistance({ latitude, longitude }, a);
  const distB = geolib.getDistance({ latitude, longitude }, b);
  if (distA < distB) {
    return -1;
  } else if (distA == distB) {
    return 0;
  }

  return 1;
}