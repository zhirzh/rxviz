import { Component } from 'react';
import Error from '../components/Error';
import Layout from '../components/Layout';
import Controls from '../components/Controls';
import Editor from '../components/Editor';
import Output from '../components/Output';
import { compress, decompress } from '../components/utils';
import copy from 'copy-to-clipboard';

const localStorageKey = 'rxviz-stash';

const exampleCode = `const { interval } = Rx;

const { } = RxOperators;
// All operators are available as globals
// Note: "window" operator is available as "win"

interval(1000).pipe(
  take(4)
)
// Last expression must be an observable
`;

export default class extends Component {
  static getInitialProps() {
    return {
      code: exampleCode,
      timeWindow: 5000
    };
  }

  constructor(props) {
    super();

    this.state = this.resetState(props);
  }

  componentDidMount() {
    const snippet = this.getSnippet();
    const stash = this.getLocalStorageStash();

    if (snippet || stash) {
      const { code, timeWindow } = snippet || stash;

      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState(this.resetState({ code, timeWindow }));
    }
  }

  resetState(props) {
    return {
      errorStatusCode: props.errorStatusCode,
      code: props.code,
      timeWindowInputValue: props.timeWindow / 1000,
      timeWindowInputValueBeforeChange: null,
      vizParams: null,
      svg: null
    };
  }

  componentWillReceiveProps(nextProps) {
    const { errorStatusCode, code, timeWindow } = nextProps;

    if (
      errorStatusCode !== this.props.errorStatusCode ||
      code !== this.props.code ||
      timeWindow !== this.props.timeWindow
    ) {
      this.setState(this.resetState(nextProps));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { code, timeWindowInputValue } = this.state;

    if (
      code !== prevState.code ||
      timeWindowInputValue !== prevState.timeWindowInputValue
    ) {
      const data = JSON.stringify({
        code,
        timeWindow: timeWindowInputValue * 1000
      });

      location.hash = compress(data);

      localStorage.setItem(localStorageKey, data);
    }
  }

  getSnippet() {
    try {
      return JSON.parse(decompress(location.hash.slice(1)));
    } catch {
      return null;
    }
  }

  getLocalStorageStash() {
    let stash;

    try {
      stash = JSON.parse(localStorage.getItem(localStorageKey));
    } catch {
      stash = null;
    }

    if (stash) {
      const { code, timeWindow } = stash;

      const isValidCode = typeof code === 'string' && code !== '';

      const isValidTimeWindow =
        typeof timeWindow === 'number' && timeWindow !== 0;

      if (isValidCode && isValidTimeWindow) {
        return { code, timeWindow };
      }
    }

    localStorage.removeItem(localStorageKey);
    return null;
  }

  onTimeWindowInputValueFocus = () => {
    this.setState(state => ({
      timeWindowInputValueBeforeChange: state.timeWindowInputValue
    }));
  };

  onTimeWindowInputValueChange = timeWindowInputValue => {
    this.setState({
      timeWindowInputValue
    });
  };

  onTimeWindowInputValueBlur = () => {
    const { timeWindowInputValue } = this.state;

    if (timeWindowInputValue === null) {
      this.setState(state => ({
        timeWindowInputValue: state.timeWindowInputValueBeforeChange
      }));
    }
  };

  onCodeChange = code => {
    this.setState({
      code
    });
  };

  onVisualize = () => {
    const {
      code,
      timeWindowInputValue,
      timeWindowInputValueBeforeChange
    } = this.state;
    const newTimeWindowInputValue =
      timeWindowInputValue === null
        ? timeWindowInputValueBeforeChange
        : timeWindowInputValue;
    const vizParams = {
      timeWindow: newTimeWindowInputValue * 1000,
      code
    };

    this.setState({
      timeWindowInputValue: newTimeWindowInputValue,
      vizParams,
      svg: null
    });
  };

  onShare = () => {
    copy(location);
  };

  onSvgStable = svg => {
    this.setState({
      svg
    });
  };

  render() {
    const { errorStatusCode } = this.state;

    if (errorStatusCode) {
      return <Error statusCode={errorStatusCode} />;
    }

    const { code, timeWindowInputValue, vizParams, svg } = this.state;

    return (
      <Layout>
        <main className="main">
          <Controls
            timeWindow={timeWindowInputValue}
            onTimeWindowFocus={this.onTimeWindowInputValueFocus}
            onTimeWindowChange={this.onTimeWindowInputValueChange}
            onTimeWindowBlur={this.onTimeWindowInputValueBlur}
            svg={svg}
            onVisualize={this.onVisualize}
            onShare={this.onShare}
          />
          <div className="editor-and-output">
            <Editor
              value={code}
              onChange={this.onCodeChange}
              onCmdEnter={this.onVisualize}
            />
            <Output vizParams={vizParams} onSvgStable={this.onSvgStable} />
          </div>
        </main>
        <style jsx>{`
          .main {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0; /* https://stackoverflow.com/q/44192057/247243 */
          }
          .editor-and-output {
            display: flex;
            height: 0;
            flex-grow: 1;
            min-width: 0;
            /* https://stackoverflow.com/q/44192057/247243 */
          }
        `}</style>
      </Layout>
    );
  }
}
