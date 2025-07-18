/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React from 'react';

import { Row, Col, Input } from 'components/bootstrap';

import GrokPatternFilter from './GrokPatternFilter';

type GrokPatternInputProps = {
  pattern?: string;
  patterns?: any[];
  onPatternChange?: (...args: any[]) => void;
  className?: string;
};

class GrokPatternInput extends React.Component<
  GrokPatternInputProps,
  {
    [key: string]: any;
  }
> {
  private patternInput: Input;

  static defaultProps = {
    pattern: '',
    patterns: [],
    onPatternChange: () => {},
    className: '',
  };

  _addToPattern = (name) => {
    const { pattern, onPatternChange } = this.props;
    const index = this.patternInput.getInputDOMNode().selectionStart || pattern.length;
    const newPattern = `${pattern.slice(0, index)}%{${name}}${pattern.slice(index)}`;

    onPatternChange(newPattern);
  };

  _onPatternChange = (e) => {
    const { onPatternChange } = this.props;

    onPatternChange(e.target.value);
  };

  render() {
    const { className, patterns, pattern } = this.props;

    return (
      <Row className={className}>
        <Col sm={8}>
          <Input
            ref={(node) => {
              this.patternInput = node;
            }}
            type="textarea"
            id="pattern-input"
            label="Pattern"
            help="The pattern which will match the log line e.g: '%{IP:client}' or '.*?'"
            rows={9}
            onChange={this._onPatternChange}
            value={pattern}
            required
          />
        </Col>
        <Col sm={4}>
          <GrokPatternFilter addToPattern={this._addToPattern} patterns={patterns} />
        </Col>
      </Row>
    );
  }
}

export default GrokPatternInput;
