import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/domain/movies';

const catalog: { title: string; director: string; image: ImageSourcePropType }[] = [
  { title: 'arrival', director: 'denisvilleneuve', image: require('../../assets/posters/arrival.jpg') },
  { title: 'dune', director: 'denisvilleneuve', image: require('../../assets/posters/dune.jpg') },
  { title: 'madmaxfuryroad', director: 'georgemiller', image: require('../../assets/posters/mad-max.jpg') },
  { title: 'thegrandbudapesthotel', director: 'wesanderson', image: require('../../assets/posters/grand-budapest.jpg') },
  { title: 'alien', director: 'ridleyscott', image: require('../../assets/posters/alien.jpg') },
];
const key = (text: string) => text.toLowerCase().replace(/\s*\(?\d{4}\)?\s*$/, '').replace(/[^a-z0-9]/g, '');
export function MovieArtwork({ movie, width = 78, height = 118 }: { movie: Pick<Movie, 'title' | 'director' | 'genre'>; width?: number; height?: number }) {
  const image = catalog.find(entry => entry.title === key(movie.title) && entry.director === key(movie.director))?.image;
  if (image) return <Image accessibilityLabel={`${movie.title} poster`} source={image} resizeMode="cover" style={{ width, height, borderRadius: 12, backgroundColor: '#ddd5c6' }} />;
  return <View accessibilityLabel={`No poster available for ${movie.title}`} style={[art.fallback, { width, height }]}>
    <Ionicons name="film-outline" size={28} color="#dfc4a1" /><Text style={art.genre}>{movie.genre}</Text>
  </View>;
}
const art = StyleSheet.create({
  fallback: { backgroundColor: '#343d3d', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 12 },
  genre: { color: '#e9d9c1', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
});
