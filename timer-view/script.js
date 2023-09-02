//определяю класс, в котором опишу поведение своего компонента
class TimerView extends HTMLElement {

  //определил список атрибутов, подлежащих наблюдению
  static get observedAttributes() {
    return ['seconds', 'to-time'];
  }

  //создаю теневое дерево и вызываю render
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  //отрисовка
  render() {
    const secondsAttr = this.getAttribute('seconds');
    const toTimeAttr = this.getAttribute('to-time');

    let remainingTime = 0;

    if (secondsAttr) {
      remainingTime = parseInt(secondsAttr, 10);
    } else if (toTimeAttr) {
      const currentTime = new Date();
      const toTimeParts = toTimeAttr.split(':');
      const toTimeHours = parseInt(toTimeParts[0], 10);
      const toTimeMinutes = parseInt(toTimeParts[1], 10);
      const toTimeSeconds = parseInt(toTimeParts[2], 10);
      const endTime = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate(),
        toTimeHours,
        toTimeMinutes,
        toTimeSeconds
      );
      remainingTime = Math.floor((endTime - currentTime) / 1000);
    }

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const secondsToShow = remainingTime % 60;

    let timeString = '';

    //если нет часов в таймере, то отрисовываются только мм:сс
    if (remainingTime <= 0) {
      timeString = '00:00';
    } else {
      if (hours > 0) {
        timeString += hours.toString().padStart(2, '0') + ':';
      }

      timeString += minutes.toString().padStart(2, '0') + ':';
      timeString += secondsToShow.toString().padStart(2, '0');
    }

    //вот это мне совсем не нравится, но не придумал, как по-другому
    //через css напрямую не работает, нет отрисовки, элемент невидимый
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
      </style>
      <span>${timeString}</span>
    `;
  }

  //функциональность таймера
  startTimer() {
    if (!interval) {
      const secondsAttr = this.getAttribute('seconds');
      const toTimeAttr = this.getAttribute('to-time');

      if (secondsAttr) {
        let seconds = parseInt(secondsAttr, 10);
        this.setAttribute('seconds', (seconds - 1).toString());

        interval = setInterval(() => {
          seconds--;
          this.setAttribute('seconds', seconds.toString());

          if (seconds === 0) {
            clearInterval(interval);
            interval = null;

            const endEvent = new CustomEvent('endtimer');
            this.dispatchEvent(endEvent);
          }
        }, 1000);
      } else if (toTimeAttr) {
        const currentTime = new Date();
        const toTimeParts = toTimeAttr.split(':');
        const toTimeHours = parseInt(toTimeParts[0], 10);
        const toTimeMinutes = parseInt(toTimeParts[1], 10);
        const toTimeSeconds = parseInt(toTimeParts[2], 10);
        const endTime = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate(),
          toTimeHours,
          toTimeMinutes,
          toTimeSeconds
        );
        const remainingTime = Math.floor((endTime - currentTime) / 1000);

        let seconds = remainingTime;
        this.setAttribute('seconds', seconds.toString());

        interval = setInterval(() => {
          seconds--;
          this.setAttribute('seconds', seconds.toString());

          if (seconds === 0) {
            clearInterval(interval);
            interval = null;

            const endEvent = new CustomEvent('endtimer');
            this.dispatchEvent(endEvent);
          }
        }, 1000);
      }
    }
  }
}

//определил timer-view и связал с конструктором класса TimerView
customElements.define('timer-view', TimerView);


//получаем элементы, с которыми будем взаимодействовать
const timer = document.querySelector('timer-view');

//конкретно на эти повесим слушатели событий
const startButton = document.querySelector('#startButton');
const pauseButton = document.querySelector('#pauseButton');
const resetButton = document.querySelector('#resetButton');

//навесил слушатели. подписал элементы на пользовательские события
startButton.addEventListener('click', () => {
  const startEvent = new CustomEvent('starttimer');
  timer.dispatchEvent(startEvent);
});

pauseButton.addEventListener('click', () => {
  const pauseEvent = new CustomEvent('pausetimer');
  timer.dispatchEvent(pauseEvent);
});

resetButton.addEventListener('click', () => {
  const resetEvent = new CustomEvent('resettimer');
  timer.dispatchEvent(resetEvent);
});

//переменная хранит идентификатор интервала таймера
let interval;

//еще один слушатель для кнопки старт, где я проверяю,
//какой именно атрибут сейчас задан (seconds или to-time)
startButton.addEventListener('click', () => {
  if (!interval) {
    const secondsAttr = timer.getAttribute('seconds');
    const toTimeAttr = timer.getAttribute('to-time');

    if (secondsAttr) {
      let seconds = parseInt(secondsAttr, 10);
      timer.setAttribute('seconds', (seconds - 1).toString());

      interval = setInterval(() => {
        seconds--;
        timer.setAttribute('seconds', seconds.toString());

        if (seconds === 0) {
          clearInterval(interval);
          interval = null;
        }
      }, 1000);
    } else if (toTimeAttr) {
      const currentTime = new Date();
      const toTimeParts = toTimeAttr.split(':');
      const toTimeHours = parseInt(toTimeParts[0], 10);
      const toTimeMinutes = parseInt(toTimeParts[1], 10);
      const toTimeSeconds = parseInt(toTimeParts[2], 10);
      const endTime = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate(),
        toTimeHours,
        toTimeMinutes,
        toTimeSeconds
      );
      const remainingTime = Math.floor((endTime - currentTime) / 1000);

      let seconds = remainingTime;
      timer.setAttribute('seconds', seconds.toString());

      interval = setInterval(() => {
        seconds--;
        timer.setAttribute('seconds', seconds.toString());

        if (seconds === 0) {
          clearInterval(interval);
          interval = null;
        }
      }, 1000);
    }
  }
});

//обработчик для кнопки паузы
pauseButton.addEventListener('click', () => {
  clearInterval(interval);
  interval = null;
});

//обработчик для кнопки сброса
resetButton.addEventListener('click', () => {
  clearInterval(interval);
  interval = null;
  timer.removeAttribute('seconds');
});
