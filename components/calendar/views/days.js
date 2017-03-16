import React, { PropTypes } from 'react';

import { getClassNamesWithMods, getDataAttributes } from '../../_helpers';
import calendarConstants from '../constants/calendar';

const { CALENDAR_SELECTION_TYPE_RANGE } = calendarConstants;

class Days extends React.Component {
  constructor() {
    super();

    this.isOptionEnabled = this.isOptionEnabled.bind(this);
    this.renderDays = this.renderDays.bind(this);
    this.renderNav = this.renderNav.bind(this);
    this.renderWeekDays = this.renderWeekDays.bind(this);
  }

  /**
   * Returns the number of days that a given month has.
   *
   * @method getNumberOfDaysInMonth
   * @param {Number} monthNumber Number of the month (from 0 to 11) of which to check the number of days.
   * @return {Number}
   */
  getNumberOfDaysInMonth(monthNumber) {
    const { renderDate } = this.props;
    const year = renderDate.getFullYear();

    if (monthNumber === 1) {
      const isLeapYear = (((year % 100) !== 0) && ((year % 4) === 0)) || ((year % 400) === 0);
      return isLeapYear ? 29 : 28;
    } else if ([3, 5, 8, 10].includes(monthNumber)) {
      return 30;
    }

    return 31;
  }

  /**
   * If any of the boundaries is defined and the date being rendered is out of those boundaries
   * or if there's a function to check if the day is selectable and it returns false,
   * returns false.
   *
   * @method isOptionEnabled
   * @param {Date} dateToBeRendered Date object to be verified.
   * @return {Boolean} Returns true when enabled, false when disabled.
   */
  isOptionEnabled(dateToBeRendered) {
    const { isDaySelectableFn, maxDate, minDate } = this.props;

    if (
      (maxDate && (maxDate.getTime() < dateToBeRendered.getTime())) ||
      (minDate && (minDate.getTime() > dateToBeRendered.getTime())) ||
      (isDaySelectableFn && !isDaySelectableFn(dateToBeRendered))
     ) {
      return false;
    }

    return true;
  }

  /**
   * Renders the options with the days in the view.
   * It does so, by calculating the number of days needed from the previous month and,
   * starting from that day, iterates 42 days (to fill in all the 'options' in the calendar).
   * While doing so, it handles the classes that the option element must have. Depending on
   * if it is a 'range' or 'normal' calendar will determine how the selection (when applicable)
   * should be rendered.
   * Also handles the special case where, in a 'range' calendar, if both start and end dates are
   * equal, it displays as a 'normal' selection (with the 'selected' modifier).
   *
   * @method renderDays
   * @return {HTMLElement}
   */
  renderDays() {
    const { locale, onSelectDay, renderDate, selectedDates, selectionType } = this.props;
    const { startWeekDay } = locale;

    /** Calculates the amount of days that  */
    const currentDate = new Date(renderDate.getFullYear(), renderDate.getMonth(), 1, 0, 0, 0);
    const firstWeekDayOfMonth = currentDate.getDay();
    const numDaysOfPreviousMonth = firstWeekDayOfMonth < startWeekDay ? 6 : (firstWeekDayOfMonth - startWeekDay);

    currentDate.setDate(currentDate.getDate() - numDaysOfPreviousMonth);

    const options = [];
    let counter = 0;

    const limits = selectedDates.map(item => (item ? item.getTime() : null));
    const selectedDatesAreEqual = (limits.length === 2) && (limits[0] === limits[1]);

    while (counter < 42) {
      const extraClasses = [];
      const selectedDate = selectedDates && selectedDates.find((item) => {
        return item && (item.toDateString() === currentDate.toDateString());
      });

      if (currentDate.getMonth() < renderDate.getMonth()) {
        extraClasses.push('previous-month');
      } else if (currentDate.getMonth() > renderDate.getMonth()) {
        extraClasses.push('next-month');
      }

      if (selectedDate) {
        if ((selectionType === CALENDAR_SELECTION_TYPE_RANGE) && !selectedDatesAreEqual) {
          extraClasses.push((selectedDates.indexOf(selectedDate) === 0) ? 'selected-start' : 'selected-end');
        } else {
          extraClasses.push('selected');
        }
      } else if (limits[1] && (limits[0] <= currentDate.getTime()) && (limits[1] >= currentDate.getTime())) {
        extraClasses.push('selected-between');
      }

      const className = getClassNamesWithMods('ui-calendar-days-option', extraClasses);

      const onClickHandler = onSelectDay ? onSelectDay.bind(null, new Date(currentDate.toDateString())) : undefined;
      options.push(
        <button
          className={className}
          disabled={!this.isOptionEnabled(currentDate)}
          key={`option_${counter}`}
          onClick={onClickHandler}
          type="button"
        >{currentDate.getDate()}</button>
      );
      currentDate.setDate(currentDate.getDate() + 1);
      counter += 1;
    }

    return <div className="ui-calendar-days__options">{options}</div>;
  }

