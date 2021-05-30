import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import classes from "./VerificationCode.module.css";

const KEY_CODE = {
  backspace: 8,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};

interface Props {
  type: "text" | "number";
  onChange: (val: string) => void;
  onComplete: (val: string) => void;
  error: boolean;
  fields?: number;
  loading?: boolean;
  fieldWidth?: number;
  fieldHeight?: number;
  autoFocus: boolean;
  className?: string;
  values?: string[];
  disabled?: boolean;
  required?: boolean;
}

export class VerificationCodeInput extends Component<Props, any> {
  static propTypes = {
    type: PropTypes.oneOf(["text", "number"]),
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    error: PropTypes.bool,
    fields: PropTypes.number,
    loading: PropTypes.bool,
    fieldWidth: PropTypes.number,
    fieldHeight: PropTypes.number,
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.string),
    disabled: PropTypes.bool,
    required: PropTypes.bool,
  };
  iRefs: any[];
  id: number;

  static defaultProps = {
    type: "number",
    fields: 6,
    fieldWidth: 58,
    fieldHeight: 54,
    autoFocus: true,
    disabled: false,
    required: false,
    error: false,
  };

  constructor(props: Props) {
    super(props);
    const { fields, values } = props;
    let vals;
    let autoFocusIndex = 0;
    if (values && values.length && fields) {
      vals = [];
      for (let i = 0; i < fields; i++) {
        vals.push(values[i] || "");
      }
      autoFocusIndex = values.length >= fields ? 0 : values.length;
    } else {
      vals = Array(fields).fill("");
    }
    this.state = { values: vals, autoFocusIndex, activeIndex: 0 };

    this.iRefs = [];
    if (fields) {
      for (let i = 0; i < fields; i++) {
        this.iRefs.push(React.createRef());
      }
    }
    this.id = +new Date();

    // this.handleKeys = Array(fields).fill(false);
  }

  /**
   * Clear all field value & focus first field
   */
  __clearvalues__ = () => {
    const { fields } = this.props;
    this.setState({ values: Array(fields).fill("") });
    this.iRefs[0]!.current!.focus();
  };

  triggerChange = (values = this.state.values) => {
    const { onChange, onComplete, fields } = this.props;
    const val = values.join("");
    onChange && onChange(val);
    if (typeof onComplete === "function" && fields && val.length >= fields) {
      onComplete(val);
    }
  };

  onChange = (e: any) => {
    const index = parseInt(e.target.dataset.id);
    if (this.props.type === "number") {
      e.target.value = e.target.value.replace(/[^\d]/gi, "");
    }
    // this.handleKeys[index] = false;
    if (
      e.target.value === "" ||
      (this.props.type === "number" && !e.target.validity.valid)
    ) {
      return;
    }
    const { fields } = this.props;
    let next;
    const value = e.target.value;
    let { values } = this.state;
    values = Object.assign([], values);
    if (value.length > 1 && fields) {
      let nextIndex = value.length + index - 1;
      if (nextIndex >= fields) {
        nextIndex = fields - 1;
      }
      next = this.iRefs[nextIndex];
      const split = value.split("");
      split.forEach((item: any, i: number) => {
        const cursor = index + i;
        if (cursor < fields) {
          values[cursor] = item;
        }
      });
      this.setState({ values });
    } else {
      next = this.iRefs[index + 1];
      values[index] = value;
      this.setState({ values });
    }

    if (next) {
      next.current.focus();
      next.current.select();
    }

    this.triggerChange(values);
  };

  onKeyDown = (e: any) => {
    const index = parseInt(e.target.dataset.id);
    const prevIndex = index - 1;
    const nextIndex = index + 1;
    const prev = this.iRefs[prevIndex];
    const next = this.iRefs[nextIndex];
    switch (e.keyCode) {
      case KEY_CODE.backspace:
        e.preventDefault();
        const vals = [...this.state.values];
        if (this.state.values[index]) {
          vals[index] = "";
          this.setState({ values: vals });
          this.triggerChange(vals);
        } else if (prev) {
          vals[prevIndex] = "";
          prev.current.focus();
          this.setState({ values: vals });
          this.triggerChange(vals);
        }
        break;
      case KEY_CODE.left:
        e.preventDefault();
        if (prev) {
          prev.current.focus();
        }
        break;
      case KEY_CODE.right:
        e.preventDefault();
        if (next) {
          next.current.focus();
        }
        break;
      case KEY_CODE.up:
      case KEY_CODE.down:
        e.preventDefault();
        break;
      default:
        // this.handleKeys[index] = true;
        break;
    }
  };

  displayInputItem = (
    value: string,
    index: number,
    autoFocusIndex: number,
    INPUT_STYLE: any,
    error: boolean
  ) => (
    <Fragment key={index}>
      <div
        className={classes["input-wrapper"]}
        style={{
          borderTopLeftRadius: index === 0 || index === 3 ? "5px" : 0,
          borderBottomLeftRadius:
            !error && (index === 0 || index === 3) ? "5px" : 0,
          borderTopRightRadius: index === 2 || index === 5 ? "5px" : 0,
          borderBottomRightRadius:
            !error && (index === 2 || index === 5) ? "5px" : 0,
          border: error
            ? "none"
            : index === this.state.activeIndex
            ? "1px solid #3f51b5"
            : "1px solid #dedede",
          boxShadow:
            index === this.state.activeIndex
              ? "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)"
              : "none",
          borderBottom: error ? "3px solid #f44336" : "none",
        }}
      >
        <input
          type={"tel"}
          pattern={"[0-9]*"}
          autoFocus={index === autoFocusIndex}
          style={INPUT_STYLE}
          key={`${this.id}-${index}`}
          data-id={index}
          value={value}
          ref={this.iRefs[index]}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onFocus={(e) => {
            this.onFocus(e);
            setTimeout(() => {
              this.setState({ ...this.state, activeIndex: index });
            }, 0);
          }}
          disabled={this.props.disabled}
          required={this.props.required}
        />
      </div>
      {[0, 1, 3, 4].includes(index) ? (
        <div className={classes.InputSeperator}></div>
      ) : null}
    </Fragment>
  );

  // onKeyUp = e => {
  //   const index = parseInt(e.target.dataset.id);
  //   if (this.handleKeys[index]) {
  //     this.handleKeys[index] = false;
  //     const next = this.iRefs[index + 1];
  //     if (next) {
  //       next.current.focus();
  //     }
  //   }
  // };

  onFocus = (e: any) => {
    e.target.select(e);
  };

  render() {
    const { values, autoFocusIndex } = this.state;
    const { fieldHeight, fieldWidth, error } = this.props;
    const INPUT_STYLE = {
      width: fieldWidth,
      //   height: fieldHeight,
    };

    return (
      <div className={classes["react-code-input"]}>
        {values
          .slice(0, 3)
          .map((value: string, index: number) =>
            this.displayInputItem(
              value,
              index,
              autoFocusIndex,
              INPUT_STYLE,
              error
            )
          )}
        <div className={classes.Seperator}>-</div>
        {values
          .slice(3, 6)
          .map((value: string, index: number) =>
            this.displayInputItem(
              value,
              index + 3,
              autoFocusIndex,
              INPUT_STYLE,
              error
            )
          )}
      </div>
    );
  }
}
