import { useState } from 'react';
import { Pressable, Text, TextInputProps } from 'react-native';
import { Field, colors } from './ui';

export function PasswordField(props: TextInputProps & { label: string; error?: string }) {
  const [visible, setVisible] = useState(false);
  const label = `${visible ? 'Hide' : 'Show'} ${props.label.toLowerCase()}`;
  return <Field {...props} autoCapitalize="none" autoCorrect={false} secureTextEntry={!visible}
    labelAction={<Pressable testID={`${props.testID}-visibility`} accessibilityRole="button"
      accessibilityLabel={label} accessibilityState={{ disabled: props.editable === false }}
      disabled={props.editable === false} hitSlop={8} onPress={() => setVisible(v => !v)}
      style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }}>
      <Text style={{ color: colors.accent, fontWeight: '600' }}>{visible ? 'Hide' : 'Show'}</Text>
    </Pressable>} />;
}