  /**
   * Renders the navigation of the days' calendar.
   *
   * @method renderNav
   * @return {HTMLElement}
   */
  renderNav() {
    const { renderDate, locale, minDate, maxDate, onNavPreviousMonth, onNavNextMonth } = this.props;

    const isPreviousMonthDisabled = minDate && (minDate.getMonth() >= renderDate.getMonth());
    const isNextMonthDisabled = maxDate && (maxDate.getMonth() <= renderDate.getMonth());

    return (
      <nav>
        <button disabled={isPreviousMonthDisabled} onClick={onNavPreviousMonth} type="button">&lt;</button>
        <label>{locale.months[renderDate.getMonth()].short} {renderDate.getFullYear()}</label>
        <button disabled={isNextMonthDisabled} onClick={onNavNextMonth} type="button">&gt;</button>
      </nav>
    );
  }

  /**
   * Renders the week days header of the days' calendar.
   *
   * @method renderWeekDays
   * @return {HTMLElement}
   */
  renderWeekDays() {
    const { locale } = this.props;
    const { startWeekDay, weekDays } = locale;
    return (
      <header>
        {weekDays.slice(startWeekDay).map((weekDay, idx) => {
          return <div className="ui-calendar-days__weekday" key={`weekDay_${idx}`}>{weekDay.short}</div>;
        })}
        {startWeekDay > 0 ? <div className="ui-calendar-days__weekday">{weekDays[0].short}</div> : null}
      </header>
    );
  }

  render() {
    const { dataAttrs, mods } = this.props;
    const className = getClassNamesWithMods('ui-calendar-days', mods);
    const restProps = getDataAttributes(dataAttrs);

    return (
      <div className={className} {...restProps}>
        {this.renderNav()}
        {this.renderWeekDays()}
        {this.renderDays()}
      </div>
    );
  }
}

Days.defaultProps = {
  dataAttrs: {},
  hide: false,
  locale: {
    months: [
      { name: 'January', short: 'Jan' },
      { name: 'February', short: 'Feb' },
      { name: 'March', short: 'Mar' },
      { name: 'April', short: 'Apr' },
      { name: 'May', short: 'May' },
      { name: 'June', short: 'Jun' },
      { name: 'July', short: 'Jul' },
      { name: 'August', short: 'Aug' },
      { name: 'September', short: 'Sep' },
      { name: 'October', short: 'Oct' },
      { name: 'November', short: 'Nov' },
      { name: 'December', short: 'Dec' },
    ],
    startWeekDay: 1,
    weekDays: [
      { name: 'Sunday', short: 'Sun' },
      { name: 'Monday', short: 'Mon' },
      { name: 'Tuesday', short: 'Tue' },
      { name: 'Wednesday', short: 'Wed' },
      { name: 'Thursday', short: 'Thu' },
      { name: 'Friday', short: 'Fri' },
      { name: 'Saturday', short: 'Sat' },
    ],
  },
  maxDate: null,
  minDate: null,
  mods: [],
};

Days.propTypes = {
  /**
   * Data attribute. You can use it to set up GTM key or any custom data-* attribute
   */
  dataAttrs: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),

  /**
   * Optional. Function to be triggered to evaluate if the date (passed as an argument)
   * is selectable. Must return a boolean.
   */
  isDaySelectableFn: PropTypes.func,

  /**
   * Locale definitions, with the calendar's months and weekdays in the right language.
   * Also contains the startWeekDay which defines in which week day starts the week.
   */
  locale: PropTypes.shape({
    months: PropTypes.array.isRequired,
    weekDays: PropTypes.array.isRequired,
    startWeekDay: PropTypes.number.isRequired,
  }),

  /**
   * You can provide set of custom modifications.
   */
  mods: PropTypes.arrayOf(PropTypes.string),

  /**
   * Sets the max date boundary. Defaults to `null`.
   */
  maxDate: PropTypes.objectOf(Date),

  /**
   * Sets the min date boundary. Defaults to `null`.
   */
  minDate: PropTypes.objectOf(Date),

  /**
   * Function to be triggered when pressing the nav's "next" button.
   */
  onNavNextMonth: PropTypes.func,

  /**
   * Function to be triggered when pressing the nav's "previous" button.
   */
  onNavPreviousMonth: PropTypes.func,

  /**
   * Function to be triggered when selecting a day.
   */
  onSelectDay: PropTypes.func,

  /**
   * Date to be rendered in the view
   */
  renderDate: PropTypes.objectOf(Date).isRequired,

  /**
   * Date that is selected (might not be the one rendered).
   */
  selectedDates: PropTypes.arrayOf(PropTypes.objectOf(Date)),

  /**
   * Optional. Type of date selection.
   */
  selectionType: PropTypes.oneOf(['normal', 'range']),
};

export default Days;
