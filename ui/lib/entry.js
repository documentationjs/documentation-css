import React from 'react';
import remark from 'remark';
import reactRenderer from 'remark-react';
import Lowlight from 'react-lowlight';
import xmlLanguage from 'highlight.js/lib/languages/xml';
import cssLanguage from 'highlight.js/lib/languages/css';

Lowlight.registerLanguage('html', xmlLanguage);
Lowlight.registerLanguage('css', cssLanguage);

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showSource: false };
    this.toggleShowSource = this.toggleShowSource.bind(this);
  }

  toggleShowSource() {
    this.setState({ showSource: !this.state.showSource });
  }

  render() {
    const { props } = this;
    const { showSource } = this.state;

    const example = props.parsedComment.example ? (<div>
      <div className='pad1 keyline-all contain'>
        <h4 className='micro pin-topright pad0y pad1x'>Example</h4>
        <div dangerouslySetInnerHTML={{ __html: props.parsedComment.example.description }} />
      </div>
      <Lowlight
        language='html'
        value={props.parsedComment.example.description} />
    </div>) : null

    return (
      <div className='clearfix pad4y'>
        <div className='col4'>
          <div style={{ fontWeight: 'bold' }}>{props.referencedSource.selector}</div>
          <div className='prose pad1y'>
            {remark().use(reactRenderer).process(props.parsedComment.description).contents}
          </div>
          <div>
            <div
              style={{ cursor: 'pointer' }}
              onClick={this.toggleShowSource}>
              {showSource ? '➖' : '➕'} Source
            </div>
            {showSource ? (<Lowlight
             language='css'
             value={props.referencedSource.toString()} />) : null}
          </div>
        </div>
        <div className='col8'>
          <div className='space-left1'>
            {example}
          </div>
        </div>
      </div>
    );
  }
}

Entry.propTypes = {
  parsedComment: React.PropTypes.shape({
    description: React.PropTypes.string.isRequired,
    example: React.PropTypes.shape({
      description: React.PropTypes.string.isRequired
    })
  }).isRequired,
  referencedSource: React.PropTypes.shape({
    toString: React.PropTypes.func.isRequired,
  }).isRequired
};

export { Entry };
