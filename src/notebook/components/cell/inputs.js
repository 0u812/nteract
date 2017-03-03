// @flow
import React from 'react';

type Props = {
  executionCount: any,
  running: boolean,
  type: String,
};

export default function Inputs(props: Props): ?React.Element<any> {
  const { executionCount, running } = props;
  const count = !executionCount ? ' ' : executionCount;
  const input = running ? '*' : count;

  return (
    props.type === 'omex' ?
    <div className="prompt">
      <span className="teicon">
        <svg>
          <use xlinkHref="../static/assets/symbol-defs.svg#teicon-combine"></use>
        </svg>
      </span>
      [{input}]
    </div> :
    props.type === 'antimony' ?
    <div className="prompt">
      <span className="teicon">
        <svg>
          <use xlinkHref="../static/assets/symbol-defs.svg#teicon-antimony"></use>
        </svg>
      </span>
      [{input}]
    </div> :
    <div className="prompt">
      <span className="teicon">
        <svg>
          <use xlinkHref="../static/assets/symbol-defs.svg#teicon-python"></use>
        </svg>
      </span>
      [{input}]
    </div>
  );
}
