import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

const AstrologerDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Astrologer Details Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: FONTS.lg,
    color: COLORS.text,
  },
});

export default AstrologerDetailsScreen;
