import React from 'react';

class WithScript extends React.Component {
    componentDidMount() {
        this.props.script()
    }

    render() {
      return <div>{this.props.children}</div>;
    }
}

export default WithScript;