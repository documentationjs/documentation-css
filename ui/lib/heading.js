import React from 'react';

class Heading extends React.Component {
  render() {
    const { props } = this;

    const id = props.text.replace(/\s+/g, '-');

    const link = (
      <a href={`#${id}`}>
        {props.text}
      </a>
    );

    const headingEl = React.createElement(`h${props.level + 1}`, { id }, link);

    return (
      <div>
        {headingEl}
      </div>
    );
  }
}

Heading.propTypes = {
  level: React.PropTypes.oneOf([1, 2, 3, 4, 5]).isRequired,
  text: React.PropTypes.string.isRequired
};

export { Heading };
