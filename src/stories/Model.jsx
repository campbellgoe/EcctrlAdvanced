import React from 'react';
import PropTypes from 'prop-types';

export const Model = ({ Component, ...props }) => {
  return (
    <Component {...props} />
  );
};

Model.propTypes = {
 Component: PropTypes.func.isRequired,
};

Model.defaultProps = {
  Component: null,
};
