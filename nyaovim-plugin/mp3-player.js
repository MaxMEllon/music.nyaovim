(function() {
  'use strict';
  const fs = require('fs');

  const EventTypes = {
    INIT: 'mp3-player:init',
    OPEN: 'mp3-player:open',
    CLOSE: 'mp3-player:close',
    PLAY: 'mp3-player:play',
    STOP: 'mp3-player:stop',
    NEXT: 'mp3-player:next',
    PREV: 'mp3-player:prev'
  };

  Polymer({
    is: 'mp3-player',

    properties: {
      editor: Object
    },

    initalize() {
      this.playingIndex = 0;
      this.playlist = [];
      this.component = document.getElementById('mp3-player');
      this.body = document.getElementById('mp3-player-body');
      ['close', 'play', 'stop', 'next', 'prev'].forEach((key) => {
        let element = document.getElementById(`mp3-player-${key}`);
        element.addEventListener('click', () => this[key]());
      });
      this.visible = false;
    },

    initPlayList(playListDir) {
      this.playListDir = playListDir;
      console.log(this.playListDir);
      const shuffle = () => {
        let i, j, temp;
        this.playlist.slice();
        i = this.playlist.length;
        if (i === 0) return;
        while (--i) {
          j = Math.floor(Math.random() * (i + 1)); temp = this.playlist[i];
          this.playlist[i] = this.playlist[j];
          this.playlist[j] = temp;
        }
      };
      fs.readdir(this.playListDir, (err, files) => {
        files.filter((file) => {
          name = `${this.playListDir}/${file}`;
          if (fs.statSync(name).isFile() && /.*\.mp3$/.test(name)) {
            this.playlist.push(name.replace(/[ ]+/g, '\\ '));
          }
        });
        shuffle();
      });
    },

    ready() {
      this.initalize();
      this.client = this.editor.getClient();
      this.client.on('notification', (method, args) => {
        switch (method) {
          case EventTypes.INIT:
            this.initPlayList(args[0]);
            break;
          case EventTypes.OPEN:
            this.open();
            break;
          case EventTypes.CLOSE:
            this.close();
            break;
          case EventTypes.PLAY:
            this.play();
            break;
          case EventTypes.STOP:
            this.stop();
            break;
          case EventTypes.NEXT:
            this.next();
            break;
          case EventTypes.PREV:
            this.prev();
            break;
          default:
            // do nothing
            break;
        }
      });
      Object.keys(EventTypes).forEach((key) => this.client.subscribe(EventTypes[key]));
    },

    open() {
      if (this.visible) return;
      this.body.style.display = 'flex';
      this.visible = true;
      this.editor.screen.checkShouldResize();
    },

    close() {
      if (!this.visible) return;
      this.body.style.display = 'none';
      this.visible = false;
      this.editor.screen.checkShouldResize();
    },

    play() {
      new Promise((resolve, reject) => {
        if (this.playing) this.stop();
        try {
          let childProcess = require('child_process');
          let music = this.playlist[this.playingIndex];
          this.showModal();
          this.playing = childProcess.spawn("afplay", [music, '-v', '0.05']);
          this.playing.once('close', (result, signal) => this.next);
          this.playing.once('disconnect', () => this.stop);
          resolve(music);
        } catch (err) {
          console.error(err);
          reject(err);
        }
      }).then((name) => {
        console.log(`now playing : ${name}`);
      }).catch((err) => {
        console.error(err);
      });
    },

    stop() {
      if (this.playing) {
        this.playing.removeListener('close', this.play);
        this.playing.removeListener('disconnect', this.stop);
        this.playing.kill('SIGTERM');
      }
    },

    next() {
      this.playingIndex++;
      this.playingIndex = this.playingIndex % this.playlist.length;
      this.play();
    },

    prev() {
      if (this.playingIndex === 0) {
        this.playingIndex = this.playlist.length - 1;
      } else {
        this.playingIndex--;
        this.playingIndex = this.playingIndex % this.playlist.length;
      }
      this.play();
    },

    showModal() {
      const editor = document.getElementById('nyaovim-editor');
      let modal = document.createElement('div');
      modal.className = 'mp3-player modal nyaovim-editor';
      let title = this.playlist[this.playingIndex].replace(`${this.playListDir}/`, "");
      title = title.length > 15 ? title.slice(0, 15) + ' ...' : title;
      modal.innerHTML = `now playing : ${title}`;
      modal.style.display = 'block';
      editor.appendChild(modal);
      let y = 800;
      let loop = setInterval(() => {
        if (y <= 0) {
          clearInterval(loop);
          modal.parentElement.removeChild(modal);
        }
        modal.style.color = `rgba(255, 255, 255, ${y / 500})`;
        modal.style.backgroundColor = `rgba(100, 100, 255, ${y / 500})`;
        y--;
      }, 0);
    },

  });
})();
