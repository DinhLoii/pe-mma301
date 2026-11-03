import { Pressable, Text, View } from 'react-native';
import { colors } from './ui';

export function RatingStars({ rating, large = false }: { rating?: number; large?: boolean }) {
  const count = rating ?? 0;
  return <View accessibilityLabel={rating === undefined ? 'Not rated' : `${rating} out of 5 stars`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
    <Text accessibilityElementsHidden importantForAccessibility="no" style={{ color: rating === undefined ? '#c5c1b7' : '#a66d13', fontSize: large ? 25 : 16, letterSpacing: 1 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</Text>
    <Text style={{ color: colors.muted, fontSize: 12 }}>{rating === undefined ? 'Not rated' : `${rating} / 5`}</Text>
  </View>;
}
export function RatingPicker({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const rating = /^\d$/.test(value.trim()) ? Number(value.trim()) : 0;
  return <View style={{ gap: 4 }}>
    <View accessibilityLabel="Choose your rating" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => <Pressable key={star} testID={`rating-star-${star}`} accessibilityRole="button" accessibilityLabel={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
        accessibilityState={{ selected: rating === star, disabled }} disabled={disabled} onPress={() => onChange(String(star))}
        style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: star <= rating ? '#fcf0d9' : '#f5f3ed' }}>
        <Text style={{ fontSize: 27, color: star <= rating ? '#a66d13' : '#b7b2a7' }}>{star <= rating ? '★' : '☆'}</Text>
      </Pressable>)}
    </View>
    <View style={{ flexDirection: 'row', gap: 18 }}>
      <Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel="Rate zero stars" onPress={() => onChange('0')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.muted, fontSize: 13 }}>0 stars</Text></Pressable>
      <Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel="Clear rating" onPress={() => onChange('')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.accent, fontWeight: '600', fontSize: 13 }}>Clear rating</Text></Pressable>
    </View>
  </View>;
}
