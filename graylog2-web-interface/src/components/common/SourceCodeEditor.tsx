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
import isFinite from 'lodash/isFinite';
import { Resizable } from 'react-resizable';
import AceEditor from 'react-ace';
import styled, { css } from 'styled-components';
import type { IAnnotation } from 'react-ace';

import { qualifyUrl } from 'util/URLUtils';
import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';
import OverlayTrigger from 'components/common/OverlayTrigger';
import { Button, ButtonGroup, ButtonToolbar } from 'components/bootstrap';
import PipelineRulesMode from 'components/rules/mode-pipeline';

import ClipboardButton from './ClipboardButton';
import Icon from './Icon';

import './webpack-resolver';
import './ace/theme-graylog';

type ContainerProps = {
  $resizable: boolean;
};
const SourceCodeContainer = styled.div<ContainerProps>(
  ({ $resizable, theme }) => css`
    .react-resizable-handle {
      z-index: 100; /* Ensure resize handle is over text editor */
      display: ${$resizable ? 'block' : 'none'};
    }

    ${theme.components.aceEditor}
  `,
);

const Toolbar = styled.div(
  ({ theme }) => css`
    background: ${theme.colors.global.contentBackground};
    border: 1px solid ${theme.colors.input.border};
    border-bottom: 0;
    border-radius: 0;

    .btn-link {
      color: ${theme.colors.variant.dark.info};

      &:hover {
        color: ${theme.colors.variant.darkest.info};
        background-color: ${theme.colors.variant.lightest.info};
      }

      &.disabled,
      &[disabled] {
        color: ${theme.colors.variant.light.default};

        &:hover {
          color: ${theme.colors.variant.light.default};
        }
      }
    }
  `,
);

type AvailableModes = 'json' | 'lua' | 'markdown' | 'text' | 'yaml' | 'pipeline';

/**
 * Component that renders a source code editor input. This is what powers the pipeline rules and collector
 * editors.
 *
 * **Note:** The component needs to be used in a [controlled way](https://reactjs.org/docs/forms.html#controlled-components).
 * Letting the component handle its own internal state may lead to weird errors while typing.
 */
type Props = {
  annotations?: Array<IAnnotation>;
  focus?: boolean;
  fontSize?: number;
  height?: number;
  width?: number;
  id: string;
  innerRef?: React.MutableRefObject<AceEditor>;
  mode?: AvailableModes;
  onLoad?: () => void;
  onChange?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  resizable?: boolean;
  toolbar?: boolean;
  value?: string;
  wrapEnabled?: boolean;
};

type State = {
  height?: number;
  width?: number;
  selectedText?: string;
};

class SourceCodeEditor extends React.Component<Props, State> {
  static defaultProps = {
    annotations: [],
    focus: false,
    fontSize: 13,
    height: 200,
    innerRef: undefined,
    mode: 'text',
    onChange: () => {},
    onBlur: () => {},
    onLoad: () => {},
    readOnly: false,
    resizable: true,
    toolbar: true,
    value: undefined,
    width: Infinity,
    wrapEnabled: false,
  };

  private reactAce: AceEditor;

  private readonly overlayContainerRef: React.RefObject<any>;

  constructor(props) {
    super(props);

    this.state = {
      height: props.height,
      width: props.width,
      selectedText: '',
    };

    this.overlayContainerRef = React.createRef();
  }

