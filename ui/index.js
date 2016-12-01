import styledoc from '../core';
import React from 'react';
import ReactDOM from 'react-dom';
import remark from 'remark';
import reactRenderer from 'remark-react';
import Lowlight from 'react-lowlight';
import xmlLanguage from 'highlight.js/lib/languages/xml';
import cssLanguage from 'highlight.js/lib/languages/css';

Lowlight.registerLanguage('html', xmlLanguage);
Lowlight.registerLanguage('css', cssLanguage);

class Doc extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showSource: false };
    this.toggleShowSource = this.toggleShowSource.bind(this);
  }

  toggleShowSource() {
    this.setState({ showSource: !this.state.showSource });
  }

  render() {
    let { doc } = this.props;
    let { showSource } = this.state;
    return <div className='clearfix pad4y'>
      <div className='col4'>
        <h3>{doc.referencedSource.selector}</h3>
        <div className='prose pad1y'>
          {remark().use(reactRenderer).process(doc.parsedComment.description).contents}
        </div>
        <div>
          <h4
            onClick={this.toggleShowSource}
            className={`micro ${showSource ? 'quiet' : ''}`}>{showSource ? '➖' : '➕'} Source</h4>
          {showSource ? (<Lowlight
           language='css'
           value={doc.referencedSource.toString()} />) : null}
        </div>
      </div>
      <div className='col8'>
        <div className='space-left1'>
          {doc.parsedComment.example ? (<div>
            <div className='pad1 keyline-all contain'>
              <h4 className='micro pin-topright pad0y pad1x'>Example</h4>
              <div dangerouslySetInnerHTML={{ __html: doc.parsedComment.example.description }} />
            </div>
            <Lowlight
              language='html'
              value={doc.parsedComment.example.description} />
          </div>) : null}
        </div>
      </div>
    </div>
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true, 
      docs: null 
    };
  }

  componentDidMount() {
    fetch(this.props.file)
      .then(response => response.text())
      .then(content => {
        this.setState({
          loading: false,
          docs: styledoc.extract([{
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

    console.log(this.state.docs);

    return <div className='limiter pad4y'>
      <h1 className='pad4y keyline-bottom'>{this.props.file} documentation</h1>
      <div className='pad4y'>

        {this.state.docs.map((doc, i) =>
          <div key={i}>
            <Doc doc={doc} />
          </div>)}

      </div>

    </div>;
  }
}

ReactDOM.render(<App file='base.css' />,
  document.getElementById('app'));
