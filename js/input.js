class Input {
  constructor() {
    this.down = {};
    this.up = {};
    this.pressed = {};
    this.keys = {};
    this.keymap = {
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };

    for (let code in this.keymap) {
      const key = this.keymap[code];
      this.keys[key] = { hold: false, pulse: false };
    }

    // Touch state from buttons
    this._touchHeld = {};

    window.addEventListener('keydown', this.handler.bind(this));
    window.addEventListener('keyup', this.handler.bind(this));

    // Register globally so touch buttons can call us
    window.__touchInput = this;
  }

  // Called by touch buttons
  setKey(key, isDown) {
    if (isDown) {
      this._touchHeld[key] = true;
      if (!this.pressed[key]) {
        this.pressed[key] = true;
        this.down[key] = true;
      }
    } else {
      this._touchHeld[key] = false;
      this.pressed[key] = false;
      this.up[key] = true;
    }
  }

  handler(e) {
    const key = this.keymap[e.which];
    if (!key) return true;

    if (e.type === 'keydown') {
      if (!this.pressed[key]) {
        this.pressed[key] = true;
        this.down[key] = true;
      }
    }
    if (e.type === 'keyup') {
      this.pressed[key] = false;
      this.up[key] = true;
    }
    return false;
  }

  update() {
    for (let code in this.keymap) {
      let key = this.keymap[code];
      let up = this.up[key];
      let down = this.down[key];

      this.keys[key].pulse = down;

      if (down && up) {
        this.keys[key].hold = true;
        this.down[key] = false;
      }
      if (down && !up) {
        this.keys[key].hold = true;
        this.down[key] = false;
      }
      if (!down && up) {
        // If touch button still held, keep hold=true
        if (this._touchHeld[key]) {
          this.keys[key].hold = true;
          this.up[key] = false;
        } else {
          this.keys[key].hold = false;
          this.up[key] = false;
        }
      }

      // If touch is being held, keep firing
      if (this._touchHeld[key] && !down && !up) {
        this.keys[key].hold = true;
      }
    }
  }

  clear() {
    this._touchHeld = {};
    for (let code in this.keymap) {
      let key = this.keymap[code];
      this.keys[key] = { hold: false, pulse: false };
    }
  }
}
