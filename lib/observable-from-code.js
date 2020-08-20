import * as Rx from 'rxjs';
import * as RxOperators from 'rxjs/operators';

const exposeRxOperatorsScript = `
Object.keys(RxOperators)
  .filter(key => key !== 'window')
  .forEach(key => {
    window[key] = RxOperators[key]
  });

// Cannot assign to read only property 'window' of object '#<Window>'
window.win = RxOperators.window;

`;

const evalInContext = (code, context) => {
  let scope = Object.keys(context)
    .map(key => `let ${key} = this.${key};\n`)
    .join('');

  scope += exposeRxOperatorsScript;

  const codeToEvaluate = `${scope}${code}`;

  // Note that arrow function won't work here because we explicitely set `this` to `context`.
  return function() {
    return eval(codeToEvaluate); // eslint-disable-line no-eval
  }.call(context);
};

export const getObservableFromCode = (code, context) => {
  let observable$;

  try {
    observable$ = evalInContext(code, {
      ...context,
      Rx,
      RxOperators
    });
  } catch (e) {
    return {
      error: e.message
    };
  }

  if (!(observable$ instanceof Rx.Observable)) {
    return {
      error: 'Last expression must be an Observable'
    };
  }

  return {
    observable$
  };
};
