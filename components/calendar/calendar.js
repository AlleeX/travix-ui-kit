import React from 'react';
import { getClassNamesWithMods, getDataAttributes } from '../_helpers';
import DaysPanel from './panels/days';
import calendarConstants from './constants/calendar';

const {
  CALENDAR_MOVE_TO_NEXT,
  CALENDAR_MOVE_TO_PREVIOUS,
  CALENDAR_SELECTION_TYPE_RANGE,
} = calendarConstants;

const { PropTypes } = React;

export default class Calendar extends React.Component {
  constructor(props) {
    const { initialDates, maxDate, minDate } = props;

    super();


    const maxLimit = maxDate ? new Date(maxDate) : null;
    const renderDate = (initialDates && initialDates.length) ? new Date(initialDates[0]) : new Date();
    const selectedDates = initialDates.map(item => (item ? new Date(item) : null));

    let minLimit = minDate ? new Date(minDate) : null;

    /**
     * If a minDate or a maxDate is set, let's check if any selectedDates are outside of the boundaries.
     * If so, resets the selectedDates.
     * Otherwise, verifies if
     */
    if (minLimit || maxLimit) {
      const isAnyDateOutOfLimit = selectedDates.some(item => (
        item && (
          (minLimit && (minLimit.getTime() > item.getTime())) ||
          (maxLimit && (maxLimit.getTime() < item.getTime()))
        )
      ));

      if (isAnyDateOutOfLimit) {
        selectedDates.splice(0, 2);
        console.warn(`A calendar instance contains a selectedDate outside of the minDate and maxDate boundaries`); // eslint-disable-line
      }
    }

    /** If initialDates is defined and we have a start date, we want to set it as the minLimit */
    if (selectedDates[0]) {
      minLimit = selectedDates[0];
    }

    /**
     * If a maxDate is defined, let's set the date object to the maximum (date and time) of that date.
     */
    if (maxLimit) {
      maxLimit.setHours(23);
      maxLimit.setMinutes(59);
      maxLimit.setSeconds(59);
    }

    /**
     * If a minDate is defined, let's set the date object to the minium (date and time) of that date.
     */
    if (minLimit) {
      minLimit.setHours(0);
      minLimit.setMinutes(0);
      minLimit.setSeconds(0);
    }

    this.state = {
      maxLimit,
      minLimit,
      renderDate,
      selectedDates,
    };

    this.moveToMonth = this.moveToMonth.bind(this);
  }

  /**
   * Changes the renderDate of the calendar to the previous or next month.
   * Also triggers the onNavPreviousMonth/onNavNextMonth when the state gets changed
   * and passes the new date to it.
   *
   * @method moveToMonth
   * @param {String} direction Defines to which month is the calendar moving (previous or next).
   * @return {undefined}
   */
  moveToMonth(direction) {
    const { onNavNextMonth, onNavPreviousMonth } = this.props;

    this.setState(({ renderDate }) => {
      renderDate.setMonth(renderDate.getMonth() + (direction === CALENDAR_MOVE_TO_PREVIOUS ? -1 : 1));
      return { renderDate };
    }, () => {
      if ((direction === CALENDAR_MOVE_TO_PREVIOUS) && onNavPreviousMonth) {
        onNavPreviousMonth(this.state.renderDate);
      } else if (onNavNextMonth) {
        onNavNextMonth(this.state.renderDate);
      }
    });
  }

  /**
   * Handler for the day's selection. Passed to the DaysPanel -> DaysView.
   * Also triggers the onSelectDay function (when passed) after the state is updated,
   * passing the selectedDates array to it.
   *
   * @method onSelectDay
   * @param {Date} dateSelected Date selected by the user.
   * @return {undefined}
   */
  onSelectDay(dateSelected) {
    const { onSelectDay, selectionType } = this.props;

    this.setState((prevState) => {
      let { minLimit, renderDate, selectedDates } = prevState;

      /**
       * If the calendar's selectionType is 'normal', we always set the date selected
       * to the first position of the selectedDates array.
       * If the selectionType is 'range', we need to verify the following requirements:
       *
       *   - If there's no start date selected, then the selected date becomes the start
       * date and the minLimit becomes that same date. Prevents the range selection to the past.
       *
       *   - If there's a start date already selected:
       *
       *     - If there's no end date selected, then the selected date becomes the end date. Also
       * if the start and end dates are the same, it will remove the minLimit as the layout renders
       * them as a 'normal' selection.
       *
       *     - If there's an end date selected and the user is clicking on the start date again, it
       * clears the selections and the limits, resetting the range.
       */
      if (selectionType === CALENDAR_SELECTION_TYPE_RANGE) {
        if (selectedDates[0]) {
          if (!selectedDates[1]) {
            selectedDates[1] = dateSelected;
            if (selectedDates[0].toDateString() === selectedDates[1].toDateString()) {
              minLimit = null;
            }
          } else if (selectedDates[0] && selectedDates[0].toDateString() === dateSelected.toDateString()) {
            selectedDates = [null, null];
            minLimit = null;
          }
        } else {
          selectedDates[0] = dateSelected;
          minLimit = dateSelected;
          selectedDates[1] = null;
        }
      } else {
        selectedDates[0] = dateSelected;
      }

      /**
       * If the user selects a day of the previous or next month, the rendered month switches to
       * the one of the selected date.
       */
      if (dateSelected.getMonth() !== renderDate.getMonth()) {
        renderDate = new Date(dateSelected.toDateString());
      }

      return {
        minLimit,
        renderDate,
        selectedDates,
      };
    }, () => {
      if (onSelectDay) {
        onSelectDay(this.state.selectedDates);
      }
    });
  }

  render() {
    const { dataAttrs, isDaySelectableFn, locale, mods, selectionType } = this.props;
    const { maxLimit, minLimit, renderDate, selectedDates } = this.state;

    const restProps = getDataAttributes(dataAttrs);
    const className = getClassNamesWithMods('ui-calendar', mods);

    return (
      <div className={className} {...restProps}>
        <DaysPanel
          isDaySelectableFn={isDaySelectableFn}
          locale={locale}
          maxDate={maxLimit}
          minDate={minLimit}
          onNavNextMonth={() => this.moveToMonth(CALENDAR_MOVE_TO_NEXT)}
          onNavPreviousMonth={() => this.moveToMonth(CALENDAR_MOVE_TO_PREVIOUS)}
          onSelectDay={dt => this.onSelectDay(dt)}
          renderDate={renderDate}
          selectedDates={selectedDates}
          selectionType={selectionType}
        />
      </div>
    );
  }
}

Calendar.defaultProps = {
  dataAttrs: {},
  mods: [],
  selectionType: 'normal',
};

Calendar.propTypes = {
  /**
   * Data attribute. You can use it to set up GTM key or any custom data-* attribute
   */
  dataAttrs: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),

  /**
   * Optional. Initial value of the calendar. Defaults to the current date as per the locale.
   */
  initialDates: PropTypes.array,

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
   * Sets the max date boundary. Defaults to `null`.
   */
  maxDate: PropTypes.string,

  /**
   * Sets the min date boundary. Defaults to `null`.
   */
  minDate: PropTypes.string,

  /**
   * You can provide set of custom modifications.
   */
  mods: PropTypes.arrayOf(PropTypes.string),

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
   * Optional. Type of date selection.
   */
  selectionType: PropTypes.oneOf(['normal', 'range']),
};
