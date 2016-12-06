import styledoc from '../core';
import React from 'react';
import ReactDOM from 'react-dom';
import { Entry } from './components/entry';
import { Heading } from './components/heading';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      entries: null
    };
  }

  componentDidMount() {
    fetch(this.props.file)
      .then(response => response.text())
      .then(content => {
        this.setState({
          loading: false,
          entries: styledoc.extract([{
            contents: content,
            path: this.props.file
          }])
        });
      });
  }

  render() {

    if (this.state.loading) {
      return <div>loading...</div>;
    }

    let entryEls = [];

    function addEntryAndMembers(entry, level) {
      if (entry.members !== undefined) {
        entryEls.push(
          <Heading
            key={entryEls.length + 1}
            level={level}
            text={entry.parsedComment.description}
          />
        );
        entry.members.forEach((member) => addEntryAndMembers(member, level + 1));
      } else {
        entryEls.push(
          <Entry
            key={entryEls.length + 1}
            level={level}
            {...entry}
          />
        )
      };
    }

    this.state.entries.map((entry) => addEntryAndMembers(entry, 1));

    return <div className='limiter pad4y'>
      <h1 className='pad4y keyline-bottom'>{this.props.file} documentation</h1>
      <div className='pad4y'>
        {entryEls}
      </div>
    </div>;
  }
}

ReactDOM.render(<App file='base.css' />,
  document.getElementById('app'));
