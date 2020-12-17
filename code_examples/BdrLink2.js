// @flow
// Component BdrLink
import React, { Component } from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  url: string,
  label: string,
  extraStyle?: TextStyleProp,
};

class Link extends Component<Props> {

  openURl() {
    ...
  }

  render() {
    let { label, extraStyle } = this.props;

    return (
      <Text
        selectable
        style={[ styles.link, extraStyle ]}
        onPress={() => { this.openURl(); }}
      >
        { label }
      </Text>
    );
  }

}

const styles = StyleSheet.create({
  link: { ...  },
});

export default Link;
