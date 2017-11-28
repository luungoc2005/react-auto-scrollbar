import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './HScroll.css'

export class HScroll extends Component {
  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
  }

  constructor(props) {
    super(props);

    this.maxScrollAmount = 1;

    this.state = {
      gripperTop: 0,
      gripperHeight: 0,
      showScroll: false,
      trackVisible: false,
    }

    this.ticking = false;
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleTrackMouseDown = this.handleTrackMouseDown.bind(this);
    this.trackMouseEnter = this.trackMouseEnter.bind(this);
    this.trackMouseLeave = this.trackMouseLeave.bind(this);
    this.showTrack = this.showTrack.bind(this);
    this.hideTrack = this.hideTrack.bind(this);
    this.timer = null;
    this.trackMouseOver = false;
    this.dragging = false;
  }

  componentDidMount() {
    this.recalculateStyles();
  }

  componentWillUnmount() {
    this.removeEventHandlers();
  }

  addEventHandlers() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  removeEventHandlers() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  trackMouseEnter() {
    this.trackMouseOver = true;
    this.showTrack();
  }

  trackMouseLeave() {
    this.trackMouseOver = false;
  }

  showTrack() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(this.hideTrack, 1000);
    if (!this.state.trackVisible) {
      this.setState({trackVisible: true});
    }
  }

  hideTrack() {
    if (this.trackMouseOver || this.dragging) {
      this.showTrack();
    }
    else {
      this.setState({trackVisible: false});
      this.timer = null;
    }
  }

  handleScroll() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.recalculateStyles();
        this.showTrack();
        this.ticking = false;
      })
      this.ticking = true;
    }
  }

  handleMouseDown(event) {
    if (event.button === 0 && this.rootElement) {
      event.stopPropagation();
      this.pageY = event.pageY;
      this.startPos = this.rootElement.scrollTop;
      this.dragging = true;
      this.addEventHandlers();
    }
  }

  handleMouseMove(event) {
    const pageY = event.pageY;
    if (this.containerRect) {
      const {containerRect} = this;
      if (pageY < containerRect.top) {
        this.scrollTo(0);
      }
      else if (pageY > containerRect.top + containerRect.height) {
        this.scrollTo(this.maxScrollAmount);
      }
      else {
        const coordY = (pageY - this.pageY) * this.multiplier;
        this.scrollTo(this.startPos + coordY);
      }
    }
  }

  handleMouseUp(event) {
    if (event.pageX || event.pageY) {
      this.pageY = null;
      this.startPos = null;
      this.dragging = false;
      this.removeEventHandlers();
    }
  }

  handleTrackMouseDown(event) {
    if (event.button === 0 && this.scrollTrack && this.childElement) {
      const lineHeight = parseFloat(getComputedStyle(this.childElement).lineHeight);
      
      const scrollHeight = (event.pageY - this.trackRect.top) * this.multiplier;
      const scrollChange = scrollHeight - this.rootElement.scrollTop;
      const maxScrollChange = lineHeight * 30;

      if (Math.abs(scrollChange) < maxScrollChange) {
        this.scrollTo(scrollHeight);
      }
      else {
        if (scrollChange > 0) {
          this.scrollTo(this.rootElement.scrollTop + maxScrollChange);
        }
        else {
          this.scrollTo(this.rootElement.scrollTop - maxScrollChange);
        }
      }
    }
  }

  recalculateStyles() {
    if (this.rootElement && this.childElement && this.scrollGripper) {
      this.containerRect = this.rootElement.getBoundingClientRect();

      const containerHeight = this.containerRect.height;
      const childHeight = this.rootElement.scrollHeight;

      this.maxScrollAmount = childHeight - containerHeight;

      this.setState({
        gripperTop: Math.max(0, (this.rootElement.scrollTop / childHeight) * containerHeight - 2),
        gripperHeight: Math.max(1, Math.min(1, containerHeight / childHeight) * containerHeight - 5),
      })

      this.trackRect = this.scrollTrack.getBoundingClientRect();
      this.multiplier = this.maxScrollAmount / this.trackRect.height;
    }
  }

  scrollTo(coordY) {
    if (this.rootElement && this.childElement) {
      this.rootElement.scrollTo(0, coordY);
    }
  }

  render() {
    const {style, children} = this.props;
    return (
      <div style={{
          overflowX: 'hidden',
          position: 'relative',
        }}>
        <div
          className={`scroll-track ${this.state.trackVisible ? 'scroll-track-hover' : ''}`}
          ref={(element) => {if (element) this.scrollTrack = element}}
          onMouseDown={this.handleTrackMouseDown}
          onMouseEnter={this.trackMouseEnter}
          onMouseLeave={this.trackMouseLeave}>
          <div
            className='scroll-gripper'
            ref={(element) => {if (element) this.scrollGripper = element}}
            style={{
              top: `${this.state.gripperTop}px`,
              height: `${this.state.gripperHeight}px`
            }}
            onMouseDown={this.handleMouseDown} />
        </div>
        <div
          style={{
            height: '500px',
            marginRight: '-30px',
            paddingRight: '30px',
            overflowY: 'scroll',
            overflowX: 'hidden',
            // scrollBehavior: 'smooth',
            ...style,
          }}
          ref={(element) => {if (element) this.rootElement = element}}
          onScroll={this.handleScroll}
          onMouseEnter={this.showTrack}
          onMouseLeave={this.hideTrack}>
          <div ref={(element) => {if (element) this.childElement = element}}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default HScroll;