  componentDidMount() {
    const { mode } = this.props;

    if (mode === 'pipeline') {
      const url = qualifyUrl(ApiRoutes.RulesController.functions().url);

      fetch('GET', url).then((response) => {
        if (!Array.isArray(response)) return '';

        const functions = response.map((res) => res.name).join('|');
        const pipelineRulesMode = new PipelineRulesMode(functions);

        this.reactAce.editor.getSession().setMode(pipelineRulesMode);

        return functions;
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { height, width } = this.props;

    if (height !== prevProps.height || width !== prevProps.width) {
      this.reloadEditor();
    }
  }

  handleResize = (_event: React.ChangeEvent<unknown>, { size }) => {
    const { height, width } = size;

    this.setState({ height: height, width: width }, this.reloadEditor);
  };

  reloadEditor = () => {
    const { resizable } = this.props;

    if (resizable) {
      this.reactAce.editor.resize();
    }
  };

  isCopyDisabled = () => this.props.readOnly || this.state.selectedText === '';

  isPasteDisabled = () => this.props.readOnly;

  isRedoDisabled = () =>
    this.props.readOnly || !this.reactAce || !this.reactAce.editor.getSession().getUndoManager().hasRedo();

  isUndoDisabled = () =>
    this.props.readOnly || !this.reactAce || !this.reactAce.editor.getSession().getUndoManager().hasUndo();

  handleRedo = () => {
    this.reactAce.editor.redo();
    this.focusEditor();
  };

  handleUndo = () => {
    this.reactAce.editor.undo();
    this.focusEditor();
  };

  handleSelectionChange = (selection) => {
    const { toolbar, readOnly } = this.props;

    if (!this.reactAce || !toolbar || readOnly) {
      return;
    }

    const selectedText = this.reactAce.editor.getSession().getTextRange(selection.getRange());

    this.setState({ selectedText: selectedText });
  };

  focusEditor = () => {
    this.reactAce.editor.focus();
  };

  render() {
    const { height, width, selectedText } = this.state;
    const {
      resizable,
      toolbar,
      annotations,
      focus,
      fontSize,
      mode,
      id,
      innerRef,
      onLoad,
      onChange,
      onBlur,
      readOnly,
      value,
      wrapEnabled,
    } = this.props;
    const validCssWidth = isFinite(width) ? width : '100%';
    const overlay = (
      <>Press Ctrl+V (&#8984;V in macOS) or select Edit&thinsp;&rarr;&thinsp;Paste to paste from clipboard.</>
    );

    return (
      <div className="source-code-editor">
        {toolbar && (
          <Toolbar style={{ width: validCssWidth }}>
            <ButtonToolbar>
              <ButtonGroup ref={this.overlayContainerRef}>
                <ClipboardButton
                  title={<Icon name="content_copy" />}
                  bsStyle="link"
                  bsSize="sm"
                  onSuccess={this.focusEditor}
                  text={selectedText}
                  buttonTitle="Copy (Ctrl+C / &#8984;C)"
                  disabled={this.isCopyDisabled()}
                />
                <OverlayTrigger placement="top" trigger="click" overlay={overlay} rootClose width={250}>
                  <Button
                    bsStyle="link"
                    bsSize="sm"
                    title="Paste (Ctrl+V / &#8984;V)"
                    disabled={this.isPasteDisabled()}>
                    <Icon name="content_copy" />
                  </Button>
                </OverlayTrigger>
              </ButtonGroup>
              <ButtonGroup>
                <Button
                  bsStyle="link"
                  bsSize="sm"
                  onClick={this.handleUndo}
                  title="Undo (Ctrl+Z / &#8984;Z)"
                  disabled={this.isUndoDisabled()}>
                  <Icon name="undo" />
                </Button>
                <Button
                  bsStyle="link"
                  bsSize="sm"
                  onClick={this.handleRedo}
                  title="Redo (Ctrl+Shift+Z / &#8984;&#8679;Z)"
                  disabled={this.isRedoDisabled()}>
                  <Icon name="redo" />
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Toolbar>
        )}
        <Resizable height={height} width={width} minConstraints={[200, 200]} onResize={this.handleResize}>
          <SourceCodeContainer style={{ height: height, width: validCssWidth }} $resizable={resizable}>
            <AceEditor
              ref={(c) => {
                this.reactAce = c;
                if (innerRef) {
                  innerRef.current = c;
                }
              }}
              annotations={annotations}
              // Convert Windows line breaks to Unix. See issue #7889
              setOptions={{ newLineMode: 'unix' }}
              focus={focus}
              fontSize={fontSize}
              mode={mode}
              theme="graylog"
              name={id}
              height="100%"
              onLoad={onLoad}
              onChange={onChange}
              onBlur={onBlur}
              onSelectionChange={this.handleSelectionChange}
              readOnly={readOnly}
              value={value}
              width="100%"
              wrapEnabled={wrapEnabled}
            />
          </SourceCodeContainer>
        </Resizable>
      </div>
    );
  }
}

export default SourceCodeEditor;
