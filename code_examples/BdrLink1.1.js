// Component BdrLink

import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';

class Link extends Component {

  constructor() {
    this.super();
    ...
  }

  openURl() { ...  }

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
  link: { ... },
});

export default Link;
