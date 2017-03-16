import React, { PropTypes } from 'react';
import { getClassNamesWithMods } from '../../_helpers';
import DaysView from '../views/days';

class Days extends React.Component {
  render() {
    const { hide } = this.props;

    const extraClasses = [];

    /**
     * If a property 'hide' is passed to the panel, it will add the modifier to hide it.
     */
    if (hide) {
      extraClasses.push('hidden');
    }
    const className = getClassNamesWithMods('ui-calendar-days-panel', extraClasses);

    return <div className={className}><DaysView {...this.props} /></div>;
  }
}

Days.propTypes = {
  /**
   * Optional. Flag to determine if the panel should be hidden or not. Defaults to false.
   */
  hide: PropTypes.bool,
};

export default Days;
