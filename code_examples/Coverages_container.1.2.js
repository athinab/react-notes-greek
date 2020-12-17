// Coverages container
import React from 'react';
...

class Coverages extends Screen {

  componentDidMount() {
    const { id, token } = this.props.userIdentification;

    this.props.getCoverages(STORE_COVERAGES, token, id);
  }

  componentDidUpdate(prevProps) {
    ...
  }

  render() {
    ...
  }

};

const mapStateToProps = state => ({
  coverages: state.coverages,
  loaders: state.loaders,
  userIdentification: state.userIdentification,
});

const mapDispatchToProps = dispatch => ({
  // thunk creators
  getCoverages: (nextAction, token, id) => {
    dispatch(actions.toggleLoader('coverages', true));
    dispatch(actions.fetchData('coverages', nextAction, token, id));
  },
});

const exportedCoverages = connect(mapStateToProps, mapDispatchToProps)(Coverages);

const styles = StyleSheet.create({
  ...
});

export default exportedCoverages;
