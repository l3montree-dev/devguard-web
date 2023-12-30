import React, { FunctionComponent, useEffect, useState } from "react";

interface Props {
  date: Date;
}
const DateString: FunctionComponent<Props> = ({ date }) => {
  const [dateString, setDateString] = useState(date.toDateString());

  useEffect(() => {
    setDateString(date.toLocaleDateString());
  }, [date]);
  return dateString;
};

export default DateString;
