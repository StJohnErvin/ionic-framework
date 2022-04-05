import type { ComponentInterface } from '@stencil/core';
import { Component, Host, Prop, State, h } from '@stencil/core';
import { componentOnReady, addEventListener } from '@utils/helpers';
import { printIonError } from '@utils/logging';
import { createColorClasses } from '@utils/theme';

import { getIonMode } from '../../global/ionic-global';
import type { Color, DatetimePresentation } from '../../interface';
import { getFormattedTime, getMonthAndYear, getMonthDayAndYear, getLocalizedDateTime } from '../datetime/utils/format';
import { is24Hour } from '../datetime/utils/helpers';
import { parseDate } from '../datetime/utils/parse';

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
@Component({
  tag: 'ion-datetime-button',
  styleUrls: {
    ios: 'datetime-button.ios.scss',
    md: 'datetime-button.md.scss',
  },
  shadow: true,
})
export class DatetimeButton implements ComponentInterface {
  private datetimeEl: HTMLIonDatetimeElement | null = null;
  private selectedButton?: 'date' | 'time';

  @State() datetimePresentation?: DatetimePresentation;
  @State() dateText?: string;
  @State() timeText?: string;
  @State() datetimeActive = false;

  /**
   * The color to use from your application's color palette.
   * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
   * For more information on colors, see [theming](/docs/theming/basics).
   */
  @Prop({ reflect: true }) color?: Color = 'primary';

  /**
   * If `true`, the user cannot interact with the button.
   */
  @Prop({ reflect: true }) disabled = false;

  /**
   * The ID of the `ion-datetime` instance
   * associated with the datetime button.
   */
  @Prop() datetime?: string;

  async componentWillLoad() {
    const { datetime } = this;
    if (!datetime) {
      printIonError(
        'An ID associated with an ion-datetime instance is required for ion-datetime-button to function properly.'
      );
      return;
    }

    const datetimeEl = (this.datetimeEl = document.getElementById(datetime) as HTMLIonDatetimeElement | null);
    if (!datetimeEl) {
      printIonError(`No ion-datetime instance found for ID '${datetime}'.`);
      return;
    }

    /**
     * If the datetime is in a modal or
     * a popover we should listen for the
     * present/dismiss events so that the tapped
     * button can be correctly highlighted/activated.
     */
    const overlayEl = datetimeEl.closest('ion-modal, ion-popover');
    if (overlayEl) {
      addEventListener(overlayEl, 'willPresent', () => {
        this.datetimeActive = true;
      });
      addEventListener(overlayEl, 'willDismiss', () => {
        this.datetimeActive = false;
      });
    }

    componentOnReady(datetimeEl, () => {
      this.datetimePresentation = datetimeEl.presentation;

      this.setDateTimeText();
      addEventListener(datetimeEl, 'ionChange', this.setDateTimeText);
    });
  }

  private setDateTimeText = () => {
    const { datetimeEl, datetimePresentation } = this;

    if (!datetimeEl) {
      return;
    }

    const { value, locale, hourCycle } = datetimeEl;
    const parsedDatetime = parseDate(value);
    const use24Hour = is24Hour(locale, hourCycle);

    switch (datetimePresentation) {
      case 'date-time':
      case 'time-date':
        this.dateText = getMonthDayAndYear(locale, parsedDatetime);
        this.timeText = getFormattedTime(parsedDatetime, use24Hour);
        break;
      case 'date':
        this.dateText = getMonthDayAndYear(locale, parsedDatetime);
        break;
      case 'time':
        this.timeText = getFormattedTime(parsedDatetime, use24Hour);
        break;
      case 'month-year':
        this.dateText = getMonthAndYear(locale, parsedDatetime);
        break;
      case 'month':
        this.dateText = getLocalizedDateTime(locale, parsedDatetime, { month: 'long' });
        break;
      case 'year':
        this.dateText = getLocalizedDateTime(locale, parsedDatetime, { year: 'numeric' });
        break;
      default:
        break;
    }
  };

  private handleDateClick = () => {
    const { datetimeEl, datetimePresentation } = this;

    if (!datetimeEl) {
      return;
    }

    /**
     * When clicking the date button,
     * we need to make sure that only a date
     * picker is displayed. For presentation styles
     * that display content other than a date picker,
     * we need to update the presentation style.
     */
    switch (datetimePresentation) {
      case 'date-time':
      case 'time-date':
        datetimeEl.presentation = 'date';
        break;
      default:
        break;
    }

    /**
     * Track which button was clicked
     * so that it can have the correct
     * activated styles applied when
     * the modal/popover containing
     * the datetime is opened.
     */
    this.selectedButton = 'date';
  };

  private handleTimeClick = () => {
    const { datetimeEl, datetimePresentation } = this;

    if (!datetimeEl) {
      return;
    }

    /**
     * When clicking the time button,
     * we need to make sure that only a time
     * picker is displayed. For presentation styles
     * that display content other than a time picker,
     * we need to update the presentation style.
     */
    switch (datetimePresentation) {
      case 'date-time':
      case 'time-date':
        datetimeEl.presentation = 'time';
        break;
      default:
        break;
    }

    /**
     * Track which button was clicked
     * so that it can have the correct
     * activated styles applied when
     * the modal/popover containing
     * the datetime is opened.
     */
    this.selectedButton = 'time';
  };

  render() {
    const { color, dateText, timeText, datetimePresentation, selectedButton, datetimeActive } = this;
    const showDateTarget =
      !datetimePresentation ||
      ['date-time', 'time-date', 'date', 'month', 'year', 'month-year'].includes(datetimePresentation);
    const showTimeTarget = !datetimePresentation || ['date-time', 'time-date', 'time'].includes(datetimePresentation);
    const mode = getIonMode(this);

    return (
      <Host
        class={createColorClasses(color, {
          [mode]: true,
          [`${selectedButton}-active`]: datetimeActive,
        })}
      >
        {showDateTarget && (
          <div class="date-target-container" onClick={() => this.handleDateClick()}>
            <slot name="date-target">
              <button id="date-button" aria-expanded="false">
                {dateText}
              </button>
            </slot>
          </div>
        )}

        {showTimeTarget && (
          <div class="time-target-container" onClick={() => this.handleTimeClick()}>
            <slot name="time-target">
              <button id="time-button" aria-expanded="false">
                {timeText}
              </button>
            </slot>
          </div>
        )}
      </Host>
    );
  }
}
