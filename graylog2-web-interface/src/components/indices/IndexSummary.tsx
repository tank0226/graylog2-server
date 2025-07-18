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

import { Label, Button } from 'components/bootstrap';
import { RelativeTime, Icon } from 'components/common';
import IndexSizeSummary from 'components/indices/IndexSizeSummary';

type Props = {
  children: React.ReactNode;
  index: any;
  indexRange?: any;
  isDeflector: boolean;
  name: string;
};

class IndexSummary extends React.Component<Props, { showDetails: boolean }> {
  static defaultProps = {
    indexRange: undefined,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      showDetails: props.isDeflector,
    };
  }

  _formatLabels = (index) => {
    const labels = [];

    if (index.is_deflector) {
      labels.push(
        <Label key={`${this.props.name}-deflector-label`} bsStyle="primary">
          active write index
        </Label>,
      );
    }

    if (index.is_closed) {
      labels.push(
        <Label key={`${this.props.name}-closed-label`} bsStyle="warning">
          closed
        </Label>,
      );
    }

    if (index.is_reopened) {
      labels.push(
        <Label key={`${this.props.name}-reopened-label`} bsStyle="success">
          reopened
        </Label>,
      );
    }

    return <span className="index-label">{labels}</span>;
  };

  _formatIndexRange = () => {
    if (this.props.isDeflector) {
      return (
        <span>
          Contains messages up to <RelativeTime dateTime={new Date()} />
        </span>
      );
    }

    const sizes = this.props.index.size;

    if (sizes) {
      const count = sizes.events;
      const { deleted } = sizes;

      if (count === 0 || count - deleted === 0) {
        return 'Index does not contain any messages.';
      }
    }

    if (!this.props.indexRange) {
      return 'Time range of index is unknown, because index range is not available. Please recalculate index ranges manually.';
    }

    if (this.props.indexRange.begin === 0) {
      return (
        <span>
          Contains messages up to <RelativeTime dateTime={this.props.indexRange.end} />
        </span>
      );
    }

    return (
      <span>
        Contains messages from <RelativeTime dateTime={this.props.indexRange.begin} /> up to{' '}
        <RelativeTime dateTime={this.props.indexRange.end} />
      </span>
    );
  };

  _formatShowDetailsLink = () => {
    if (this.state.showDetails) {
      return (
        <span className="index-more-actions">
          <Icon name="arrow_drop_down" /> Hide Details / Actions
        </span>
      );
    }

    return (
      <span className="index-more-actions">
        <Icon name="arrow_right" /> Show Details / Actions
      </span>
    );
  };

  _toggleShowDetails = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    const { index } = this.props;

    return (
      <span>
        <h2>
          {this.props.name}{' '}
          <small>
            {this._formatLabels(index)} {this._formatIndexRange()} <IndexSizeSummary index={index} />
            <Button onClick={this._toggleShowDetails} bsStyle="link">
              {this._formatShowDetailsLink()}
            </Button>
          </small>
        </h2>

        <div className="index-info-holder">{this.state.showDetails && this.props.children}</div>
      </span>
    );
  }
}

export default IndexSummary;
