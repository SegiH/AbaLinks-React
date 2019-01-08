import React, { Component } from 'react';

class Select extends Component {
     render() {
          return (
               <select value={this.props.value} onChange={this.props.typeChanged.bind(this)}>
                    {this.props.options}
              </select>
          );
     }
}

export default Select;
