export function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);

  if (seconds < 60) {
    return 'a l\'instant';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `il y a ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `il y a ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `il y a ${days} j`;
  }

  return new Date(isoDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
